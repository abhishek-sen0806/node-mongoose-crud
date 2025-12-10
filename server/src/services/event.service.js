import { EventEmitter } from 'events';
import logger from '../utils/logger.js';

/**
 * Event Service
 * Implements Event-Driven Architecture pattern
 * Enables loose coupling between components
 */
class EventService extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20); // Increase max listeners
    this.eventHistory = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Register event handler with logging
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Options
   */
  subscribe(event, handler, options = {}) {
    const { once = false, priority = 'normal' } = options;

    const wrappedHandler = async (...args) => {
      const startTime = Date.now();
      try {
        await handler(...args);
        logger.debug(`Event handled: ${event}`, {
          duration: Date.now() - startTime,
          priority,
        });
      } catch (error) {
        logger.error(`Event handler error: ${event}`, {
          error: error.message,
          stack: error.stack,
        });
      }
    };

    if (once) {
      this.once(event, wrappedHandler);
    } else {
      this.on(event, wrappedHandler);
    }

    logger.debug(`Event subscribed: ${event}`, { once, priority });
  }

  /**
   * Emit event with logging and history tracking
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  publish(event, data = {}) {
    const eventRecord = {
      event,
      data,
      timestamp: new Date().toISOString(),
      listenerCount: this.listenerCount(event),
    };

    // Track event history
    this.eventHistory.push(eventRecord);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    logger.debug(`Event published: ${event}`, {
      listenerCount: eventRecord.listenerCount,
    });

    this.emit(event, data);
  }

  /**
   * Remove specific handler
   * @param {string} event - Event name
   * @param {Function} handler - Handler to remove
   */
  unsubscribe(event, handler) {
    this.off(event, handler);
    logger.debug(`Event unsubscribed: ${event}`);
  }

  /**
   * Get event history
   * @param {string} event - Optional event filter
   * @returns {Array}
   */
  getHistory(event = null) {
    if (event) {
      return this.eventHistory.filter((e) => e.event === event);
    }
    return this.eventHistory;
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
  }

  /**
   * Get registered events
   * @returns {Array}
   */
  getRegisteredEvents() {
    return this.eventNames();
  }
}

// Create singleton instance
const eventService = new EventService();

/**
 * Event Constants
 * Centralized event name definitions
 */
export const EVENTS = {
  // User events
  USER_REGISTERED: 'user:registered',
  USER_LOGGED_IN: 'user:loggedIn',
  USER_LOGGED_OUT: 'user:loggedOut',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  USER_PASSWORD_CHANGED: 'user:passwordChanged',
  USER_PASSWORD_RESET_REQUESTED: 'user:passwordResetRequested',
  USER_EMAIL_VERIFIED: 'user:emailVerified',

  // Auth events
  AUTH_TOKEN_REFRESHED: 'auth:tokenRefreshed',
  AUTH_FAILED: 'auth:failed',

  // System events
  SYSTEM_ERROR: 'system:error',
  SYSTEM_WARNING: 'system:warning',
  CACHE_CLEARED: 'cache:cleared',

  // File events
  FILE_UPLOADED: 'file:uploaded',
  FILE_DELETED: 'file:deleted',
};

export default eventService;

