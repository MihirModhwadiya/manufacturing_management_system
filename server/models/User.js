// Import Mongoose library for MongoDB object modeling
import mongoose from 'mongoose';

// Define User schema for MongoDB collection with authentication and role management
const userSchema = new mongoose.Schema({
  // User's full name - required field with automatic whitespace trimming
  name: { 
    type: String, 
    required: true, // Name is mandatory for all users
    trim: true // Remove leading/trailing spaces automatically
  },
  // Email address - unique identifier with automatic lowercase conversion
  email: { 
    type: String, 
    required: true, // Email is mandatory for authentication
    unique: true, // Prevents duplicate email registrations
    lowercase: true, // Convert to lowercase for consistency
    trim: true // Remove spaces automatically
  },
  // Encrypted password hash - stored securely using bcrypt
  passwordHash: { 
    type: String, 
    required: true // Password hash is mandatory for authentication
  },

  // User role for access control - defines what features user can access
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'operator', 'inventory'], // Only these roles allowed
    required: true, // Role is mandatory for permission system
    default: 'operator' // Default role for new users
  },
  // Account status flag - allows administrators to deactivate users
  isActive: { 
    type: Boolean, 
    default: true // New accounts are active by default
  },
  // Email verification status - tracks if user verified their email
  isVerified: {
    type: Boolean,
    default: false // Users must verify email before login
  },
  // Last login timestamp - tracks user activity for security monitoring
  lastLogin: {
    type: Date,
    default: null // Initially null until first login
  },
  // User avatar initials - generated from name for display
  avatar: {
    type: String,
    default: function() {
      return this.name ? this.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
    }
  },
  // User's department within organization
  department: {
    type: String,
    trim: true
  },
  // Employee ID for HR and organizational tracking
  employeeId: {
    type: String,
    trim: true
  },
  // User notification preferences
  notifications: {
    email: { type: Boolean, default: true },
    workOrders: { type: Boolean, default: true },
    stockAlerts: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: false }
  }
}, {
  // Automatically add createdAt and updatedAt timestamp fields
  timestamps: true // Mongoose handles these automatically
});

// Create database indexes for faster queries and enforce uniqueness
userSchema.index({ email: 1 }); // Index on email for fast lookups
userSchema.index({ role: 1 }); // Index on role for role-based queries

// Export User model for use in routes and other files
export default mongoose.model('User', userSchema);
