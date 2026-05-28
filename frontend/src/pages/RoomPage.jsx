import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomAPI, messageAPI } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import ChatBox from '../components/ChatBox';
import SessionTimer from '../components/SessionTimer';
import SessionControls from '../components/SessionControls';
import Toast from '../components/Toast';
import { formatDatetime, formatStudyTime } from '../utils/formatters';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
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
      <div className="bg-dark-800/50 backdrop-blur-md border-b border-dark-600 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-maroon-400">{room?.roomName}</h1>
            <p className="text-sm text-gray-400">Code: <span className="text-maroon-400 font-mono font-semibold">{room?.roomCode}</span></p>
          </div>
          <button onClick={handleLeaveRoom} className="btn-danger">
            Leave Room
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 pb-12">
        {/* Left Panel - Participants */}
        <div className="lg:col-span-1 order-3 lg:order-1">
          <div className="card sticky top-4">
            <h2 className="font-bold mb-4 text-maroon-400">Participants ({roomUsers.length || 0})</h2>
            <div className="space-y-2">
              {roomUsers.length === 0 ? (
                <p className="text-sm text-gray-500">No participants yet</p>
              ) : (
                roomUsers.map((user) => (
                  <div key={user.userId} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{user.userName}</span>
                  </div>
                ))
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
          <div className="card sticky top-4">
            <h2 className="font-bold mb-4">Room Info</h2>
            <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
