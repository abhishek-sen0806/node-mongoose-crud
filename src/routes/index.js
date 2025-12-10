import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import db from '../config/database.js';
import { cache } from '../services/cache.service.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     uptime:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                     services:
 *                       type: object
 */
router.get('/health', (req, res) => {
  const healthcheck = {
    success: true,
    message: 'API is healthy',
    data: {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: db.getConnectionStatus() ? 'connected' : 'disconnected',
        cache: cache.isConnected ? 'connected' : 'not configured',
      },
      memory: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      },
    },
  };

  res.status(200).json(healthcheck);
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service not ready
 */
router.get('/health/ready', (req, res) => {
  const isReady = db.getConnectionStatus();
  
  if (isReady) {
    res.status(200).json({
      success: true,
      message: 'Service is ready',
      ready: true,
    });
  } else {
    res.status(503).json({
      success: false,
      message: 'Service not ready',
      ready: false,
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/health/live', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is alive',
    alive: true,
  });
});

/**
 * Mount route modules
 */
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
