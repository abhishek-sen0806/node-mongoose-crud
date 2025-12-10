import createApp from './app.js';
import config from './config/index.js';
import db from './config/database.js';
import { cache } from './services/cache.service.js';
import emailService from './services/email.service.js';
import logger from './utils/logger.js';

/**
 * Application Entry Point
 * Initializes all services and starts the server
 */

const startServer = async () => {
  try {
    // ====================
    // Initialize Services
    // ====================
    
    // Connect to MongoDB
    await db.connect();

    // Initialize Redis Cache (optional)
    await cache.connect();

    // Initialize Email Service (optional)
    emailService.initialize();

    // ====================
    // Create Express App
    // ====================
    const app = createApp();

    // ====================
    // Start HTTP Server
    // ====================
    const server = app.listen(config.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🚀 Server is running!                                           ║
║                                                                   ║
║   📍 URL:          http://localhost:${config.port}                       ║
║   🌍 Environment:  ${config.nodeEnv.padEnd(15)}                          ║
║   📦 API Version:  v1                                             ║
║   📚 API Docs:     http://localhost:${config.port}/api-docs              ║
║                                                                   ║
║   🔐 Features:                                                    ║
║      • JWT Authentication with Refresh Tokens                     ║
║      • Role-Based Access Control (RBAC)                           ║
║      • Rate Limiting & Security Headers                           ║
║      • Request ID Tracking                                        ║
║      • Winston Logging                                            ║
║      • Swagger API Documentation                                  ║
║      • Redis Caching (if configured)                              ║
║      • Email Service (if configured)                              ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
      `);
    });

    // ====================
    // Graceful Shutdown
    // ====================
    const gracefulShutdown = async (signal) => {
      logger.warn(`Received ${signal}. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close all connections
          await Promise.allSettled([
            db.disconnect(),
            cache.disconnect(),
          ]);

          logger.info('All connections closed. Exiting...');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', { error: error.message });
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ====================
    // Error Handlers
    // ====================
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', {
        message: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', {
        reason: reason?.message || reason,
        promise: promise.toString(),
      });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Start the application
startServer();
