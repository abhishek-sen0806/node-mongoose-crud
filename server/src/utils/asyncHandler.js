/**
 * Async Handler Wrapper
 * Higher-order function that wraps async route handlers
 * Automatically catches and forwards errors to error middleware
 * Eliminates repetitive try-catch blocks in controllers
 */

/**
 * Wraps an async function to handle promise rejections
 * @param {Function} requestHandler - Async Express route handler
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Usage in controllers
 * export const getUsers = asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(new ApiResponse(200, users));
 * });
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
  };
};

export default asyncHandler;

