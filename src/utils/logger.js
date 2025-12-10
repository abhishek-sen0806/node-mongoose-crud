import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Winston Logger Configuration
 * Production-grade logging with multiple transports
 */

// Custom log format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// JSON format for production (better for log aggregation tools)
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define log levels with colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Create logs directory path
const logsDir = path.join(__dirname, '../../logs');

// Transports configuration
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      customFormat
    ),
  })
);

// File transports (production only)
if (config.isProduction) {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.isProduction ? 'info' : 'debug',
  levels,
  transports,
  // Don't exit on error
  exitOnError: false,
});

// Stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Log helper methods with context
 */
export const logWithContext = (context) => ({
  info: (message, meta = {}) => logger.info(message, { context, ...meta }),
  error: (message, meta = {}) => logger.error(message, { context, ...meta }),
  warn: (message, meta = {}) => logger.warn(message, { context, ...meta }),
  debug: (message, meta = {}) => logger.debug(message, { context, ...meta }),
  http: (message, meta = {}) => logger.http(message, { context, ...meta }),
});

export default logger;

