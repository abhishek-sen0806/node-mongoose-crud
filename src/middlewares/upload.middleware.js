import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';
import { generateUniqueFilename } from '../utils/helpers.js';

/**
 * File Upload Middleware using Multer
 * Handles file uploads with validation and storage configuration
 */

// Ensure upload directory exists
const ensureUploadDir = () => {
  const uploadDir = config.paths.uploads;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Created upload directory: ${uploadDir}`);
  }
  return uploadDir;
};

/**
 * Disk Storage Configuration
 * Stores files on local filesystem
 */
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = generateUniqueFilename(file.originalname);
    cb(null, uniqueFilename);
  },
});

/**
 * Memory Storage Configuration
 * Stores files in memory as Buffer (useful for cloud uploads)
 */
const memoryStorage = multer.memoryStorage();

/**
 * File Filter - Validates file types
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {Function} Multer file filter function
 */
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        ApiError.badRequest(
          `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        ),
        false
      );
    }
  };
};

/**
 * Image file filter
 */
const imageFileFilter = createFileFilter([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

/**
 * Document file filter
 */
const documentFileFilter = createFileFilter([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

/**
 * All allowed files filter
 */
const allFilesFilter = createFileFilter(config.upload.allowedMimeTypes);

/**
 * Multer Upload Configurations
 */

/**
 * Single image upload
 * @param {string} fieldName - Form field name
 * @returns {multer.Multer} Multer instance
 */
export const uploadSingleImage = (fieldName = 'image') => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: config.upload.maxFileSize,
      files: 1,
    },
    fileFilter: imageFileFilter,
  }).single(fieldName);
};

/**
 * Multiple images upload
 * @param {string} fieldName - Form field name
 * @param {number} maxCount - Maximum number of files
 * @returns {multer.Multer} Multer instance
 */
export const uploadMultipleImages = (fieldName = 'images', maxCount = 5) => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: config.upload.maxFileSize,
      files: maxCount,
    },
    fileFilter: imageFileFilter,
  }).array(fieldName, maxCount);
};

/**
 * Avatar upload (single image with size limit)
 */
export const uploadAvatar = multer({
  storage: diskStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for avatars
    files: 1,
  },
  fileFilter: imageFileFilter,
}).single('avatar');

/**
 * Document upload
 */
export const uploadDocument = multer({
  storage: diskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
    files: 1,
  },
  fileFilter: documentFileFilter,
}).single('document');

/**
 * Generic file upload with custom options
 * @param {Object} options - Upload options
 * @returns {multer.Multer} Multer instance
 */
export const createUploader = (options = {}) => {
  const {
    fieldName = 'file',
    maxSize = config.upload.maxFileSize,
    maxFiles = 1,
    allowedTypes = config.upload.allowedMimeTypes,
    useMemoryStorage = false,
  } = options;

  const upload = multer({
    storage: useMemoryStorage ? memoryStorage : diskStorage,
    limits: {
      fileSize: maxSize,
      files: maxFiles,
    },
    fileFilter: createFileFilter(allowedTypes),
  });

  return maxFiles > 1
    ? upload.array(fieldName, maxFiles)
    : upload.single(fieldName);
};

/**
 * Multiple fields upload configuration
 * @param {Array} fields - Array of field configurations
 * @returns {multer.Multer} Multer instance
 * 
 * @example
 * uploadFields([
 *   { name: 'avatar', maxCount: 1 },
 *   { name: 'documents', maxCount: 3 }
 * ])
 */
export const uploadFields = (fields) => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: config.upload.maxFileSize,
    },
    fileFilter: allFilesFilter,
  }).fields(fields);
};

/**
 * Error handling middleware for multer errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return next(
          ApiError.badRequest(
            `File too large. Maximum size: ${config.upload.maxFileSize / (1024 * 1024)}MB`
          )
        );
      case 'LIMIT_FILE_COUNT':
        return next(ApiError.badRequest('Too many files uploaded'));
      case 'LIMIT_UNEXPECTED_FILE':
        return next(ApiError.badRequest(`Unexpected field: ${err.field}`));
      default:
        return next(ApiError.badRequest(`Upload error: ${err.message}`));
    }
  }

  if (err) {
    return next(err);
  }

  next();
};

export default {
  uploadSingleImage,
  uploadMultipleImages,
  uploadAvatar,
  uploadDocument,
  createUploader,
  uploadFields,
  handleUploadError,
};

