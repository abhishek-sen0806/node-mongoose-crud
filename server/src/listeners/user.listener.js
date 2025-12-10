import eventService, { EVENTS } from '../services/event.service.js';
import emailService from '../services/email.service.js';
import { cache } from '../services/cache.service.js';
import logger from '../utils/logger.js';

/**
 * User Event Listeners
 * Handles side effects of user actions
 * Implements event-driven architecture
 */

/**
 * Handle user registration
 */
eventService.subscribe(EVENTS.USER_REGISTERED, async (data) => {
  const { user } = data;
  
  logger.info('Processing user registration event', { userId: user._id });

  try {
    // Send welcome email
    await emailService.sendWelcomeEmail(user);
    
    // Invalidate users list cache
    await cache.delByPattern('users:*');
    
    logger.info('User registration processing complete', { userId: user._id });
  } catch (error) {
    logger.error('Error processing user registration', {
      userId: user._id,
      error: error.message,
    });
  }
});

/**
 * Handle user login
 */
eventService.subscribe(EVENTS.USER_LOGGED_IN, async (data) => {
  const { user, ip, userAgent } = data;
  
  logger.info('User logged in', {
    userId: user._id,
    email: user.email,
    ip,
    userAgent,
  });

  // Could track login analytics, update user stats, etc.
});

/**
 * Handle user logout
 */
eventService.subscribe(EVENTS.USER_LOGGED_OUT, async (data) => {
  const { userId } = data;
  
  logger.info('User logged out', { userId });

  // Clear user-specific cache
  await cache.delByPattern(`user:${userId}:*`);
});

/**
 * Handle user update
 */
eventService.subscribe(EVENTS.USER_UPDATED, async (data) => {
  const { userId, updates } = data;
  
  logger.info('User updated', { userId, fields: Object.keys(updates) });

  // Invalidate user cache
  await cache.del(`user:${userId}`);
  await cache.delByPattern('users:*');
});

/**
 * Handle user deletion
 */
eventService.subscribe(EVENTS.USER_DELETED, async (data) => {
  const { userId } = data;
  
  logger.info('User deleted', { userId });

  // Clear all user-related cache
  await cache.del(`user:${userId}`);
  await cache.delByPattern(`user:${userId}:*`);
  await cache.delByPattern('users:*');
});

/**
 * Handle password change
 */
eventService.subscribe(EVENTS.USER_PASSWORD_CHANGED, async (data) => {
  const { user } = data;
  
  logger.info('User password changed', { userId: user._id });

  // Could send security notification email
  // await emailService.sendPasswordChangedNotification(user);
});

/**
 * Handle password reset request
 */
eventService.subscribe(EVENTS.USER_PASSWORD_RESET_REQUESTED, async (data) => {
  const { user, resetToken } = data;
  
  logger.info('Password reset requested', { userId: user._id });

  try {
    await emailService.sendPasswordResetEmail(user, resetToken);
  } catch (error) {
    logger.error('Failed to send password reset email', {
      userId: user._id,
      error: error.message,
    });
  }
});

/**
 * Handle authentication failure
 */
eventService.subscribe(EVENTS.AUTH_FAILED, async (data) => {
  const { email, ip, reason } = data;
  
  logger.warn('Authentication failed', { email, ip, reason });

  // Could implement account lockout after multiple failures
  // Could send security alert email
});

/**
 * Handle system errors
 */
eventService.subscribe(EVENTS.SYSTEM_ERROR, async (data) => {
  const { error, context } = data;
  
  logger.error('System error event', {
    message: error.message,
    stack: error.stack,
    context,
  });

  // Could send alert to monitoring system
  // Could notify admin via email
});

export default eventService;

