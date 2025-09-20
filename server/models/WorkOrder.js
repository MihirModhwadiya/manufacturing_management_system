import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema({
  workOrderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  manufacturingOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ManufacturingOrder',
    required: true
  },
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  estimatedMinutes: {
    type: Number,
    required: true,
    min: 0
  },
  actualMinutes: {
    type: Number,
    min: 0
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

workOrderSchema.index({ workOrderNumber: 1 });
workOrderSchema.index({ manufacturingOrderId: 1 });
workOrderSchema.index({ operatorId: 1 });
workOrderSchema.index({ machineId: 1 });
workOrderSchema.index({ status: 1 });

export default mongoose.model('WorkOrder', workOrderSchema);