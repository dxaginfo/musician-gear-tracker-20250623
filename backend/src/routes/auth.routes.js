const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      .withMessage('Password must include uppercase, lowercase, number, and special character'),
    body('firstName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),
    body('lastName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),
    body('userType')
      .optional()
      .isIn(['individual', 'band', 'studio', 'venue'])
      .withMessage('Invalid user type')
  ],
  validateRequest,
  authController.register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validateRequest,
  authController.login
);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
  ],
  validateRequest,
  authController.forgotPassword
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      .withMessage('Password must include uppercase, lowercase, number, and special character')
  ],
  validateRequest,
  authController.resetPassword
);

/**
 * @route POST /api/v1/auth/verify-email
 * @desc Verify email with token
 * @access Public
 */
router.post(
  '/verify-email',
  [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required')
  ],
  validateRequest,
  authController.verifyEmail
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authController.logout);

module.exports = router;