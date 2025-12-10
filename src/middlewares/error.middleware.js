import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import config from '../config/index.js';

/**
 * Global Error Handler Middleware
 * Catches all errors and sends standardized responses
 */

/**
 * Handle Cast Error (Invalid MongoDB ObjectId)
 * @param {Error} error
 * @returns {ApiError}
 */
const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return ApiError.badRequest(message);
};

/**
 * Handle Duplicate Key Error (MongoDB)
 * @param {Error} error
 * @returns {ApiError}
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const message = `${field} '${value}' already exists`;
  return ApiError.conflict(message);
};

/**
 * Handle Validation Error (Mongoose)
 * @param {Error} error
 * @returns {ApiError}
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
  }));
  return ApiError.validationError('Validation failed', errors);
};

/**
 * Handle JWT Error
 * @param {Error} error
 * @returns {ApiError}
 */
const handleJWTError = () => {
  return ApiError.unauthorized('Invalid token. Please login again');
};

/**
 * Handle JWT Expired Error
 * @param {Error} error
 * @returns {ApiError}
 */
const handleJWTExpiredError = () => {
  return ApiError.unauthorized('Token has expired. Please login again');
};

/**
 * Send error response for development environment
 * Includes full error details and stack trace
 */
const sendDevError = (error, res) => {
  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    stack: error.stack,
    error: error,
  });
};

/**
 * Send error response for production environment
 * Hides internal error details from clients
 */
const sendProdError = (error, res) => {
  // Operational errors: send message to client
  if (error.isOperational || error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors || [],
    });
  } else {
    // Programming or unknown errors: don't leak details
    console.error('ERROR 💥:', error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Something went wrong. Please try again later',
    });
  }
};

/**
 * Main Error Handler
 */
const errorHandler = (err, req, res, next) => {
  // Default error properties
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.errors = err.errors || [];

  // Log error in development
  if (!config.isProduction) {
    console.error('Error:', {
      message: error.message,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
      stack: err.stack,
    });
  }

  // Handle specific error types
  if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err);
  }

  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationError(err);
  }

  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send appropriate response based on environment
  if (config.isProduction) {
    sendProdError(error, res);
  } else {
    sendDevError(error, res);
  }
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};

export { errorHandler, notFoundHandler };
export default errorHandler;

