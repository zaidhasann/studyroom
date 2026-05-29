import Room from '../models/Room.js';
import User from '../models/User.js';
import File from '../models/File.js';
import bcryptjs from 'bcryptjs';

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createRoom = async (req, res) => {
  try {
    const { roomName, description, category, maxMembers, password } = req.body;

    if (!roomName) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    // Check if room name already exists
    const existingRoom = await Room.findOne({ roomName: roomName.trim() });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room name already taken. Please choose a different name.' });
    }

    const roomCode = generateRoomCode();
    let hashedPassword = null;

    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashedPassword = await bcryptjs.hash(password, salt);
    }

    const room = new Room({
      roomName: roomName.trim(),
      description: description || '',
      category: category || 'General',
      maxMembers: maxMembers || 20,
      password: hashedPassword,
      roomCode,
      createdBy: req.user._id,
      participants: [req.user._id],
    });

    await room.save();

    // Add room to user's joined rooms
    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedRooms: room._id },
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email');

    res.status(201).json({
      message: 'Room created successfully',
      room: populatedRoom,
    });
  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({ 
      message: 'Room creation failed', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    const { roomName, description, category, maxMembers, password } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only room creator can edit' });
    }

    if (roomName) room.roomName = roomName;
    if (description !== undefined) room.description = description;
    if (category) room.category = category;
    if (maxMembers) room.maxMembers = maxMembers;
    
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      room.password = await bcryptjs.hash(password, salt);
    } else if (password === '') {
      room.password = null;
    }

    await room.save();

    const updatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email');

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

    // Remove room from all users' joinedRooms
    await User.updateMany(
      { joinedRooms: room._id },
      { $pull: { joinedRooms: room._id } }
    );

    // Delete the room
    await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed', error: error.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomCode, password } = req.body;

    if (!roomCode) {
      return res.status(400).json({ message: 'Room code is required' });
    }

    const room = await Room.findOne({ roomCode, isActive: true });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if password is required and validate
    if (room.password) {
      if (!password) {
        return res.status(403).json({ message: 'This room requires a password' });
      }
      const isPasswordValid = await bcryptjs.compare(password, room.password);
      if (!isPasswordValid) {
        return res.status(403).json({ message: 'Invalid password' });
      }
    }

    // Check max members
    if (room.participants.length >= room.maxMembers) {
      return res.status(400).json({ message: 'Room is full' });
    }

    if (room.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a participant in this room' });
    }

    room.participants.push(req.user._id);
    await room.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedRooms: room._id },
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email');

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

export const uploadFile = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { fileType, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is in the room
    if (!room.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are not a participant in this room' });
    }

    // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll store file metadata and assume file is saved locally
    const fileUrl = `/uploads/${req.file.filename}`;

    const file = new File({
      fileName: req.file.originalname,
      fileType: fileType || 'document',
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      room: roomId,
      uploadedBy: req.user._id,
      description: description || '',
    });

    await file.save();
    room.files.push(file._id);
    await room.save();

    const populatedFile = await file.populate('uploadedBy', 'name email');

    res.status(201).json({
      message: 'File uploaded successfully',
      file: populatedFile,
    });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const files = await File.find({ room: roomId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch files', error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user is the uploader or room creator
    const room = await Room.findById(file.room);
    if (
      file.uploadedBy.toString() !== req.user._id.toString() &&
      room.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    // Remove file from room's files array
    await Room.findByIdAndUpdate(file.room, {
      $pull: { files: fileId },
    });

    await File.findByIdAndDelete(fileId);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { roomId, memberId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is room creator
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only room creator can remove members' });
    }

    // Prevent removing the creator
    if (memberId === room.createdBy.toString()) {
      return res.status(400).json({ message: 'Cannot remove room creator' });
    }

    // Remove member from room
    room.participants = room.participants.filter(
      (p) => p.toString() !== memberId
    );
    await room.save();

    // Remove room from user's joined rooms
    await User.findByIdAndUpdate(memberId, {
      $pull: { joinedRooms: roomId },
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email');

    res.status(200).json({
      message: 'Member removed successfully',
      room: populatedRoom,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
};
