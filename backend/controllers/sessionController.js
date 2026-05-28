import Session from '../models/Session.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

export const startSession = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is in the room
    if (!room.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a participant in this room' });
    }

    // Create new session
    const session = new Session({
      roomId,
      startedBy: req.user._id,
      startTime: new Date(),
      participants: [
        {
          userId: req.user._id,
          joinedAt: new Date(),
        },
      ],
    });

    await session.save();
    room.activeSession = session._id;
    await room.save();

    const populatedSession = await session.populate('startedBy', 'name email');

    res.status(201).json({
      message: 'Session started',
      session: populatedSession,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start session', error: error.message });
  }
};

export const pauseSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.startedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only session starter can pause' });
    }

    session.isPaused = true;
    session.pausedAt = new Date();
    await session.save();

    res.status(200).json({
      message: 'Session paused',
      session,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to pause session', error: error.message });
  }
};

export const resumeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.startedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only session starter can resume' });
    }

    session.isPaused = false;
    session.pausedAt = null;
    await session.save();

    res.status(200).json({
      message: 'Session resumed',
      session,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resume session', error: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.startedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only session starter can end' });
    }

    session.endTime = new Date();
    const durationMs = session.endTime - session.startTime;
    session.duration = Math.floor(durationMs / 60000); // Convert to minutes

    await session.save();

    // Update user's total study time
    const participants = session.participants.map((p) => p.userId);
    await User.updateMany(
      { _id: { $in: participants } },
      { $inc: { totalStudyTime: session.duration } }
    );

    // Clear active session from room
    await Room.findByIdAndUpdate(
      session.roomId,
      { activeSession: null }
    );

    res.status(200).json({
      message: 'Session ended',
      session: {
        ...session.toObject(),
        duration: session.duration,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to end session', error: error.message });
  }
};

export const getSessionHistory = async (req, res) => {
  try {
    const { roomId } = req.params;

    const sessions = await Session.find({ roomId })
      .populate('startedBy', 'name email')
      .sort({ startTime: -1 });

    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
};

export const addParticipantToSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user already in session
    const alreadyAdded = session.participants.some(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (alreadyAdded) {
      return res.status(400).json({ message: 'User already in session' });
    }

    session.participants.push({
      userId: req.user._id,
      joinedAt: new Date(),
    });

    await session.save();

    res.status(200).json({
      message: 'Added to session',
      session,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to session', error: error.message });
  }
};
