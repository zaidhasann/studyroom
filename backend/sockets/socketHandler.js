import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

const userSockets = new Map(); // userId -> socketId

export const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication failed'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} - ${socket.id}`);
    userSockets.set(socket.userId, socket.id);

    // User joins a room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      io.to(roomId).emit('user-joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date(),
      });
      console.log(`User ${socket.userName} joined room ${roomId}`);
    });

    // User leaves a room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      io.to(roomId).emit('user-left', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date(),
      });
      console.log(`User ${socket.userName} left room ${roomId}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
      const { roomId, message } = data;
      
      try {
        // Save message to database
        const newMessage = new Message({
          roomId,
          sender: socket.userId,
          senderName: socket.userName,
          message,
        });
        
        await newMessage.save();
        
        // Emit to room
        io.to(roomId).emit('new-message', {
          roomId,
          sender: socket.userId,
          senderName: socket.userName,
          message,
          timestamp: newMessage.createdAt,
        });
        
        console.log(`Message saved from ${socket.userName} in room ${roomId}`);
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('message-error', { message: 'Failed to save message' });
      }
    });

    // Start session
    socket.on('session-started', (data) => {
      const { roomId, sessionId } = data;
      io.to(roomId).emit('session-started', {
        roomId,
        sessionId,
        startedBy: socket.userName,
        timestamp: new Date(),
      });
    });

    // Pause session
    socket.on('session-paused', (data) => {
      const { roomId, sessionId } = data;
      io.to(roomId).emit('session-paused', {
        roomId,
        sessionId,
        timestamp: new Date(),
      });
    });

    // Resume session
    socket.on('session-resumed', (data) => {
      const { roomId, sessionId } = data;
      io.to(roomId).emit('session-resumed', {
        roomId,
        sessionId,
        timestamp: new Date(),
      });
    });

    // End session
    socket.on('session-ended', (data) => {
      const { roomId, sessionId, duration } = data;
      io.to(roomId).emit('session-ended', {
        roomId,
        sessionId,
        duration,
        timestamp: new Date(),
      });
    });

    // Timer update
    socket.on('timer-update', (data) => {
      const { roomId, elapsed } = data;
      io.to(roomId).emit('timer-update', {
        roomId,
        elapsed,
        timestamp: new Date(),
      });
    });

    // Typing indicator
    socket.on('user-typing', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user-typing', {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on('user-stopped-typing', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user-stopped-typing', {
        userId: socket.userId,
      });
    });

    // Whiteboard drawing events
    socket.on('draw', (data) => {
      const { roomId, x0, y0, x1, y1, color, size } = data;
      socket.to(roomId).emit('draw', {
        userId: socket.userId,
        userName: socket.userName,
        x0,
        y0,
        x1,
        y1,
        color,
        size,
      });
    });

    socket.on('clear-canvas', (data) => {
      const { roomId } = data;
      io.to(roomId).emit('clear-canvas', {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on('cursor-position', (data) => {
      const { roomId, x, y } = data;
      socket.to(roomId).emit('cursor-position', {
        userId: socket.userId,
        userName: socket.userName,
        x,
        y,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      userSockets.delete(socket.userId);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error from ${socket.userId}:`, error);
    });
  });
};

export const getUserSocket = (userId) => {
  return userSockets.get(userId);
};

export const isUserOnline = (userId) => {
  return userSockets.has(userId);
};
