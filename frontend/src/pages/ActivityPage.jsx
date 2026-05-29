import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { dashboardAPI, sessionAPI } from '../services/api';
import Toast from '../components/Toast';
import { formatDatetime, formatStudyTime } from '../utils/formatters';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ActivityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [filterRoom, setFilterRoom] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    loadActivity();
  }, []);

  useEffect(() => {
    filterAndSortSessions();
  }, [sessions, filterRoom, sortBy]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getUserActivity();
      setSessions(response.data.activity.sessions);
      calculateStats(response.data.activity.sessions);
    } catch (error) {
      console.error('Failed to load activity:', error);
      addToast('Failed to load activity history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessionList) => {
    if (sessionList.length === 0) {
      setStats({
        totalSessions: 0,
        totalStudyTime: 0,
        averageSessionDuration: 0,
        completedSessions: 0,
        rooms: [],
        categoryCounts: {},
        weeklyData: [],
      });
      return;
    }

    const completedSessions = sessionList.filter((s) => s.endTime);
    const totalStudyTime = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageSessionDuration = completedSessions.length > 0 
      ? Math.round(totalStudyTime / completedSessions.length) 
      : 0;

    // Count sessions by room
    const roomCounts = {};
    const categoryCounts = {};
    sessionList.forEach((session) => {
      if (session.roomId) {
        roomCounts[session.roomId.roomName] = (roomCounts[session.roomId.roomName] || 0) + 1;
      }
    });

    // Get weekly data (last 7 days)
    const weeklyData = getWeeklyStudyData(sessionList);

    setStats({
      totalSessions: sessionList.length,
      totalStudyTime,
      averageSessionDuration,
      completedSessions: completedSessions.length,
      rooms: Object.entries(roomCounts).map(([room, count]) => ({ room, count })),
      categoryCounts,
      weeklyData,
    });
  };

  const getWeeklyStudyData = (sessionList) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData = {};
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLabel = days[date.getDay()];
      dailyData[dayLabel] = 0;
    }

    sessionList.forEach((session) => {
      if (session.endTime) {
        const date = new Date(session.startTime);
        const dayLabel = days[date.getDay()];
        dailyData[dayLabel] = (dailyData[dayLabel] || 0) + (session.duration || 0);
      }
    });

    return Object.entries(dailyData).map(([day, duration]) => ({
      day,
      duration: Math.round(duration),
    }));
  };

  const filterAndSortSessions = () => {
    let filtered = [...sessions];

    if (filterRoom !== 'all') {
      filtered = filtered.filter((s) => s.roomId?.roomName === filterRoom);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    } else if (sortBy === 'duration-high') {
      filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (sortBy === 'duration-low') {
      filtered.sort((a, b) => (a.duration || 0) - (b.duration || 0));
    }

    setFilteredSessions(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-premium">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // Get unique room names for filter
  const uniqueRooms = [...new Set(sessions.map((s) => s.roomId?.roomName).filter(Boolean))];

  // Prepare chart data
  const weeklyChartData = {
    labels: stats?.weeklyData.map((d) => d.day) || [],
    datasets: [
      {
        label: 'Study Time (minutes)',
        data: stats?.weeklyData.map((d) => d.duration) || [],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const roomChartData = {
    labels: stats?.rooms.map((r) => r.room) || [],
    datasets: [
      {
        label: 'Sessions Count',
        data: stats?.rooms.map((r) => r.count) || [],
        backgroundColor: ['#6366F1', '#8B5CF6', '#0891B2', '#14B8A6', '#EC4899', '#F59E0B'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-premium py-12 px-4">
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-2">📊 Study Activity History</h1>
          <p className="text-gray-400">Track your study sessions and productivity analytics</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-dark-600">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'history'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            📋 Session History
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'analytics'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            📈 Analytics
          </button>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="card">
                <div className="text-4xl font-bold text-indigo-400 mb-2">{stats?.totalSessions || 0}</div>
                <p className="text-gray-400">Total Sessions</p>
              </div>
              <div className="card">
                <div className="text-4xl font-bold text-cyan-400 mb-2">
                  {Math.round((stats?.totalStudyTime || 0) / 60)}h
                </div>
                <p className="text-gray-400">Total Study Time</p>
              </div>
              <div className="card">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {stats?.averageSessionDuration || 0}m
                </div>
                <p className="text-gray-400">Average Duration</p>
              </div>
              <div className="card">
                <div className="text-4xl font-bold text-teal-400 mb-2">{stats?.completedSessions || 0}</div>
                <p className="text-gray-400">Completed Sessions</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Weekly Study Time */}
              <div className="card">
                <h2 className="text-xl font-bold text-indigo-400 mb-6">📅 Weekly Study Time</h2>
                {stats?.weeklyData && stats.weeklyData.length > 0 ? (
                  <Line data={weeklyChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </div>

              {/* Sessions by Room */}
              <div className="card">
                <h2 className="text-xl font-bold text-indigo-400 mb-6">🎓 Sessions by Room</h2>
                {stats?.rooms && stats.rooms.length > 0 ? (
                  <Bar data={roomChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                ) : (
                  <p className="text-gray-500 text-center py-8">No room data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Room</label>
                  <select
                    value={filterRoom}
                    onChange={(e) => setFilterRoom(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="all">All Rooms</option>
                    {uniqueRooms.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field w-full">
                    <option value="recent">Most Recent</option>
                    <option value="duration-high">Longest Duration</option>
                    <option value="duration-low">Shortest Duration</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sessions List */}
            {filteredSessions.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500 text-lg">No sessions found. Start studying!</p>
              </div>
            ) : (
              <div className="card divide-y divide-dark-600">
                {filteredSessions.map((session) => (
                  <div key={session._id} className="p-6 hover:bg-dark-600/50 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-indigo-400">
                          {session.roomId?.roomName || 'Unknown Room'}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Started by{' '}
                          <span className="text-cyan-400 font-semibold">
                            {session.startedBy?.name || 'Unknown User'}
                          </span>
                        </p>
                      </div>
                      {session.endTime ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                          ✓ Completed
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                          ⏳ In Progress
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Start Time</p>
                        <p className="text-gray-300 font-semibold">{formatDatetime(session.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">End Time</p>
                        <p className="text-gray-300 font-semibold">
                          {session.endTime ? formatDatetime(session.endTime) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="text-gray-300 font-semibold">
                          {session.duration ? `${session.duration} min` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Participants</p>
                        <p className="text-gray-300 font-semibold">{session.participants?.length || 0} people</p>
                      </div>
                    </div>

                    {session.participants && session.participants.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-dark-500">
                        <p className="text-sm text-gray-400 mb-2">Participants:</p>
                        <div className="flex flex-wrap gap-2">
                          {session.participants.map((p) => (
                            <span key={p._id} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs">
                              {p.userId?.name || 'Unknown'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
