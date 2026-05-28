import express from 'express';
import {
  getDashboardStats,
  getUserActivity,
} from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/activity', authMiddleware, getUserActivity);

export default router;
