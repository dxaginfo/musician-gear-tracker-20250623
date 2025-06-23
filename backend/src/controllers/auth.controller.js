const crypto = require('crypto');
const { User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc Register a new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, userType } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict(
        'User with this email already exists',
        'USER_EXISTS'
      );
    }
    
    // Generate email verification token
    const emailVerificationToken = crypto
      .randomBytes(32)
      .toString('hex');
    
    // Create new user
    const user = await User.create({
      email,
      passwordHash: password, // Will be hashed by the pre-save hook
      firstName,
      lastName,
      userType: userType || 'individual',
      emailVerificationToken,
      emailVerified: false
    });
    
    // Generate JWT token
    const token = user.generateAuthToken();
    
    // TODO: Send email verification email
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          emailVerified: user.emailVerified
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user and check password
    const user = await User.login(email, password);
    
    // Generate JWT token
    const token = user.generateAuthToken();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          emailVerified: user.emailVerified
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(ApiError.unauthorized('Invalid email or password'));
  }
};

/**
 * @desc Request password reset
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // Return success anyway to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to email'
      });
    }
    
    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set password reset token and expiry
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // TODO: Send password reset email
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to email'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reset password with token
 * @route POST /api/v1/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    // Find user by reset token and check expiry
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      throw ApiError.badRequest(
        'Invalid or expired password reset token',
        'INVALID_RESET_TOKEN'
      );
    }
    
    // Update password
    user.passwordHash = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // Generate new JWT token
    const jwtToken = user.generateAuthToken();
    
    // TODO: Send password changed email
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {
        token: jwtToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify email with token
 * @route POST /api/v1/auth/verify-email
 * @access Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    // Find user by verification token
    const user = await User.findOne({
      emailVerificationToken: token
    });
    
    if (!user) {
      throw ApiError.badRequest(
        'Invalid email verification token',
        'INVALID_VERIFICATION_TOKEN'
      );
    }
    
    // Update user
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Logout user
 * @route POST /api/v1/auth/logout
 * @access Private
 */
const logout = async (req, res, next) => {
  try {
    // JWT is stateless, so we don't need to invalidate it on the server
    // Client should remove the token from storage
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout
};