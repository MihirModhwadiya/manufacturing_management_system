import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['raw-material', 'component']
  },
  unit: {
    type: String,
    required: true,
    enum: ['pcs', 'kg', 'liters']
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

materialSchema.index({ code: 1 });
materialSchema.index({ category: 1 });
materialSchema.index({ stockQuantity: 1 });

export default mongoose.model('Material', materialSchema);