/**
 * Standardized API Response Class
 * Provides consistent response structure across the application
 */
class ApiResponse {
  /**
   * Create an API Response
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response data
   * @param {string} message - Response message
   * @param {Object} meta - Additional metadata (pagination, etc.)
   */
  constructor(statusCode, data, message = 'Success', meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    
    if (meta) {
      this.meta = meta;
    }
  }

  /**
   * Convert response to JSON
   * @returns {Object}
   */
  toJSON() {
    const response = {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    };

    if (this.meta) {
      response.meta = this.meta;
    }

    return response;
  }

  // Static factory methods for common responses

  /**
   * 200 OK
   * @param {*} data
   * @param {string} message
   * @param {Object} meta
   * @returns {ApiResponse}
   */
  static ok(data, message = 'Success', meta = null) {
    return new ApiResponse(200, data, message, meta);
  }

  /**
   * 201 Created
   * @param {*} data
   * @param {string} message
   * @returns {ApiResponse}
   */
  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  /**
   * 204 No Content
   * @param {string} message
   * @returns {ApiResponse}
   */
  static noContent(message = 'Resource deleted successfully') {
    return new ApiResponse(204, null, message);
  }

  /**
   * Paginated response with metadata
   * @param {Array} data - Array of items
   * @param {Object} pagination - Pagination info
   * @param {string} message
   * @returns {ApiResponse}
   */
  static paginated(data, pagination, message = 'Success') {
    const meta = {
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.limit,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1,
      },
    };
    return new ApiResponse(200, data, message, meta);
  }
}

export default ApiResponse;
