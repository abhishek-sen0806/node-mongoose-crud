import ApiError from '../utils/ApiError.js';

/**
 * Validation Middleware Factory
 * Creates middleware that validates request data against Joi schemas
 */

/**
 * Validate request body
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first
      stripUnknown: true, // Remove unknown fields
      convert: true, // Allow type coercion
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      throw ApiError.validationError('Validation failed', errors);
    }

    // Replace body with validated/sanitized values
    req.body = value;
    next();
  };
};

/**
 * Validate request query parameters
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      throw ApiError.validationError('Invalid query parameters', errors);
    }

    req.query = value;
    next();
  };
};

/**
 * Validate request params (URL parameters)
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      throw ApiError.validationError('Invalid URL parameters', errors);
    }

    req.params = value;
    next();
  };
};

/**
 * Combined validation middleware
 * Validates body, query, and params in one middleware
 * @param {Object} schemas - Object containing body, query, and params schemas
 * @returns {Function} Express middleware
 */
export const validate = (schemas) => {
  return (req, res, next) => {
    const allErrors = [];

    // Validate body
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        allErrors.push(
          ...error.details.map((detail) => ({
            location: 'body',
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, ''),
          }))
        );
      } else {
        req.body = value;
      }
    }

    // Validate query
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        allErrors.push(
          ...error.details.map((detail) => ({
            location: 'query',
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, ''),
          }))
        );
      } else {
        req.query = value;
      }
    }

    // Validate params
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        allErrors.push(
          ...error.details.map((detail) => ({
            location: 'params',
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, ''),
          }))
        );
      } else {
        req.params = value;
      }
    }

    if (allErrors.length > 0) {
      throw ApiError.validationError('Validation failed', allErrors);
    }

    next();
  };
};

export default {
  validateBody,
  validateQuery,
  validateParams,
  validate,
};

