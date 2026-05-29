import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomAPI, messageAPI } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import ChatBox from '../components/ChatBox';
import SessionTimer from '../components/SessionTimer';
import SessionControls from '../components/SessionControls';
import Toast from '../components/Toast';
import RoomSettings from '../components/RoomSettings';
import SharedFiles from '../components/SharedFiles';
import Whiteboard from '../components/Whiteboard';
import { formatDatetime, formatStudyTime } from '../utils/formatters';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const { user } = useAuth();
  const { joinRoom, leaveRoom, roomUsers, setRoomUsers, setMessages } = useSocket();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessagesState] = useState([]);

  useEffect(() => {
    loadRoom();
    joinRoom(roomId);
    loadMessages();

    return () => {
      leaveRoom(roomId);
    };
  }, [roomId]);

  const loadRoom = async () => {
    try {
      const response = await roomAPI.getRoomById(roomId);
      setRoom(response.data.room);
      if (response.data.room.activeSession) {
        setCurrentSession(response.data.room.activeSession);
        setIsSessionActive(true);
      }
    } catch (error) {
      addToast('Failed to load room', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await messageAPI.getMessages(roomId);
      setMessagesState(response.data.messages);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await roomAPI.leaveRoom(roomId);
      addToast('Left room', 'success');
      navigate('/dashboard');
    } catch (error) {
      addToast('Failed to leave room', 'error');
    }
  };

  const handleSessionChange = (action, data) => {
    if (action === 'started') {
      setCurrentSession(data);
      setIsSessionActive(true);
      addToast('Session started!', 'success');
    } else if (action === 'paused') {
      addToast('Session paused', 'info');
    } else if (action === 'resumed') {
      addToast('Session resumed', 'info');
    } else if (action === 'ended') {
      setCurrentSession(null);
      setIsSessionActive(false);
      addToast('Session ended', 'success');
      loadRoom();
    }
  };

  const handleRemoveParticipant = async (participantId, participantName) => {
    if (!window.confirm(`Remove ${participantName} from the room?`)) {
      return;
    }

    try {
      await roomAPI.removeMember(roomId, participantId);
      addToast(`${participantName} has been removed from the room`, 'success');
      loadRoom();
    } catch (error) {
      console.error('Failed to remove participant:', error);
      addToast('Failed to remove participant', 'error');
    }
  };

  const isAdmin = user && room?.createdBy._id === user.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-premium">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-premium">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div className="bg-dark-900/80 backdrop-blur-xl border-b border-indigo-500/10 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-400">{room?.roomName}</h1>
            <p className="text-sm text-gray-400">Code: <span className="text-indigo-400 font-mono font-semibold">{room?.roomCode}</span></p>
          </div>
          <button onClick={handleLeaveRoom} className="btn-danger">
            Leave Room
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 pb-12">
        {/* Left Panel - Participants & Active Users */}
        <div className="lg:col-span-1 order-3 lg:order-1 space-y-4">
          {/* Members Section */}
          <div className="card">
            <h2 className="font-bold mb-4 text-indigo-400 flex items-center justify-between">
              <span>Members ({room?.participants?.length || 0})</span>
              {isAdmin && <span className="text-xs bg-indigo-600/40 px-2 py-1 rounded text-indigo-300">Admin</span>}
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {room?.participants?.length === 0 ? (
                <p className="text-sm text-gray-500">No members yet</p>
              ) : (
                room?.participants?.map((participant) => {
                  const isCurrentUser = participant._id === user?.id;
                  const isOnline = roomUsers.some(u => u.userId === participant._id);
                  return (
                    <div
                      key={participant._id}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                        isCurrentUser
                          ? 'bg-indigo-500/20 border border-indigo-500/40'
                          : 'bg-gray-700/30 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-200">
                          {participant.name}
                          {isCurrentUser && <span className="text-xs text-indigo-400 ml-1">(You)</span>}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                      </div>
                      {isAdmin && !isCurrentUser && (
                        <button
                          onClick={() => handleRemoveParticipant(participant._id, participant.name)}
                          className="ml-auto px-2 py-1 text-xs rounded bg-red-500/20 hover:bg-red-500/40 text-red-400 font-semibold transition-all"
                          title="Remove participant"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Users Section */}
          <div className="card border border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <h2 className="font-bold mb-4 text-green-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Active Now ({roomUsers.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {roomUsers.length === 0 ? (
                <p className="text-sm text-gray-500">Nobody online</p>
              ) : (
                roomUsers.map((activeUser) => {
                  const memberInfo = room?.participants?.find(p => p._id === activeUser.userId);
                  const isCurrentUser = activeUser.userId === user?.id;
                  return (
                    <div
                      key={activeUser.userId}
                      className={`flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30 ${
                        isCurrentUser ? 'ring-2 ring-green-500/50' : ''
                      }`}
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-300 truncate">
                          {activeUser.userName}
                          {isCurrentUser && <span className="text-xs text-green-400 ml-1">(You)</span>}
                        </p>
                        {memberInfo?.email && <p className="text-xs text-gray-500 truncate">{memberInfo.email}</p>}
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-500/30 text-green-300 rounded-full font-semibold">Online</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Center Panel - Session & Timer */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="card mb-4">
            <h2 className="font-bold mb-4 text-center">Study Session</h2>
            <SessionTimer
              isRunning={isSessionActive}
              onTimerUpdate={() => {}}
              onEnd={() => {}}
            />
            <SessionControls
              roomId={roomId}
              sessionId={currentSession?._id}
              isSessionActive={isSessionActive}
              onSessionChange={handleSessionChange}
            />
          </div>

          {/* Chat */}
          <div className="card h-96 flex flex-col">
            <h2 className="font-bold mb-4">Room Chat</h2>
            <ChatBox roomId={roomId} />
          </div>
        </div>

        {/* Right Panel - Room Info */}
        <div className="lg:col-span-1 order-2 lg:order-3">
          <div className="card sticky top-4 space-y-4">
            <div>
              <h2 className="font-bold mb-4">Room Info</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Category</p>
                  <p className="text-sm mt-1 font-medium">{room?.category || 'General'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Max Members</p>
                  <p className="text-sm mt-1">{room?.participants?.length || 0} / {room?.maxMembers || 20}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Description</p>
                  <p className="text-sm mt-1">
                    {room?.description || 'No description provided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Created</p>
                  <p className="text-sm mt-1">{formatDatetime(room?.createdAt)}</p>
                </div>
                {room?.password && (
                  <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
                    <p className="text-xs text-yellow-700">🔒 Password protected</p>
                  </div>
                )}
                {room?.activeSession && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded">
                    <p className="text-xs text-green-700 font-medium">Session Active</p>
                    <p className="text-xs text-green-600 mt-1">
                      Started by: {room.activeSession.startedBy?.name || 'Unknown'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t">
              {isAdmin && (
                <RoomSettings
                  room={room}
                  onSettingsUpdate={loadRoom}
                  isCreator={true}
                />
              )}
              <SharedFiles roomId={roomId} />
              <Whiteboard roomId={roomId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
