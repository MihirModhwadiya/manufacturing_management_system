import mongoose from 'mongoose';

const bomSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  materials: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  version: {
    type: String,
    default: '1.0'
  },
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  operations: [{
    operationName: {
      type: String,
      required: true,
      trim: true
    },
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true
    },
    estimatedMinutes: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true
});

bomSchema.index({ product: 1 });

export default mongoose.model('BillOfMaterial', bomSchema);