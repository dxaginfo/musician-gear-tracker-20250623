const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Member schema for band members
const memberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  permissions: [{
    type: String,
    enum: [
      'admin',       // Full control
      'edit',        // Can edit equipment
      'view',        // Can only view equipment
      'maintenance', // Can schedule/update maintenance
      'inventory'    // Can manage inventory
    ],
    default: ['view']
  }],
  dateJoined: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

// Band/Organization schema
const bandSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  members: [memberSchema],
  sharedEquipment: [{
    type: Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  logo: {
    type: String // URL to S3
  },
  contactEmail: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String
  },
  genre: [{
    type: String,
    trim: true
  }],
  founded: {
    type: Date
  },
  events: [{
    name: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    location: String,
    notes: String,
    equipment: [{
      type: Schema.Types.ObjectId,
      ref: 'Equipment'
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for better query performance
bandSchema.index({ name: 'text' });
bandSchema.index({ 'members.userId': 1 });

// Virtual for age of band
bandSchema.virtual('age').get(function() {
  if (!this.founded) return null;
  const diffTime = Math.abs(Date.now() - this.founded);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365);
});

// Method to check if a user is a member
bandSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && member.isActive
  );
};

// Method to check if a user has specific permission
bandSchema.methods.hasPermission = function(userId, permission) {
  const member = this.members.find(m => 
    m.userId.toString() === userId.toString() && m.isActive
  );
  
  if (!member) return false;
  
  // Admin has all permissions
  if (member.permissions.includes('admin')) return true;
  
  return member.permissions.includes(permission);
};

// Method to add a member
bandSchema.methods.addMember = function(memberData) {
  const existingMemberIndex = this.members.findIndex(
    m => m.userId.toString() === memberData.userId.toString()
  );
  
  if (existingMemberIndex >= 0) {
    // Update existing member
    const existingMember = this.members[existingMemberIndex];
    existingMember.role = memberData.role || existingMember.role;
    existingMember.permissions = memberData.permissions || existingMember.permissions;
    existingMember.isActive = true;
  } else {
    // Add new member
    this.members.push(memberData);
  }
  
  return this.save();
};

// Method to remove a member
bandSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(
    m => m.userId.toString() === userId.toString()
  );
  
  if (memberIndex >= 0) {
    this.members[memberIndex].isActive = false;
    return this.save();
  }
  
  return Promise.resolve(this);
};

const Band = mongoose.model('Band', bandSchema);

module.exports = Band;