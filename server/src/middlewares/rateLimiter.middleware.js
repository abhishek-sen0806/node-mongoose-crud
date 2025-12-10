import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';
import config from '../config/index.js';

/**
 * Rate Limiting Middleware
 * Prevents abuse and DDoS attacks by limiting request rates
 */

/**
 * Create rate limiter with custom options
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100, // 100 requests per window
    message: {
      success: false,
      statusCode: 429,
      message: options.message || 'Too many requests, please try again later',
    },
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    handler: (req, res, next, options) => {
      throw ApiError.tooManyRequests(options.message.message);
    },
    skip: (req) => {
      // Skip rate limiting in development (optional)
      return !config.isProduction && options.skipInDev;
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?._id?.toString() || req.ip;
    },
  });
};

/**
 * Global API Rate Limiter
 * 100 requests per 15 minutes
 */
export const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

/**
 * Auth Rate Limiter (Stricter)
 * 5 requests per 15 minutes for login/register
 * Prevents brute force attacks
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again after 15 minutes',
});

/**
 * Password Reset Rate Limiter
 * 3 requests per hour
 */
export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again after an hour',
});

/**
 * API Heavy Operations Limiter
 * For expensive operations like file uploads
 * 10 requests per hour
 */
export const heavyOperationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Upload limit reached, please try again after an hour',
});

/**
 * Search Rate Limiter
 * 30 requests per minute
 */
export const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Search rate limit exceeded, please slow down',
});

/**
 * Sliding Window Rate Limiter
 * More sophisticated rate limiting based on user actions
 */
export const createSlidingWindowLimiter = (options) => {
  const requests = new Map();
  const { windowMs = 60000, maxRequests = 10 } = options;

  return (req, res, next) => {
    const key = req.user?._id?.toString() || req.ip;
    const now = Date.now();
    
    // Get existing requests for this key
    let userRequests = requests.get(key) || [];
    
    // Filter out old requests outside the window
    userRequests = userRequests.filter((time) => now - time < windowMs);
    
    if (userRequests.length >= maxRequests) {
      throw ApiError.tooManyRequests('Rate limit exceeded. Please wait before retrying.');
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);
    
    // Cleanup old entries periodically
    if (requests.size > 10000) {
      const cutoff = now - windowMs;
      for (const [k, v] of requests.entries()) {
        if (v.every((time) => time < cutoff)) {
          requests.delete(k);
        }
      }
    }
    
    next();
  };
};

export default {
  globalLimiter,
  authLimiter,
  passwordResetLimiter,
  heavyOperationLimiter,
  searchLimiter,
  createRateLimiter,
  createSlidingWindowLimiter,
};

