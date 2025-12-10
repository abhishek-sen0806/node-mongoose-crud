import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/index.js';
import eventService, { EVENTS } from '../services/event.service.js';

/**
 * Auth Controller
 * Handles authentication-related operations
 */

/**
 * Cookie options for tokens
 */
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'strict' : 'lax',
  maxAge,
});

/**
 * Generate tokens and set cookies
 * @param {User} user - User document
 * @param {Response} res - Express response object
 * @returns {Object} Token pair
 */
const generateTokensAndSetCookies = async (user, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
  res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

  return { accessToken, refreshToken };
};

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokensAndSetCookies(user, res);

  // Prepare response (exclude sensitive data)
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  // Emit user registered event
  eventService.publish(EVENTS.USER_REGISTERED, { user: userResponse });

  res.status(201).json(
    new ApiResponse(201, {
      user: userResponse,
      tokens: { accessToken, refreshToken },
    }, 'User registered successfully')
  );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findByEmail(email);

  if (!user) {
    // Emit auth failed event
    eventService.publish(EVENTS.AUTH_FAILED, {
      email,
      ip: req.ip,
      reason: 'User not found',
    });
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    eventService.publish(EVENTS.AUTH_FAILED, {
      email,
      ip: req.ip,
      reason: 'Account deactivated',
    });
    throw ApiError.unauthorized('Your account has been deactivated. Please contact support');
  }

  // Verify password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    eventService.publish(EVENTS.AUTH_FAILED, {
      email,
      ip: req.ip,
      reason: 'Invalid password',
    });
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokensAndSetCookies(user, res);

  // Prepare response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
  };

  // Emit login event
  eventService.publish(EVENTS.USER_LOGGED_IN, {
    user: userResponse,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(
    new ApiResponse(200, {
      user: userResponse,
      tokens: { accessToken, refreshToken },
    }, 'Login successful')
  );
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Clear refresh token from database
  await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  // Clear cookies
  const cookieOptions = {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  // Emit logout event
  eventService.publish(EVENTS.USER_LOGGED_OUT, { userId: userId.toString() });

  res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully')
  );
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (with refresh token)
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  // User is attached by verifyRefreshToken middleware
  const user = req.user;

  // Generate new tokens
  const { accessToken, refreshToken } = await generateTokensAndSetCookies(user, res);

  // Emit token refresh event
  eventService.publish(EVENTS.AUTH_TOKEN_REFRESHED, {
    userId: user._id.toString(),
  });

  res.status(200).json(
    new ApiResponse(200, {
      tokens: { accessToken, refreshToken },
    }, 'Token refreshed successfully')
  );
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json(
    new ApiResponse(200, { user }, 'User retrieved successfully')
  );
});

/**
 * @desc    Change password
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  // Check if new password is same as old
  const isSamePassword = await user.isPasswordCorrect(newPassword);
  if (isSamePassword) {
    throw ApiError.badRequest('New password must be different from current password');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Clear all sessions (optional - invalidate refresh tokens)
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  // Emit password changed event
  eventService.publish(EVENTS.USER_PASSWORD_CHANGED, {
    user: { _id: user._id, email: user.email, name: user.name },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Password changed successfully. Please login again')
  );
});

export default {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
};
