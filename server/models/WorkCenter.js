import mongoose from 'mongoose';

const workCenterSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    required: true,
    enum: ['manufacturing', 'assembly', 'quality', 'packaging', 'maintenance'],
    default: 'manufacturing'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    min: 1,
    default: 1
  },
  hourlyRate: {
    type: Number,
    min: 0,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'busy', 'maintenance', 'offline'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Removed required: true to make it optional
  }
}, {
  timestamps: true
});

workCenterSchema.index({ code: 1 });
workCenterSchema.index({ name: 1 });
workCenterSchema.index({ type: 1 });
workCenterSchema.index({ createdAt: -1 });

export default mongoose.model('WorkCenter', workCenterSchema);