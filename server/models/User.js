import mongoose from 'mongoose';

// User schema definition for authentication and role-based access control
const userSchema = new mongoose.Schema({
  // User's full name - required field with whitespace trimming
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  // Email address - unique identifier with automatic lowercase conversion
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  // Encrypted password hash - stored as passwordHash for security
  passwordHash: { 
    type: String, 
    required: true
  },
  // User role for access control - enum ensures only valid roles are assigned
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'operator', 'inventory'],
    required: true,
    default: 'operator'
  },
  // Account status flag - allows admin to deactivate users
  isActive: { 
    type: Boolean, 
    default: true 
  },
  // Email verification status - ensures users verify their email addresses
  isVerified: {
    type: Boolean,
    default: false
  },
  // Last login timestamp for tracking user activity
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Create index on email field for faster queries and uniqueness enforcement
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
