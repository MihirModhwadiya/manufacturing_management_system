import mongoose from 'mongoose';

const bomSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  materials: [{
    materialId: {
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
});

bomSchema.index({ productId: 1 });

export default mongoose.model('BillOfMaterial', bomSchema);