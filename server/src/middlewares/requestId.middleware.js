import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID Middleware
 * Adds unique request ID for tracing and correlation
 * Essential for debugging in distributed systems
 */

/**
 * Generate and attach request ID
 * Also attaches response time tracking
 */
const requestId = (req, res, next) => {
  // Get existing request ID from header or generate new one
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // Attach to request object
  req.requestId = requestId;
  
  // Add correlation ID (for chained requests)
  req.correlationId = req.headers['x-correlation-id'] || requestId;
  
  // Track request start time
  req.startTime = Date.now();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Correlation-ID', req.correlationId);
  
  // Track response time on finish
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
};

/**
 * Request context for logging
 * Provides standardized context object for logs
 */
export const getRequestContext = (req) => ({
  requestId: req.requestId,
  correlationId: req.correlationId,
  method: req.method,
  path: req.path,
  userId: req.user?._id?.toString(),
  userRole: req.user?.role,
  ip: req.ip || req.connection?.remoteAddress,
  userAgent: req.headers['user-agent'],
});

export default requestId;

