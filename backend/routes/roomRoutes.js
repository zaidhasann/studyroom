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
  uploadFile,
  getFiles,
  deleteFile,
  removeMember,
} from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Specific routes first (before param routes)
router.get('/user/my-rooms', authMiddleware, getUserRooms);
router.post('/join-room', authMiddleware, joinRoom);
router.post('/remove-member', authMiddleware, removeMember);

// General routes after specific ones
router.post('/', authMiddleware, createRoom);
router.get('/', authMiddleware, getRooms);
router.get('/:id', authMiddleware, getRoomById);
router.put('/:id', authMiddleware, updateRoom);
router.delete('/:id', authMiddleware, deleteRoom);
router.post('/:id/leave', authMiddleware, leaveRoom);

// File routes
router.post('/:roomId/files/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/:roomId/files', authMiddleware, getFiles);
router.delete('/files/:fileId', authMiddleware, deleteFile);

export default router;
