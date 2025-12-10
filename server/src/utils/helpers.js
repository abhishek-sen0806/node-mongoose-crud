import crypto from 'crypto';
import path from 'path';

/**
 * Helper Utilities
 * Collection of commonly used helper functions
 */

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string}
 */
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * Generate unique filename for uploads
 * @param {string} originalName - Original filename
 * @returns {string}
 */
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = generateRandomString(8);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 20);
  
  return `${baseName}-${timestamp}-${randomString}${extension}`;
};

/**
 * Parse sort query string to MongoDB sort object
 * @param {string} sortQuery - Sort query (e.g., "-createdAt,name")
 * @returns {Object} MongoDB sort object
 */
export const parseSortQuery = (sortQuery) => {
  if (!sortQuery) return { createdAt: -1 };
  
  const sortFields = sortQuery.split(',');
  const sortObject = {};
  
  sortFields.forEach((field) => {
    const trimmedField = field.trim();
    if (trimmedField.startsWith('-')) {
      sortObject[trimmedField.slice(1)] = -1;
    } else {
      sortObject[trimmedField] = 1;
    }
  });
  
  return sortObject;
};

/**
 * Build MongoDB filter from query parameters
 * @param {Object} query - Query parameters
 * @param {Array} allowedFields - Fields allowed for filtering
 * @returns {Object} MongoDB filter object
 */
export const buildFilter = (query, allowedFields = []) => {
  const filter = {};
  
  allowedFields.forEach((field) => {
    if (query[field] !== undefined) {
      // Handle different query types
      if (typeof query[field] === 'string' && query[field].includes(',')) {
        // Handle comma-separated values as OR condition
        filter[field] = { $in: query[field].split(',') };
      } else {
        filter[field] = query[field];
      }
    }
  });
  
  // Handle search
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }
  
  return filter;
};

/**
 * Calculate pagination values
 * @param {Object} query - Query parameters
 * @returns {Object} Pagination object
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Sanitize user object for response (remove sensitive fields)
 * @param {Object} user - User document
 * @returns {Object} Sanitized user object
 */
export const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.__v;
  return userObject;
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove undefined/null values from object
 * @param {Object} obj - Input object
 * @returns {Object} Cleaned object
 */
export const removeEmpty = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null)
  );
};

export default {
  generateRandomString,
  generateUniqueFilename,
  parseSortQuery,
  buildFilter,
  getPagination,
  sanitizeUser,
  deepClone,
  removeEmpty,
};

