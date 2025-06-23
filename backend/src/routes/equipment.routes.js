const express = require('express');
const { body, param, query } = require('express-validator');
const equipmentController = require('../controllers/equipment.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/v1/equipment
 * @desc Get all equipment for the authenticated user
 * @access Private
 */
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isString()
      .withMessage('Sort must be a string'),
    query('type')
      .optional()
      .isString()
      .withMessage('Type must be a string'),
    query('search')
      .optional()
      .isString()
      .withMessage('Search must be a string')
  ],
  validateRequest,
  equipmentController.getAllEquipment
);

/**
 * @route GET /api/v1/equipment/:id
 * @desc Get equipment by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid equipment ID')
  ],
  validateRequest,
  equipmentController.getEquipmentById
);

/**
 * @route POST /api/v1/equipment
 * @desc Create new equipment
 * @access Private
 */
router.post(
  '/',
  [
    body('name')
      .notEmpty()
      .withMessage('Equipment name is required')
      .isString()
      .withMessage('Name must be a string')
      .trim(),
    body('type')
      .notEmpty()
      .withMessage('Equipment type is required')
      .isString()
      .withMessage('Type must be a string')
      .trim(),
    body('category')
      .optional()
      .isString()
      .withMessage('Category must be a string')
      .trim(),
    body('make')
      .optional()
      .isString()
      .withMessage('Make must be a string')
      .trim(),
    body('model')
      .optional()
      .isString()
      .withMessage('Model must be a string')
      .trim(),
    body('serialNumber')
      .optional()
      .isString()
      .withMessage('Serial number must be a string')
      .trim(),
    body('purchaseDate')
      .optional()
      .isISO8601()
      .withMessage('Purchase date must be a valid date'),
    body('purchasePrice')
      .optional()
      .isNumeric()
      .withMessage('Purchase price must be a number'),
    body('currentValue')
      .optional()
      .isNumeric()
      .withMessage('Current value must be a number'),
    body('condition')
      .optional()
      .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Not Working'])
      .withMessage('Invalid condition value'),
    body('location')
      .optional()
      .isString()
      .withMessage('Location must be a string')
      .trim(),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string')
  ],
  validateRequest,
  equipmentController.createEquipment
);

/**
 * @route PUT /api/v1/equipment/:id
 * @desc Update equipment by ID
 * @access Private
 */
router.put(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid equipment ID'),
    body('name')
      .optional()
      .isString()
      .withMessage('Name must be a string')
      .trim(),
    body('type')
      .optional()
      .isString()
      .withMessage('Type must be a string')
      .trim(),
    body('category')
      .optional()
      .isString()
      .withMessage('Category must be a string')
      .trim(),
    body('make')
      .optional()
      .isString()
      .withMessage('Make must be a string')
      .trim(),
    body('model')
      .optional()
      .isString()
      .withMessage('Model must be a string')
      .trim(),
    body('serialNumber')
      .optional()
      .isString()
      .withMessage('Serial number must be a string')
      .trim(),
    body('purchaseDate')
      .optional()
      .isISO8601()
      .withMessage('Purchase date must be a valid date'),
    body('purchasePrice')
      .optional()
      .isNumeric()
      .withMessage('Purchase price must be a number'),
    body('currentValue')
      .optional()
      .isNumeric()
      .withMessage('Current value must be a number'),
    body('condition')
      .optional()
      .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Not Working'])
      .withMessage('Invalid condition value'),
    body('location')
      .optional()
      .isString()
      .withMessage('Location must be a string')
      .trim(),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string')
  ],
  validateRequest,
  equipmentController.updateEquipment
);

/**
 * @route DELETE /api/v1/equipment/:id
 * @desc Delete equipment by ID
 * @access Private
 */
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid equipment ID')
  ],
  validateRequest,
  equipmentController.deleteEquipment
);

/**
 * @route POST /api/v1/equipment/:id/maintenance
 * @desc Add maintenance record to equipment
 * @access Private
 */
router.post(
  '/:id/maintenance',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid equipment ID'),
    body('service')
      .notEmpty()
      .withMessage('Service description is required')
      .isString()
      .withMessage('Service must be a string'),
    body('date')
      .notEmpty()
      .withMessage('Maintenance date is required')
      .isISO8601()
      .withMessage('Maintenance date must be a valid date'),
    body('provider')
      .optional()
      .isString()
      .withMessage('Provider must be a string'),
    body('cost')
      .optional()
      .isNumeric()
      .withMessage('Cost must be a number'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string')
  ],
  validateRequest,
  equipmentController.addMaintenanceRecord
);

/**
 * @route POST /api/v1/equipment/:id/schedule
 * @desc Add maintenance schedule to equipment
 * @access Private
 */
router.post(
  '/:id/schedule',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid equipment ID'),
    body('taskType')
      .notEmpty()
      .withMessage('Task type is required')
      .isString()
      .withMessage('Task type must be a string'),
    body('frequency')
      .notEmpty()
      .withMessage('Frequency is required')
      .isString()
      .withMessage('Frequency must be a string'),
    body('lastPerformed')
      .optional()
      .isISO8601()
      .withMessage('Last performed date must be a valid date'),
    body('nextDue')
      .optional()
      .isISO8601()
      .withMessage('Next due date must be a valid date')
  ],
  validateRequest,
  equipmentController.addMaintenanceSchedule
);

/**
 * @route GET /api/v1/equipment/maintenance/due
 * @desc Get all equipment with maintenance due
 * @access Private
 */
router.get(
  '/maintenance/due',
  equipmentController.getMaintenanceDue
);

/**
 * @route POST /api/v1/equipment/:id/images
 * @desc Upload equipment images
 * @access Private
 */
router.post(
  '/:id/images',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid equipment ID')
  ],
  validateRequest,
  equipmentController.uploadImages
);

module.exports = router;