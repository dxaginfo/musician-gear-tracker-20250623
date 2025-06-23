const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Maintenance schedule sub-schema
const maintenanceScheduleSchema = new Schema({
  taskType: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  lastPerformed: {
    type: Date
  },
  nextDue: {
    type: Date
  }
}, { _id: true });

// Maintenance history sub-schema
const maintenanceHistorySchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  provider: {
    type: String
  },
  cost: {
    type: Number
  },
  notes: {
    type: String
  }
}, { _id: true, timestamps: true });

// Insurance info sub-schema
const insuranceInfoSchema = new Schema({
  isInsured: {
    type: Boolean,
    default: false
  },
  policyId: {
    type: Schema.Types.ObjectId,
    ref: 'InsurancePolicy'
  },
  coverageAmount: {
    type: Number
  }
}, { _id: false });

// Main Equipment schema
const equipmentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  make: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number
  },
  currentValue: {
    type: Number
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Not Working'],
    default: 'Good'
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String
  },
  images: [{
    type: String // URLs to S3
  }],
  documents: [{
    type: String // URLs to S3
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  insuranceInfo: {
    type: insuranceInfoSchema,
    default: () => ({})
  },
  maintenanceSchedule: [maintenanceScheduleSchema],
  maintenanceHistory: [maintenanceHistorySchema]
}, { timestamps: true });

// Indexes for better query performance
equipmentSchema.index({ userId: 1 });
equipmentSchema.index({ type: 1 });
equipmentSchema.index({ make: 1, model: 1 });
equipmentSchema.index({ 'insuranceInfo.policyId': 1 });

// Virtual for age of equipment
equipmentSchema.virtual('age').get(function() {
  if (!this.purchaseDate) return null;
  const diffTime = Math.abs(Date.now() - this.purchaseDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365);
});

// Method to check if maintenance is due
equipmentSchema.methods.isMaintenanceDue = function() {
  if (!this.maintenanceSchedule || this.maintenanceSchedule.length === 0) {
    return false;
  }
  
  const now = new Date();
  return this.maintenanceSchedule.some(schedule => 
    schedule.nextDue && schedule.nextDue <= now
  );
};

// Pre-save hook to calculate next maintenance dates
equipmentSchema.pre('save', function(next) {
  // Calculate next maintenance dates based on frequency if not set
  if (this.isModified('maintenanceSchedule')) {
    this.maintenanceSchedule.forEach(schedule => {
      if (schedule.lastPerformed && !schedule.nextDue) {
        const lastPerformed = new Date(schedule.lastPerformed);
        
        switch (schedule.frequency.toLowerCase()) {
          case 'daily':
            schedule.nextDue = new Date(lastPerformed.setDate(lastPerformed.getDate() + 1));
            break;
          case 'weekly':
            schedule.nextDue = new Date(lastPerformed.setDate(lastPerformed.getDate() + 7));
            break;
          case 'monthly':
            schedule.nextDue = new Date(lastPerformed.setMonth(lastPerformed.getMonth() + 1));
            break;
          case 'quarterly':
            schedule.nextDue = new Date(lastPerformed.setMonth(lastPerformed.getMonth() + 3));
            break;
          case 'yearly':
            schedule.nextDue = new Date(lastPerformed.setFullYear(lastPerformed.getFullYear() + 1));
            break;
        }
      }
    });
  }
  next();
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;