import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, parseSortQuery, buildFilter } from '../utils/helpers.js';
import { cache } from '../services/cache.service.js';
import eventService, { EVENTS } from '../services/event.service.js';

/**
 * User Controller
 * Handles CRUD operations for users with caching and events
 */

const CACHE_TTL = 300; // 5 minutes

/**
 * @desc    Get all users with pagination, filtering, and sorting
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = parseSortQuery(req.query.sort);
  const filter = buildFilter(req.query, ['role', 'isActive']);

  // Generate cache key based on query params
  const cacheKey = `users:list:${JSON.stringify({ page, limit, sort, filter })}`;
  
  // Try to get from cache
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cachedData);
  }

  // Execute queries in parallel for better performance
  const [users, totalItems] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  const response = ApiResponse.paginated(
    users,
    { page, limit, totalPages, totalItems },
    'Users retrieved successfully'
  );

  // Cache the response
  await cache.set(cacheKey, response, CACHE_TTL);
  res.setHeader('X-Cache', 'MISS');

  res.status(200).json(response);
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin or Owner
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try cache first
  const cacheKey = `user:${id}`;
  const cachedUser = await cache.get(cacheKey);
  
  if (cachedUser) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(
      new ApiResponse(200, { user: cachedUser }, 'User retrieved successfully')
    );
  }

  const user = await User.findById(id).lean();

  if (!user) {
    throw ApiError.notFound(`User not found with id: ${id}`);
  }

  // Cache user
  await cache.set(cacheKey, user, CACHE_TTL);
  res.setHeader('X-Cache', 'MISS');

  res.status(200).json(
    new ApiResponse(200, { user }, 'User retrieved successfully')
  );
});

/**
 * @desc    Create new user (Admin only)
 * @route   POST /api/v1/users
 * @access  Private/Admin
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, isActive } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    isActive: isActive !== undefined ? isActive : true,
  });

  // Remove sensitive fields from response
  const userResponse = user.toJSON();

  // Invalidate users list cache
  await cache.delByPattern('users:*');

  // Emit event
  eventService.publish(EVENTS.USER_REGISTERED, { user: userResponse });

  res.status(201).json(
    ApiResponse.created({ user: userResponse }, 'User created successfully')
  );
});

/**
 * @desc    Update user
 * @route   PATCH /api/v1/users/:id
 * @access  Private/Admin or Owner
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Prevent password update through this endpoint
  if (updateData.password) {
    delete updateData.password;
  }

  // Prevent role change if not admin
  if (updateData.role && req.user.role !== 'admin') {
    throw ApiError.forbidden('Only admins can change user roles');
  }

  // Prevent email change to existing email
  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: id },
    });
    if (existingUser) {
      throw ApiError.conflict('Email already in use');
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw ApiError.notFound(`User not found with id: ${id}`);
  }

  // Invalidate caches
  await Promise.all([
    cache.del(`user:${id}`),
    cache.delByPattern('users:*'),
  ]);

  // Emit event
  eventService.publish(EVENTS.USER_UPDATED, {
    userId: id,
    updates: Object.keys(updateData),
  });

  res.status(200).json(
    new ApiResponse(200, { user }, 'User updated successfully')
  );
});

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.user._id.toString() === id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound(`User not found with id: ${id}`);
  }

  // Soft delete - just deactivate
  user.isActive = false;
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  // Invalidate caches
  await Promise.all([
    cache.del(`user:${id}`),
    cache.delByPattern('users:*'),
  ]);

  // Emit event
  eventService.publish(EVENTS.USER_DELETED, { userId: id });

  res.status(200).json(
    new ApiResponse(200, null, 'User deactivated successfully')
  );
});

/**
 * @desc    Hard delete user (permanent)
 * @route   DELETE /api/v1/users/:id/permanent
 * @access  Private/Admin
 */
export const permanentDeleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.user._id.toString() === id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw ApiError.notFound(`User not found with id: ${id}`);
  }

  // Invalidate caches
  await Promise.all([
    cache.del(`user:${id}`),
    cache.delByPattern('users:*'),
    cache.delByPattern(`user:${id}:*`),
  ]);

  // Emit event
  eventService.publish(EVENTS.USER_DELETED, { userId: id, permanent: true });

  res.status(200).json(
    new ApiResponse(200, null, 'User permanently deleted')
  );
});

/**
 * @desc    Restore deactivated user
 * @route   PATCH /api/v1/users/:id/restore
 * @access  Private/Admin
 */
export const restoreUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Use includeInactive option to find deactivated users
  const user = await User.findById(id).setOptions({ includeInactive: true });

  if (!user) {
    throw ApiError.notFound(`User not found with id: ${id}`);
  }

  if (user.isActive) {
    throw ApiError.badRequest('User is already active');
  }

  user.isActive = true;
  await user.save({ validateBeforeSave: false });

  // Invalidate caches
  await cache.delByPattern('users:*');

  res.status(200).json(
    new ApiResponse(200, { user }, 'User restored successfully')
  );
});

/**
 * @desc    Update user avatar
 * @route   PATCH /api/v1/users/:id/avatar
 * @access  Private/Owner
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    throw ApiError.badRequest('Please upload an image file');
  }

  // Build avatar URL
  const avatarUrl = `/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    id,
    { avatar: avatarUrl },
    { new: true }
  );

  if (!user) {
    throw ApiError.notFound(`User not found with id: ${id}`);
  }

  // Invalidate cache
  await cache.del(`user:${id}`);

  // Emit event
  eventService.publish(EVENTS.FILE_UPLOADED, {
    userId: id,
    fileType: 'avatar',
    filePath: avatarUrl,
  });

  res.status(200).json(
    new ApiResponse(200, { user, avatarUrl }, 'Avatar updated successfully')
  );
});

/**
 * @desc    Search users
 * @route   GET /api/v1/users/search
 * @access  Private
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    throw ApiError.badRequest('Search query must be at least 2 characters');
  }

  const { page, limit, skip } = getPagination(req.query);

  const searchFilter = {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
    isActive: true,
  };

  const [users, totalItems] = await Promise.all([
    User.find(searchFilter)
      .select('name email avatar role')
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(searchFilter),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json(
    ApiResponse.paginated(
      users,
      { page, limit, totalPages, totalItems },
      'Search results'
    )
  );
});

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  permanentDeleteUser,
  restoreUser,
  updateAvatar,
  searchUsers,
};
