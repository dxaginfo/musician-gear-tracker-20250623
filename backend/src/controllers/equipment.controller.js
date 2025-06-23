const { Equipment } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc Get all equipment for the authenticated user
 * @route GET /api/v1/equipment
 * @access Private
 */
const getAllEquipment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const type = req.query.type;
    const search = req.query.search;
    
    // Build filter
    const filter = { userId };
    
    if (type) {
      filter.type = type;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const equipment = await Equipment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Equipment.countDocuments(filter);
    
    // Return success response
    res.status(200).json({
      success: true,
      data: {
        equipment,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get equipment by ID
 * @route GET /api/v1/equipment/:id
 * @access Private
 */
const getEquipmentById = async (req, res, next) => {
  try {
    const equipmentId = req.params.id;
    const userId = req.user._id;
    
    // Find equipment by ID and owner
    const equipment = await Equipment.findOne({
      _id: equipmentId,
      userId
    });
    
    if (!equipment) {
      throw ApiError.notFound('Equipment not found');
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      data: {
        equipment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new equipment
 * @route POST /api/v1/equipment
 * @access Private
 */
const createEquipment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Create equipment
    const equipment = await Equipment.create({
      ...req.body,
      userId
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: {
        equipment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update equipment by ID
 * @route PUT /api/v1/equipment/:id
 * @access Private
 */
const updateEquipment = async (req, res, next) => {
  try {
    const equipmentId = req.params.id;
    const userId = req.user._id;
    
    // Find equipment by ID and owner
    let equipment = await Equipment.findOne({
      _id: equipmentId,
      userId
    });
    
    if (!equipment) {
      throw ApiError.notFound('Equipment not found');
    }
    
    // Update equipment
    equipment = await Equipment.findByIdAndUpdate(
      equipmentId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: {
        equipment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete equipment by ID
 * @route DELETE /api/v1/equipment/:id
 * @access Private
 */
const deleteEquipment = async (req, res, next) => {
  try {
    const equipmentId = req.params.id;
    const userId = req.user._id;
    
    // Find equipment by ID and owner
    const equipment = await Equipment.findOne({
      _id: equipmentId,
      userId
    });
    
    if (!equipment) {
      throw ApiError.notFound('Equipment not found');
    }
    
    // Delete equipment
    await Equipment.findByIdAndDelete(equipmentId);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add maintenance record to equipment
 * @route POST /api/v1/equipment/:id/maintenance
 * @access Private
 */
const addMaintenanceRecord = async (req, res, next) => {
  try {
    const equipmentId = req.params.id;
    const userId = req.user._id;
    const { service, date, provider, cost, notes } = req.body;
    
    // Find equipment by ID and owner
    const equipment = await Equipment.findOne({
      _id: equipmentId,
      userId
    });
    
    if (!equipment) {
      throw ApiError.notFound('Equipment not found');
    }
    
    // Add maintenance record
    equipment.maintenanceHistory.push({
      service,
      date,
      provider,
      cost,
      notes
    });
    
    // Save equipment
    await equipment.save();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Maintenance record added successfully',
      data: {
        equipment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add maintenance schedule to equipment
 * @route POST /api/v1/equipment/:id/schedule
 * @access Private
 */
const addMaintenanceSchedule = async (req, res, next) => {
  try {
    const equipmentId = req.params.id;
    const userId = req.user._id;
    const { taskType, frequency, lastPerformed, nextDue } = req.body;
    
    // Find equipment by ID and owner
    const equipment = await Equipment.findOne({
      _id: equipmentId,
      userId
    });
    
    if (!equipment) {
      throw ApiError.notFound('Equipment not found');
    }
    
    // Add maintenance schedule
    equipment.maintenanceSchedule.push({
      taskType,
      frequency,
      lastPerformed,
      nextDue
    });
    
    // Save equipment
    await equipment.save();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Maintenance schedule added successfully',
      data: {
        equipment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all equipment with maintenance due
 * @route GET /api/v1/equipment/maintenance/due
 * @access Private
 */
const getMaintenanceDue = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    
    // Find equipment with maintenance due
    const equipment = await Equipment.find({
      userId,
      'maintenanceSchedule.nextDue': { $lte: now }
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      data: {
        equipment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Upload equipment images
 * @route POST /api/v1/equipment/:id/images
 * @access Private
 */
const uploadImages = async (req, res, next) => {
  try {
    // This is a placeholder - real implementation would use AWS S3 or similar
    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        imageUrls: []
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  addMaintenanceRecord,
  addMaintenanceSchedule,
  getMaintenanceDue,
  uploadImages
};