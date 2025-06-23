const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

/**
 * Middleware to validate request using express-validator
 * Throws an error if validation fails
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => {
      return {
        field: error.path,
        message: error.msg,
        value: error.value
      };
    });
    
    // For API consumers, it's helpful to return all validation errors at once
    throw ApiError.validationError(
      'Validation failed',
      'VALIDATION_ERROR'
    ).withDetails(errorMessages);
  }
  
  next();
};

module.exports = validateRequest;