import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  permanentDeleteUser,
  restoreUser,
  updateAvatar,
  searchUsers,
} from '../controllers/user.controller.js';
import { authenticate, authorize, isOwnerOrAdmin } from '../middlewares/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware.js';
import { searchLimiter, heavyOperationLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  registerSchema,
  updateUserSchema,
  querySchema,
  objectIdSchema,
} from '../validators/user.validator.js';
import { uploadAvatar, handleUploadError } from '../middlewares/upload.middleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query (min 2 characters)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchLimiter, searchUsers);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (prefix with - for descending)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, moderator]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - $ref: '#/components/schemas/PaginationMeta'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/',
  authorize('admin'),
  validateQuery(querySchema),
  getAllUsers
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: User already exists
 */
router.post(
  '/',
  authorize('admin'),
  validateBody(registerSchema),
  createUser
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  validateParams(objectIdSchema),
  isOwnerOrAdmin('id'),
  getUserById
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/:id',
  validateParams(objectIdSchema),
  isOwnerOrAdmin('id'),
  validateBody(updateUserSchema),
  updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deactivate user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:id',
  authorize('admin'),
  validateParams(objectIdSchema),
  deleteUser
);

/**
 * @swagger
 * /users/{id}/permanent:
 *   delete:
 *     summary: Permanently delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User permanently deleted
 */
router.delete(
  '/:id/permanent',
  authorize('admin'),
  validateParams(objectIdSchema),
  permanentDeleteUser
);

/**
 * @swagger
 * /users/{id}/restore:
 *   patch:
 *     summary: Restore deactivated user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User restored
 */
router.patch(
  '/:id/restore',
  authorize('admin'),
  validateParams(objectIdSchema),
  restoreUser
);

/**
 * @swagger
 * /users/{id}/avatar:
 *   patch:
 *     summary: Update user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated
 */
router.patch(
  '/:id/avatar',
  validateParams(objectIdSchema),
  isOwnerOrAdmin('id'),
  heavyOperationLimiter,
  uploadAvatar,
  handleUploadError,
  updateAvatar
);

export default router;
