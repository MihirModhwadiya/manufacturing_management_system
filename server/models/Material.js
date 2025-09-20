import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  materialCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  materialName: {
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
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  }
});

materialSchema.index({ materialCode: 1 });
materialSchema.index({ category: 1 });
materialSchema.index({ currentStock: 1 });

export default mongoose.model('Material', materialSchema);