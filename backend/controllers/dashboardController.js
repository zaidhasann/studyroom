import User from '../models/User.js';
import Room from '../models/Room.js';
import Session from '../models/Session.js';

export const getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get user's rooms
    const userRooms = await Room.find({ participants: req.user._id });

    // Get user's sessions
    const userSessions = await Session.find({
      'participants.userId': req.user._id,
      endTime: { $ne: null },
    });

    // Calculate stats
    const totalStudyTime = user.totalStudyTime;
    const sessionsCompleted = userSessions.length;
    const roomsJoined = userRooms.length;

    // Get recent activity
    const recentSessions = await Session.find({
      'participants.userId': req.user._id,
    })
      .populate('roomId', 'roomName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate weekly stats
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklySessions = await Session.find({
      'participants.userId': req.user._id,
      createdAt: { $gte: sevenDaysAgo },
      endTime: { $ne: null },
    });

    const weeklyStudyTime = weeklySessions.reduce((sum, session) => sum + session.duration, 0);

    res.status(200).json({
      stats: {
        totalStudyTime,
        sessionsCompleted,
        roomsJoined,
        weeklyStudyTime,
        totalRoomsCreated: (
          await Room.find({ createdBy: req.user._id })
        ).length,
      },
      recentActivity: recentSessions,
      activeRooms: userRooms.filter((room) => room.isActive),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const sessions = await Session.find({
      'participants.userId': req.user._id,
    })
      .populate('roomId', 'roomName')
      .sort({ createdAt: -1 });

    const rooms = await Room.find({ participants: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      activity: {
        sessions,
        rooms,
        user: {
          name: user.name,
          totalStudyTime: user.totalStudyTime,
          joinedAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity', error: error.message });
  }
};
