const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;

// Preferences sub-schema
const preferencesSchema = new Schema({
  notificationPreferences: {
    maintenanceReminders: {
      type: Boolean,
      default: true
    },
    insuranceReminders: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: false
    }
  },
  displayPreferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    defaultView: {
      type: String,
      enum: ['list', 'grid', 'calendar'],
      default: 'grid'
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, { _id: false });

// User schema
const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  userType: {
    type: String,
    enum: ['individual', 'band', 'studio', 'venue', 'admin'],
    default: 'individual'
  },
  bandId: {
    type: Schema.Types.ObjectId,
    ref: 'Band'
  },
  preferences: {
    type: preferencesSchema,
    default: () => ({})
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ bandId: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || 'User';
});

// Method to check if password is correct
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      userType: this.userType
    },
    process.env.JWT_SECRET || 'musician-gear-tracker-secret',
    { expiresIn: '7d' }
  );
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to handle login
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
  
  // Update last login time
  user.lastLogin = Date.now();
  await user.save();
  
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;