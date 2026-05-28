import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI, roomAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import { formatStudyTime } from '../utils/formatters';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({ roomName: '', description: '' });
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

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
    try {
      const response = await roomAPI.createRoom(roomForm.roomName, roomForm.description);
      setRoomCode(response.data.room.roomCode);
      addToast('Room created successfully!', 'success');
      setRoomForm({ roomName: '', description: '' });
      loadDashboard();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create room', 'error');
    }
  };

  const handleJoinRoom = async (code) => {
    try {
      await roomAPI.joinRoom(code);
      addToast('Joined room successfully!', 'success');
      loadDashboard();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to join room', 'error');
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
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="text-3xl font-bold text-maroon-400">
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

        {/* Create/Join Room */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Create Room Form */}
          <div className="card md:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-maroon-400">Create New Room</h2>
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
              <button type="submit" className="btn-primary w-full">
                Create Room
              </button>
            </form>
          </div>

          {/* Join Room */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-maroon-400">Join Room</h2>
            <p className="text-gray-400 text-sm mb-4">
              Ask a friend for their room code to join their study session.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleJoinRoom(joinRoomCode); }} className="space-y-3">
              <input
                type="text"
                placeholder="Enter room code"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                className="input-field"
                maxLength="6"
              />
              <button type="submit" className="btn-primary w-full" disabled={!joinRoomCode.trim()}>
                Join Room
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
            <h2 className="text-xl font-bold text-maroon-400">Your Rooms</h2>
          </div>
          <div className="divide-y divide-dark-600">
            {rooms.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No rooms yet. Create or join a room to get started!
              </div>
            ) : (
              rooms.map((room) => (
                <div key={room._id} className="p-6 hover:bg-dark-600/50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-maroon-400">{room.roomName}</h3>
                      <p className="text-sm text-gray-400 mt-1">{room.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Code: <span className="font-mono font-bold text-maroon-400">{room.roomCode}</span>
                      </p>
                    </div>
                    <Link
                      to={`/room/${room._id}`}
                      className="btn-primary"
                    >
                      Enter Room
                    </Link>
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
