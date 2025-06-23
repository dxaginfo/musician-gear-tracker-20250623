const express = require('express');
const { body, param, query } = require('express-validator');
const insuranceController = require('../controllers/insurance.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/v1/insurance
 * @desc Get all insurance policies for the authenticated user
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
    query('status')
      .optional()
      .isString()
      .withMessage('Status must be a string')
  ],
  validateRequest,
  insuranceController.getAllPolicies
);

/**
 * @route GET /api/v1/insurance/:id
 * @desc Get insurance policy by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid insurance policy ID')
  ],
  validateRequest,
  insuranceController.getPolicyById
);

/**
 * @route POST /api/v1/insurance
 * @desc Create new insurance policy
 * @access Private
 */
router.post(
  '/',
  [
    body('provider')
      .notEmpty()
      .withMessage('Insurance provider is required')
      .isString()
      .withMessage('Provider must be a string')
      .trim(),
    body('policyNumber')
      .notEmpty()
      .withMessage('Policy number is required')
      .isString()
      .withMessage('Policy number must be a string')
      .trim(),
    body('coverageType')
      .notEmpty()
      .withMessage('Coverage type is required')
      .isString()
      .withMessage('Coverage type must be a string')
      .trim(),
    body('startDate')
      .notEmpty()
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    body('endDate')
      .notEmpty()
      .withMessage('End date is required')
      .isISO8601()
      .withMessage('End date must be a valid date'),
    body('coverageAmount')
      .notEmpty()
      .withMessage('Coverage amount is required')
      .isNumeric()
      .withMessage('Coverage amount must be a number'),
    body('premium')
      .optional()
      .isNumeric()
      .withMessage('Premium must be a number'),
    body('deductible')
      .optional()
      .isNumeric()
      .withMessage('Deductible must be a number'),
    body('coveredEquipment')
      .optional()
      .isArray()
      .withMessage('Covered equipment must be an array'),
    body('coveredEquipment.*')
      .optional()
      .isMongoId()
      .withMessage('Invalid equipment ID in covered equipment'),
    body('documents')
      .optional()
      .isArray()
      .withMessage('Documents must be an array'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string')
  ],
  validateRequest,
  insuranceController.createPolicy
);

/**
 * @route PUT /api/v1/insurance/:id
 * @desc Update insurance policy by ID
 * @access Private
 */
router.put(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid insurance policy ID'),
    body('provider')
      .optional()
      .isString()
      .withMessage('Provider must be a string')
      .trim(),
    body('policyNumber')
      .optional()
      .isString()
      .withMessage('Policy number must be a string')
      .trim(),
    body('coverageType')
      .optional()
      .isString()
      .withMessage('Coverage type must be a string')
      .trim(),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date'),
    body('coverageAmount')
      .optional()
      .isNumeric()
      .withMessage('Coverage amount must be a number'),
    body('premium')
      .optional()
      .isNumeric()
      .withMessage('Premium must be a number'),
    body('deductible')
      .optional()
      .isNumeric()
      .withMessage('Deductible must be a number'),
    body('coveredEquipment')
      .optional()
      .isArray()
      .withMessage('Covered equipment must be an array'),
    body('coveredEquipment.*')
      .optional()
      .isMongoId()
      .withMessage('Invalid equipment ID in covered equipment'),
    body('documents')
      .optional()
      .isArray()
      .withMessage('Documents must be an array'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string')
  ],
  validateRequest,
  insuranceController.updatePolicy
);

/**
 * @route DELETE /api/v1/insurance/:id
 * @desc Delete insurance policy by ID
 * @access Private
 */
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid insurance policy ID')
  ],
  validateRequest,
  insuranceController.deletePolicy
);

/**
 * @route POST /api/v1/insurance/:id/claim
 * @desc Add insurance claim to policy
 * @access Private
 */
router.post(
  '/:id/claim',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid insurance policy ID'),
    body('claimNumber')
      .notEmpty()
      .withMessage('Claim number is required')
      .isString()
      .withMessage('Claim number must be a string'),
    body('dateOfIncident')
      .notEmpty()
      .withMessage('Date of incident is required')
      .isISO8601()
      .withMessage('Date of incident must be a valid date'),
    body('dateOfClaim')
      .notEmpty()
      .withMessage('Date of claim is required')
      .isISO8601()
      .withMessage('Date of claim must be a valid date'),
    body('claimAmount')
      .notEmpty()
      .withMessage('Claim amount is required')
      .isNumeric()
      .withMessage('Claim amount must be a number'),
    body('claimReason')
      .notEmpty()
      .withMessage('Claim reason is required')
      .isString()
      .withMessage('Claim reason must be a string'),
    body('affectedEquipment')
      .optional()
      .isArray()
      .withMessage('Affected equipment must be an array'),
    body('affectedEquipment.*')
      .optional()
      .isMongoId()
      .withMessage('Invalid equipment ID in affected equipment'),
    body('claimStatus')
      .notEmpty()
      .withMessage('Claim status is required')
      .isIn(['Filed', 'In Progress', 'Approved', 'Partially Approved', 'Denied', 'Closed'])
      .withMessage('Invalid claim status'),
    body('documents')
      .optional()
      .isArray()
      .withMessage('Documents must be an array'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string')
  ],
  validateRequest,
  insuranceController.addClaim
);

/**
 * @route PUT /api/v1/insurance/:id/claim/:claimId
 * @desc Update insurance claim
 * @access Private
 */
router.put(
  '/:id/claim/:claimId',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid insurance policy ID'),
    param('claimId')
      .isMongoId()
      .withMessage('Invalid claim ID'),
    body('claimNumber')
      .optional()
      .isString()
      .withMessage('Claim number must be a string'),
    body('dateOfIncident')
      .optional()
      .isISO8601()
      .withMessage('Date of incident must be a valid date'),
    body('dateOfClaim')
      .optional()
      .isISO8601()
      .withMessage('Date of claim must be a valid date'),
    body('claimAmount')
      .optional()
      .isNumeric()
      .withMessage('Claim amount must be a number'),
    body('claimReason')
      .optional()
      .isString()
      .withMessage('Claim reason must be a string'),
    body('affectedEquipment')
      .optional()
      .isArray()
      .withMessage('Affected equipment must be an array'),
    body('affectedEquipment.*')
      .optional()
      .isMongoId()
      .withMessage('Invalid equipment ID in affected equipment'),
    body('claimStatus')
      .optional()
      .isIn(['Filed', 'In Progress', 'Approved', 'Partially Approved', 'Denied', 'Closed'])
      .withMessage('Invalid claim status'),
    body('documents')
      .optional()
      .isArray()
      .withMessage('Documents must be an array'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string')
  ],
  validateRequest,
  insuranceController.updateClaim
);

/**
 * @route DELETE /api/v1/insurance/:id/claim/:claimId
 * @desc Delete insurance claim
 * @access Private
 */
router.delete(
  '/:id/claim/:claimId',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid insurance policy ID'),
    param('claimId')
      .isMongoId()
      .withMessage('Invalid claim ID')
  ],
  validateRequest,
  insuranceController.deleteClaim
);

/**
 * @route GET /api/v1/insurance/expiring
 * @desc Get soon-to-expire insurance policies
 * @access Private
 */
router.get('/expiring', insuranceController.getExpiringPolicies);

module.exports = router;