const logger = require('../utils/logger');

/**
 * Custom API error class
 */
class ApiError extends Error {
  constructor(statusCode, message, code = 'SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = null;
    
    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Add detailed error information
   * @param {Object|Array} details - Detailed error information
   * @returns {ApiError} - Returns this for chaining
   */
  withDetails(details) {
    this.details = details;
    return this;
  }
  
  // Factory methods for common errors
  static badRequest(message, code = 'BAD_REQUEST') {
    return new ApiError(400, message, code);
  }
  
  static unauthorized(message, code = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }
  
  static forbidden(message, code = 'FORBIDDEN') {
    return new ApiError(403, message, code);
  }
  
  static notFound(message, code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }
  
  static validationError(message, code = 'VALIDATION_ERROR') {
    return new ApiError(422, message, code);
  }
  
  static conflict(message, code = 'CONFLICT') {
    return new ApiError(409, message, code);
  }
  
  static internalError(message, code = 'SERVER_ERROR') {
    return new ApiError(500, message, code);
  }
  
  static tooManyRequests(message, code = 'RATE_LIMIT_EXCEEDED') {
    return new ApiError(429, message, code);
  }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  // Check if error is an instance of ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(err.details && { details: err.details })
      }
    });
  }
  
  // Check for Mongoose validation errors
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors).map(field => ({
      field,
      message: err.errors[field].message,
      value: err.errors[field].value
    }));
    
    return res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details
      }
    });
  }
  
  // Check for Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return res.status(409).json({
      success: false,
      error: {
        message: `Duplicate value for ${field}`,
        code: 'DUPLICATE_ERROR',
        details: [{ field, value }]
      }
    });
  }
  
  // Check for JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      }
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      }
    });
  }
  
  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';
  const code = err.code || 'SERVER_ERROR';
  
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      // Only include stack trace in development
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

module.exports = {
  ApiError,
  errorHandler
};