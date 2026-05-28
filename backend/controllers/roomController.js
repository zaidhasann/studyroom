import Room from '../models/Room.js';
import User from '../models/User.js';

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createRoom = async (req, res) => {
  try {
    const { roomName, description } = req.body;

    if (!roomName) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const roomCode = generateRoomCode();

    const room = new Room({
      roomName,
      description: description || '',
      roomCode,
      createdBy: req.user._id,
      participants: [req.user._id],
    });

    await room.save();

    // Add room to user's joined rooms
    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedRooms: room._id },
    });

    const populatedRoom = await room.populate('createdBy', 'name email').populate('participants', 'name email');

    res.status(201).json({
      message: 'Room created successfully',
      room: populatedRoom,
    });
  } catch (error) {
    res.status(500).json({ message: 'Room creation failed', error: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true })
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .populate('activeSession');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ room });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch room', error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { roomName, description } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only room creator can edit' });
    }

    if (roomName) room.roomName = roomName;
    if (description !== undefined) room.description = description;

    await room.save();

    const updatedRoom = await room.populate('createdBy', 'name email').populate('participants', 'name email');

    res.status(200).json({
      message: 'Room updated',
      room: updatedRoom,
    });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only room creator can delete' });
    }

    room.isActive = false;
    await room.save();

    res.status(200).json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed', error: error.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({ message: 'Room code is required' });
    }

    const room = await Room.findOne({ roomCode, isActive: true });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a participant in this room' });
    }

    room.participants.push(req.user._id);
    await room.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedRooms: room._id },
    });

    const populatedRoom = await room.populate('createdBy', 'name email').populate('participants', 'name email');

    res.status(200).json({
      message: 'Joined room successfully',
      room: populatedRoom,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join room', error: error.message });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.participants = room.participants.filter(
      (p) => p.toString() !== req.user._id.toString()
    );
    await room.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedRooms: room._id },
    });

    res.status(200).json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to leave room', error: error.message });
  }
};

export const getUserRooms = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('joinedRooms');

    res.status(200).json({ rooms: user.joinedRooms });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user rooms', error: error.message });
  }
};
