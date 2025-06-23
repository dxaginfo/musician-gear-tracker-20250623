const crypto = require('crypto');
const jwt = require('jsonwebtoken');
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
    
    // Generate JWT token and refresh token
    const { token, refreshToken } = user.generateAuthTokens();
    
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
        token,
        refreshToken
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
    
    // Generate JWT token and refresh token
    const { token, refreshToken } = user.generateAuthTokens();
    
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
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(ApiError.unauthorized('Invalid email or password'));
  }
};

/**
 * @desc Refresh access token using refresh token
 * @route POST /api/v1/auth/refresh-token
 * @access Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: refreshTokenFromClient } = req.body;
    
    if (!refreshTokenFromClient) {
      throw ApiError.badRequest('Refresh token is required');
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshTokenFromClient,
      process.env.JWT_REFRESH_SECRET || 'musician-gear-tracker-refresh-secret'
    );
    
    // Find user by ID
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    
    // Generate new access token
    const { token, refreshToken: newRefreshToken } = user.generateAuthTokens();
    
    // Return new tokens
    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired refresh token'));
    }
    next(error);
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
    const { token: jwtToken, refreshToken } = user.generateAuthTokens();
    
    // TODO: Send password changed email
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {
        token: jwtToken,
        refreshToken
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
 * @desc Resend verification email
 * @route POST /api/v1/auth/resend-verification
 * @access Public
 */
const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // Return success anyway to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'Verification email sent'
      });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email is already verified',
          code: 'EMAIL_ALREADY_VERIFIED'
        }
      });
    }
    
    // Generate new verification token
    const emailVerificationToken = crypto
      .randomBytes(32)
      .toString('hex');
    
    user.emailVerificationToken = emailVerificationToken;
    await user.save();
    
    // TODO: Send verification email
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Check if user is authenticated
 * @route GET /api/v1/auth/check
 * @access Private
 */
const checkAuth = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          userType: req.user.userType,
          emailVerified: req.user.emailVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Login/register with Google OAuth
 * @route POST /api/v1/auth/social/google
 * @access Public
 */
const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    
    // TODO: Verify Google ID token
    // const ticket = await googleClient.verifyIdToken({
    //   idToken,
    //   audience: process.env.GOOGLE_CLIENT_ID
    // });
    // const payload = ticket.getPayload();
    
    // For now, just create a mock payload
    const payload = {
      email: 'google-user@example.com',
      given_name: 'Google',
      family_name: 'User',
      email_verified: true
    };
    
    // Check if user already exists
    let user = await User.findOne({ email: payload.email });
    
    if (user) {
      // User exists, update if needed
      if (!user.googleId) {
        user.googleId = payload.sub;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        googleId: payload.sub,
        emailVerified: payload.email_verified,
        passwordHash: crypto.randomBytes(16).toString('hex') // Random password
      });
    }
    
    // Generate JWT token and refresh token
    const { token, refreshToken } = user.generateAuthTokens();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          emailVerified: user.emailVerified
        },
        token,
        refreshToken
      }
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
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  checkAuth,
  googleAuth,
  logout
};