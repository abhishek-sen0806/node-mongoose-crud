import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/index.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  // Extract token from Authorization header or cookies
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw ApiError.unauthorized('Access token is required');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.accessTokenSecret);

    // Find user and check if exists
    const user = await User.findById(decoded._id).select('-password -refreshToken');

    if (!user) {
      throw ApiError.unauthorized('User not found or has been deleted');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.unauthorized('User account has been deactivated');
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw ApiError.unauthorized('Password was changed. Please login again');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid access token');
    }
    throw error;
  }
});

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessTokenSecret);
    const user = await User.findById(decoded._id).select('-password -refreshToken');

    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Silently ignore token errors for optional auth
  }

  next();
});

/**
 * Authorization Middleware Factory
 * Restricts access based on user roles
 * @param  {...string} allowedRoles - Roles that can access the route
 * @returns {Function} Express middleware
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`
      );
    }

    next();
  };
};

/**
 * Verify Refresh Token Middleware
 * Used for token refresh endpoint
 */
export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);

    // Find user with refresh token
    const user = await User.findById(decoded._id).select('+refreshToken');

    if (!user) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Verify stored refresh token matches
    if (user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Refresh token has been revoked');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.unauthorized('User account has been deactivated');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Refresh token has expired. Please login again');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    throw error;
  }
});

/**
 * Check if user owns the resource or is admin
 * @param {string} paramName - Request param containing resource owner ID
 * @returns {Function} Express middleware
 */
export const isOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const resourceOwnerId = req.params[paramName];
    const isOwner = req.user._id.toString() === resourceOwnerId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    next();
  };
};

export default {
  authenticate,
  optionalAuth,
  authorize,
  verifyRefreshToken,
  isOwnerOrAdmin,
};

