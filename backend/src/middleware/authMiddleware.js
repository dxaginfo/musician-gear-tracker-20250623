const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiError } = require('./errorHandler');

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token from the Authorization header
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authorization token required');
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw ApiError.unauthorized('Authorization token required');
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'musician-gear-tracker-secret'
      );
      
      // Find user from token
      const user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!user) {
        throw ApiError.unauthorized('User not found');
      }
      
      if (!user.isActive) {
        throw ApiError.forbidden('User account is inactive');
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Invalid token');
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;