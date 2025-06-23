const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const insurancePolicySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  policyNumber: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  coverageType: {
    type: String,
    enum: ['Comprehensive', 'Theft Only', 'Damage Only', 'Travel', 'Professional', 'Custom'],
    default: 'Comprehensive'
  },
  coverageDetails: {
    type: String
  },
  premium: {
    type: Number
  },
  deductible: {
    type: Number,
    default: 0
  },
  documents: [{
    type: String // URLs to S3
  }],
  coveredItems: [{
    type: Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  claimHistory: [{
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Denied', 'Paid'],
      default: 'Pending'
    },
    items: [{
      itemId: {
        type: Schema.Types.ObjectId,
        ref: 'Equipment'
      },
      damageDescription: String,
      claimAmount: Number
    }],
    documents: [{
      type: String // URLs to S3
    }]
  }],
  autoRenew: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for better query performance
insurancePolicySchema.index({ userId: 1 });
insurancePolicySchema.index({ endDate: 1 });
insurancePolicySchema.index({ 'coveredItems': 1 });

// Virtual for policy status
insurancePolicySchema.virtual('status').get(function() {
  const now = new Date();
  
  if (!this.isActive) {
    return 'Inactive';
  }
  
  if (this.endDate < now) {
    return 'Expired';
  }
  
  if (this.startDate > now) {
    return 'Future';
  }
  
  return 'Active';
});

// Virtual for days remaining until expiration
insurancePolicySchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = new Date(this.endDate);
  
  if (endDate < now) {
    return 0;
  }
  
  const diffTime = Math.abs(endDate - now);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if policy is expiring soon (within 30 days)
insurancePolicySchema.methods.isExpiringSoon = function() {
  const daysRemaining = this.daysRemaining;
  return daysRemaining > 0 && daysRemaining <= 30;
};

// Method to add a claim
insurancePolicySchema.methods.addClaim = async function(claimData) {
  this.claimHistory.push(claimData);
  return this.save();
};

// Method to get total coverage value
insurancePolicySchema.methods.getTotalCoverageValue = async function() {
  const populatedPolicy = await this.populate('coveredItems');
  
  return populatedPolicy.coveredItems.reduce((total, item) => {
    return total + (item.currentValue || 0);
  }, 0);
};

const InsurancePolicy = mongoose.model('InsurancePolicy', insurancePolicySchema);

module.exports = InsurancePolicy;