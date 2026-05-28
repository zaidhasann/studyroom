import express from 'express';
import {
  startSession,
  pauseSession,
  resumeSession,
  endSession,
  getSessionHistory,
  addParticipantToSession,
} from '../controllers/sessionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', authMiddleware, startSession);
router.post('/pause', authMiddleware, pauseSession);
router.post('/resume', authMiddleware, resumeSession);
router.post('/end', authMiddleware, endSession);
router.get('/history/:roomId', authMiddleware, getSessionHistory);
router.post('/:sessionId/add-participant', authMiddleware, addParticipantToSession);

export default router;
