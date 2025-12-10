import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

/**
 * Security Middleware Configuration
 * Implements industry-standard security headers and protections
 */

/**
 * Helmet Security Headers
 * Protects against well-known web vulnerabilities
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Hide X-Powered-By header
  hidePoweredBy: true,
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // Prevent MIME type sniffing
  noSniff: true,
  // XSS Protection
  xssFilter: true,
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

/**
 * HTTP Parameter Pollution Protection
 * Prevents parameter pollution attacks
 */
export const parameterPollutionProtection = hpp({
  whitelist: [
    'sort',
    'fields',
    'page',
    'limit',
    'role',
    'isActive',
  ],
});

/**
 * MongoDB Query Injection Protection
 * Sanitizes user input to prevent NoSQL injection
 */
export const mongoSanitization = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized potential injection attempt in ${key}`);
  },
});

/**
 * Custom XSS Sanitization Middleware
 * Additional layer of XSS protection for request body
 */
export const xssSanitizer = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key of Object.keys(obj)) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize body, but skip password fields
  if (req.body) {
    const passwordFields = ['password', 'currentPassword', 'newPassword', 'confirmPassword', 'confirmNewPassword'];
    const preserved = {};
    
    // Preserve password fields
    passwordFields.forEach((field) => {
      if (req.body[field]) {
        preserved[field] = req.body[field];
      }
    });
    
    // Sanitize other fields
    req.body = sanitize(req.body);
    
    // Restore password fields
    Object.assign(req.body, preserved);
  }

  next();
};

/**
 * Request Size Limiter
 * Custom middleware to limit request body size
 */
export const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'], 10);
    const maxBytes = parseSize(maxSize);
    
    if (contentLength && contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        message: `Request entity too large. Maximum size: ${maxSize}`,
      });
    }
    
    next();
  };
};

/**
 * Parse size string to bytes
 */
const parseSize = (size) => {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  return parseInt(match[1], 10) * (units[match[2]] || 1);
};

export default {
  securityHeaders,
  parameterPollutionProtection,
  mongoSanitization,
  xssSanitizer,
  requestSizeLimiter,
};

