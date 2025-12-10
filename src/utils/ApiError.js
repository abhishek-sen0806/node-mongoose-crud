/**
 * Custom API Error Class
 * Extends Error to provide structured error responses
 * Follows industry-standard error handling patterns
 */
class ApiError extends Error {
  /**
   * Create an API Error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Additional error details
   * @param {string} stack - Error stack trace
   */
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.data = null;
    this.success = false;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON response format
   * @returns {Object}
   */
  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }

  // Static factory methods for common errors
  
  /**
   * 400 Bad Request
   * @param {string} message
   * @param {Array} errors
   * @returns {ApiError}
   */
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * 401 Unauthorized
   * @param {string} message
   * @returns {ApiError}
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /**
   * 403 Forbidden
   * @param {string} message
   * @returns {ApiError}
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  /**
   * 404 Not Found
   * @param {string} message
   * @returns {ApiError}
   */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  /**
   * 409 Conflict
   * @param {string} message
   * @returns {ApiError}
   */
  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }

  /**
   * 422 Unprocessable Entity
   * @param {string} message
   * @param {Array} errors
   * @returns {ApiError}
   */
  static validationError(message = 'Validation failed', errors = []) {
    return new ApiError(422, message, errors);
  }

  /**
   * 429 Too Many Requests
   * @param {string} message
   * @returns {ApiError}
   */
  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message);
  }

  /**
   * 500 Internal Server Error
   * @param {string} message
   * @returns {ApiError}
   */
  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

export default ApiError;

