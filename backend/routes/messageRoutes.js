import express from 'express';
import {
  getMessages,
  sendMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/:roomId', authMiddleware, getMessages);
router.post('/', authMiddleware, sendMessage);
router.delete('/:messageId', authMiddleware, deleteMessage);

export default router;
