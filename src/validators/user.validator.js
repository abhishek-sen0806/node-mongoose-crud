import Joi from 'joi';

/**
 * User Validation Schemas
 * Centralized validation using Joi
 * Provides consistent and reusable validation rules
 */

// Common validation patterns
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Base schemas for reuse
const nameSchema = Joi.string().trim().min(2).max(50);
const emailSchema = Joi.string().trim().lowercase().email();
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(passwordPattern)
  .messages({
    'string.pattern.base':
      'Password must contain at least one uppercase, one lowercase, one number, and one special character',
  });

/**
 * Register User Validation Schema
 */
export const registerSchema = Joi.object({
  name: nameSchema.required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
  }),
  email: emailSchema.required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  password: passwordSchema.required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm password is required',
    }),
  role: Joi.string()
    .valid('user', 'admin', 'moderator')
    .default('user')
    .messages({
      'any.only': 'Role must be user, admin, or moderator',
    }),
});

/**
 * Login Validation Schema
 */
export const loginSchema = Joi.object({
  email: emailSchema.required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

/**
 * Update User Validation Schema
 */
export const updateUserSchema = Joi.object({
  name: nameSchema.messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
  }),
  email: emailSchema.messages({
    'string.email': 'Please provide a valid email address',
  }),
  role: Joi.string()
    .valid('user', 'admin', 'moderator')
    .messages({
      'any.only': 'Role must be user, admin, or moderator',
    }),
  isActive: Joi.boolean(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

/**
 * Change Password Validation Schema
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
  }),
  newPassword: passwordSchema.required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 8 characters',
  }),
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm password is required',
    }),
});

/**
 * Query Parameters Validation Schema
 */
export const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().trim(),
  search: Joi.string().trim().max(100),
  role: Joi.string().valid('user', 'admin', 'moderator'),
  isActive: Joi.boolean(),
});

/**
 * MongoDB ObjectId Validation Schema
 */
export const objectIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
      'string.empty': 'ID is required',
    }),
});

export default {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
  querySchema,
  objectIdSchema,
};

