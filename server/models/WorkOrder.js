import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema({
  workOrderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  operation: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  instructions: {
    type: String,
    default: ''
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

workOrderSchema.index({ orderNumber: 1 });
workOrderSchema.index({ status: 1 });
workOrderSchema.index({ createdAt: -1 });

export default mongoose.model('WorkOrder', workOrderSchema);