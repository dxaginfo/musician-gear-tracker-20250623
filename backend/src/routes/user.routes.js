const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/v1/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', userController.getCurrentUser);

/**
 * @route PUT /api/v1/users/me
 * @desc Update current user profile
 * @access Private
 */
router.put(
  '/me',
  [
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
    body('phone')
      .optional()
      .isString()
      .withMessage('Phone must be a string'),
    body('bio')
      .optional()
      .isString()
      .withMessage('Bio must be a string'),
    body('profileImage')
      .optional()
      .isString()
      .withMessage('Profile image must be a string')
  ],
  validateRequest,
  userController.updateCurrentUser
);

/**
 * @route PUT /api/v1/users/me/password
 * @desc Update current user password
 * @access Private
 */
router.put(
  '/me/password',
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      .withMessage('Password must include uppercase, lowercase, number, and special character')
  ],
  validateRequest,
  userController.updatePassword
);

/**
 * @route GET /api/v1/users/me/notifications
 * @desc Get current user notifications
 * @access Private
 */
router.get('/me/notifications', userController.getNotifications);

/**
 * @route PUT /api/v1/users/me/notifications/:id
 * @desc Mark notification as read
 * @access Private
 */
router.put(
  '/me/notifications/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid notification ID')
  ],
  validateRequest,
  userController.markNotificationRead
);

/**
 * @route PUT /api/v1/users/me/notifications
 * @desc Mark all notifications as read
 * @access Private
 */
router.put('/me/notifications', userController.markAllNotificationsRead);

/**
 * @route GET /api/v1/users/me/settings
 * @desc Get user settings
 * @access Private
 */
router.get('/me/settings', userController.getUserSettings);

/**
 * @route PUT /api/v1/users/me/settings
 * @desc Update user settings
 * @access Private
 */
router.put(
  '/me/settings',
  [
    body('emailNotifications')
      .optional()
      .isBoolean()
      .withMessage('Email notifications must be a boolean'),
    body('pushNotifications')
      .optional()
      .isBoolean()
      .withMessage('Push notifications must be a boolean'),
    body('maintenanceReminders')
      .optional()
      .isBoolean()
      .withMessage('Maintenance reminders must be a boolean'),
    body('theme')
      .optional()
      .isIn(['light', 'dark', 'system'])
      .withMessage('Theme must be light, dark, or system'),
    body('language')
      .optional()
      .isString()
      .withMessage('Language must be a string')
  ],
  validateRequest,
  userController.updateUserSettings
);

/**
 * @route GET /api/v1/users/me/activity
 * @desc Get user activity log
 * @access Private
 */
router.get('/me/activity', userController.getUserActivity);

/**
 * @route DELETE /api/v1/users/me
 * @desc Delete current user account
 * @access Private
 */
router.delete(
  '/me',
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required for account deletion')
  ],
  validateRequest,
  userController.deleteAccount
);

module.exports = router;