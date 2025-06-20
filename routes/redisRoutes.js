import express from 'express';
import { getRedisStats, clearRedisCache, checkRedisHealth } from '../controllers/redisController.js';

const router = express.Router();

// Redis management routes
router.get('/stats', getRedisStats);
router.post('/clear-cache', clearRedisCache);
router.get('/health', checkRedisHealth);

export default router;
