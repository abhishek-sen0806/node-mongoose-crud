import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * User Schema Definition
 * Implements industry-standard patterns for user management
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'moderator'],
        message: 'Role must be user, admin, or moderator',
      },
      default: 'user',
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, isActive: 1 });

/**
 * Pre-save middleware - Hash password before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    
    // Set passwordChangedAt for password updates (not new users)
    if (!this.isNew) {
      this.passwordChangedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Methods
 */

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate Access Token (short-lived)
 * @returns {string} JWT access token
 */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    config.jwt.accessTokenSecret,
    {
      expiresIn: config.jwt.accessTokenExpiry,
    }
  );
};

/**
 * Generate Refresh Token (long-lived)
 * @returns {string} JWT refresh token
 */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    config.jwt.refreshTokenSecret,
    {
      expiresIn: config.jwt.refreshTokenExpiry,
    }
  );
};

/**
 * Check if password was changed after token was issued
 * @param {number} tokenIssuedAt - Token issued timestamp
 * @returns {boolean}
 */
userSchema.methods.changedPasswordAfter = function (tokenIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return tokenIssuedAt < changedTimestamp;
  }
  return false;
};

/**
 * Static Methods
 */

/**
 * Find user by email with password field
 * @param {string} email
 * @returns {Promise<User>}
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }).select('+password +refreshToken');
};

/**
 * Find active users
 * @returns {Query}
 */
userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

/**
 * Query Middleware - Exclude inactive users by default
 * Can be overridden by passing { includeInactive: true }
 */
userSchema.pre(/^find/, function (next) {
  // Only apply to find queries, not findOne for login
  if (this.options.includeInactive) {
    return next();
  }
  
  // Don't filter if explicitly querying for isActive
  if (this.getQuery().isActive !== undefined) {
    return next();
  }
  
  this.where({ isActive: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

export default User;

