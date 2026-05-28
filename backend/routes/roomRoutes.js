import express from 'express';
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  getUserRooms,
} from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Specific routes first (before param routes)
router.get('/user/my-rooms', authMiddleware, getUserRooms);
router.post('/join-room', authMiddleware, joinRoom);

// General routes after specific ones
router.post('/', authMiddleware, createRoom);
router.get('/', authMiddleware, getRooms);
router.get('/:id', authMiddleware, getRoomById);
router.put('/:id', authMiddleware, updateRoom);
router.delete('/:id', authMiddleware, deleteRoom);
router.post('/:id/leave', authMiddleware, leaveRoom);

export default router;
