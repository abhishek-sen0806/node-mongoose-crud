import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { securityHeaders, parameterPollutionProtection, mongoSanitization } from './middlewares/security.middleware.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import requestId from './middlewares/requestId.middleware.js';
import logger from './utils/logger.js';
import { swaggerSpec, swaggerUi, swaggerUiOptions } from './config/swagger.js';

// Initialize event listeners
import './listeners/user.listener.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Express Application Factory
 * Creates and configures the Express application with all modern features
 */
const createApp = () => {
  const app = express();

  // ====================
  // Trust Proxy (for rate limiting behind reverse proxy)
  // ====================
  app.set('trust proxy', 1);

  // ====================
  // Request ID Tracking
  // ====================
  app.use(requestId);

  // ====================
  // Security Middleware
  // ====================
  app.use(securityHeaders);
  app.use(parameterPollutionProtection);

  // CORS Configuration
  app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID', 'X-Correlation-ID'],
    exposedHeaders: ['X-Request-ID', 'X-Correlation-ID', 'X-Response-Time', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  }));

  // ====================
  // Compression
  // ====================
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Balance between speed and compression ratio
  }));

  // ====================
  // Body Parsing
  // ====================
  app.use(express.json({
    limit: '10mb',
    strict: true,
  }));

  app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
  }));

  // Parse cookies
  app.use(cookieParser());

  // MongoDB Query Sanitization
  app.use(mongoSanitization);

  // ====================
  // Request Logging
  // ====================
  const morganFormat = config.isProduction
    ? ':remote-addr - :method :url :status :res[content-length] - :response-time ms'
    : 'dev';

  app.use(morgan(morganFormat, {
    stream: logger.stream,
    skip: (req) => req.url === '/api/v1/health', // Skip health check logs
  }));

  // ====================
  // Rate Limiting
  // ====================
  app.use('/api/', globalLimiter);

  // ====================
  // Static Files
  // ====================
  app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

  // ====================
  // API Documentation (Swagger)
  // ====================
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ====================
  // API Routes
  // ====================
  app.use('/api/v1', routes);

  // ====================
  // Root & Info Endpoints
  // ====================
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Node.js CRUD API with MongoDB',
      version: '1.0.0',
      documentation: '/api-docs',
      health: '/api/v1/health',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
      },
    });
  });

  // ====================
  // Error Handling
  // ====================
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
