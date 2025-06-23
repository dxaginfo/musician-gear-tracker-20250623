const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

/**
 * Middleware to validate request using express-validator
 * Throws an error if validation fails
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const errorMessage = `${firstError.path}: ${firstError.msg}`;
    
    // Return validation error with details
    throw ApiError.validationError(
      errorMessage,
      'VALIDATION_ERROR'
    );
  }
  
  next();
};

module.exports = validateRequest;