import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI, roomAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import { formatStudyTime } from '../utils/formatters';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user, loginTime } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [sessionElapsed, setSessionElapsed] = useState('00:00:00');
  const [isStopped, setIsStopped] = useState(false);
  const [stoppedTime, setStoppedTime] = useState(0);

  // Load timer state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stopped = localStorage.getItem('timerStopped') === 'true';
      const stopped_time = localStorage.getItem('stoppedTime');
      setIsStopped(stopped);
      if (stopped_time) setStoppedTime(parseInt(stopped_time));
    }
  }, []);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({ 
    roomName: '', 
    description: '',
    category: 'General',
    maxMembers: 20,
    password: ''
  });
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinRoomPassword, setJoinRoomPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  const categories = ['Math', 'Science', 'Literature', 'History', 'Languages', 'Programming', 'Arts', 'General'];

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!loginTime) return;

    const updateTimer = () => {
      let diff;
      if (isStopped) {
        diff = stoppedTime;
      } else {
        const now = Date.now();
        diff = now - loginTime;
      }
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setSessionElapsed(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [loginTime, isStopped, stoppedTime]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, roomsRes] = await Promise.all([
        dashboardAPI.getDashboardStats(),
        roomAPI.getUserRooms(),
      ]);
      setStats(statsRes.data.stats);
      setRooms(roomsRes.data.rooms || []);
    } catch (error) {
      addToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!roomForm.roomName.trim()) {
      addToast('Room name is required', 'error');
      return;
    }

    try {
      console.log('Creating room with data:', roomForm);
      const response = await roomAPI.createRoom(
        roomForm.roomName, 
        roomForm.description,
        roomForm.category,
        roomForm.maxMembers,
        roomForm.password || undefined
      );
      
      console.log('Room creation response status:', response.status);
      console.log('Room creation response data:', response.data);
      
      // Accept 200 or 201 as success
      const isSuccess = response.status === 201 || response.status === 200;
      const hasRoom = response.data && (response.data.room || response.data.data?.room);
      
      if (isSuccess && hasRoom) {
        const room = response.data.room || response.data.data.room;
        setRoomCode(room.roomCode);
        addToast('Room created successfully!', 'success');
        setRoomForm({ roomName: '', description: '', category: 'General', maxMembers: 20, password: '' });
        
        // Refresh rooms list silently after a short delay
        setTimeout(async () => {
          try {
            const roomsRes = await roomAPI.getUserRooms();
            setRooms(roomsRes.data.rooms || []);
            console.log('Rooms refreshed:', roomsRes.data.rooms);
          } catch (error) {
            console.error('Failed to refresh rooms:', error);
          }
        }, 500);
      } else {
        console.error('Invalid response:', { isSuccess, hasRoom, response });
        addToast('Room created but response validation failed', 'warning');
      }
    } catch (error) {
      console.error('Create room error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        fullError: error
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create room';
      addToast(errorMessage, 'error');
    }
  };

  const handleJoinRoom = async (code, password = null) => {
    try {
      setJoinLoading(true);
      const response = await roomAPI.joinRoom(code, password);
      
      if (response.data.room) {
        addToast('Joined room successfully!', 'success');
        setJoinRoomCode('');
        setJoinRoomPassword('');
        
        // Refresh rooms list silently after a short delay
        setTimeout(async () => {
          try {
            const roomsRes = await roomAPI.getUserRooms();
            setRooms(roomsRes.data.rooms || []);
          } catch (error) {
            console.error('Failed to refresh rooms:', error);
          }
        }, 1000);
      } else {
        addToast('Failed to join room', 'error');
      }
    } catch (error) {
      console.error('Join room error:', error);
      if (error.response?.status === 403 && error.response?.data?.message?.includes('password')) {
        addToast('This room requires a password', 'info');
      } else {
        addToast(error.response?.data?.message || 'Failed to join room', 'error');
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId, roomName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the room "${roomName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await roomAPI.deleteRoom(roomId);
      addToast('Room deleted successfully', 'success');
      
      // Refresh rooms list
      const roomsRes = await roomAPI.getUserRooms();
      setRooms(roomsRes.data.rooms || []);
    } catch (error) {
      console.error('Delete room error:', error);
      addToast(error.response?.data?.message || 'Failed to delete room', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-premium py-12 px-4">
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto">
        <h1 className="section-title">Welcome back, {user?.name}!</h1>

        {/* Statistics */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <div className={`card ${isStopped ? 'border-gray-500/50 bg-dark-800/50' : ''}`}>
              <div className={`text-3xl font-bold font-mono flex items-center justify-between ${isStopped ? 'text-gray-400' : 'text-blue-400'}`}>
                {sessionElapsed}
                {isStopped && <span className="text-lg">⏸️</span>}
              </div>
              <p className={`mt-2 ${isStopped ? 'text-gray-500' : 'text-gray-400'}`}>
                {isStopped ? 'Session Paused' : 'Current Session'}
              </p>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-indigo-400">
                {formatStudyTime(stats.totalStudyTime)}
              </div>
              <p className="text-gray-400 mt-2">Total Study Time</p>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-green-400">{stats.sessionsCompleted}</div>
              <p className="text-gray-400 mt-2">Sessions Completed</p>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-purple-400">{stats.roomsJoined}</div>
              <p className="text-gray-400 mt-2">Rooms Joined</p>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-orange-400">
                {formatStudyTime(stats.weeklyStudyTime)}
              </div>
              <p className="text-gray-400 mt-2">This Week</p>
            </div>
          </div>
        )}

        {/* Quick Link to Activity & Analytics */}
        <div className="mb-8">
          <Link
            to="/activity"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-semibold text-white transition-all shadow-lg"
          >
            📊 View Detailed Analytics & History
          </Link>
        </div>

        {/* Create/Join Room */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Create Room Form */}
          <div className="card md:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-indigo-400">Create New Room</h2>
            {roomCode && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400">Room Code:</p>
                <p className="text-2xl font-bold text-green-400 font-mono">{roomCode}</p>
                <p className="text-xs text-gray-500 mt-2">Share this code with friends to invite them</p>
              </div>
            )}
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <input
                type="text"
                placeholder="Room Name"
                value={roomForm.roomName}
                onChange={(e) => setRoomForm({ ...roomForm, roomName: e.target.value })}
                required
                className="input-field"
              />
              <textarea
                placeholder="Description (optional)"
                value={roomForm.description}
                onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                rows="2"
                className="input-field resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={roomForm.category}
                  onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Max Members"
                  value={roomForm.maxMembers}
                  onChange={(e) => setRoomForm({ ...roomForm, maxMembers: parseInt(e.target.value) })}
                  min="2"
                  max="100"
                  className="input-field"
                />
              </div>
              <div className="relative">
                <input
                  type={showCreatePassword ? 'text' : 'password'}
                  placeholder="Password (optional)"
                  value={roomForm.password}
                  onChange={(e) => setRoomForm({ ...roomForm, password: e.target.value })}
                  className="input-field"
                />
                {roomForm.password && (
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-3 text-gray-500 text-sm"
                  >
                    {showCreatePassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary w-full">
                Create Room
              </button>
            </form>
          </div>

          {/* Join Room */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-indigo-400">Join Room</h2>
            <p className="text-gray-400 text-sm mb-4">
              Ask a friend for their room code to join their study session.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleJoinRoom(joinRoomCode, joinRoomPassword || undefined); }} className="space-y-3">
              <input
                type="text"
                placeholder="Enter room code"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                className="input-field"
                maxLength="6"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (if required)"
                  value={joinRoomPassword}
                  onChange={(e) => setJoinRoomPassword(e.target.value)}
                  className="input-field"
                />
                {joinRoomPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 text-sm"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                className="btn-primary w-full" 
                disabled={!joinRoomCode.trim() || joinLoading}
              >
                {joinLoading ? 'Joining...' : 'Join Room'}
              </button>
            </form>
            <div className="mt-4 pt-4 border-t border-dark-600">
              <Link to="/rooms" className="btn-secondary w-full text-center block">
                Browse Rooms
              </Link>
            </div>
          </div>
        </div>

        {/* Active Rooms */}
        <div className="card">
          <div className="pb-6 border-b border-dark-600">
            <h2 className="text-xl font-bold text-indigo-400">Your Rooms</h2>
          </div>
          <div className="divide-y divide-dark-600">
            {rooms.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No rooms yet. Create or join a room to get started!
              </div>
            ) : (
              rooms.map((room) => (
                <div key={room._id} className="p-6 hover:bg-dark-600/50 transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-indigo-400">{room.roomName}</h3>
                        <span className="text-xs bg-indigo-400/20 text-indigo-400 px-2 py-1 rounded">
                          {room.category}
                        </span>
                        {room.password && <span className="text-lg">🔒</span>}
                        {room.createdBy?._id === user?._id && (
                          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded font-semibold">
                            👑 Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{room.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-2">
                        <span>Code: <span className="font-mono font-bold text-indigo-400">{room.roomCode}</span></span>
                        <span>Members: {room.participants?.length || 0}/{room.maxMembers}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/room/${room._id}`}
                        className="btn-primary"
                      >
                        Enter Room
                      </Link>
                      {room.createdBy?._id === user?._id && (
                        <button
                          onClick={() => handleDeleteRoom(room._id, room.roomName)}
                          className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/50 rounded-lg transition-colors font-semibold text-sm"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
