import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Application Configuration
 * Centralized configuration management with validation
 */
const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://Tout:TVDq0i3HS9P6hW8L@cluster0.mybmtfa.mongodb.net/node_crud_api?appName=Cluster0',
  },

  // Redis (Optional - for caching)
  redis: {
    url: process.env.REDIS_URL || null,
  },

  // JWT
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'default_access_secret_change_in_production_32chars',
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret_change_in_production_32chars',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Email (Optional)
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'noreply@app.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Node CRUD API',
  },

  // Client URL (for email links)
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    uploadDir: process.env.UPLOAD_DIR || './public/uploads',
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ],
  },

  // Paths
  paths: {
    root: path.resolve(__dirname, '../../'),
    public: path.resolve(__dirname, '../../public'),
    uploads: path.resolve(__dirname, '../../public/uploads'),
    logs: path.resolve(__dirname, '../../logs'),
  },
};

/**
 * Validate required configuration
 */
const validateConfig = () => {
  const requiredEnvVars = [];

  // Only require secrets in production
  if (config.isProduction) {
    requiredEnvVars.push('ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET');
  }

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missingVars.join(', ')}`
    );
    if (config.isProduction) {
      process.exit(1);
    }
  }

  if (!config.isProduction) {
    console.warn('⚠️  Running in development mode with default secrets');
  }
};

validateConfig();

export default config;
