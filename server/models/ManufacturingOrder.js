import mongoose from 'mongoose';

const manufacturingOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  bomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BillOfMaterial',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

manufacturingOrderSchema.index({ orderNumber: 1 });
manufacturingOrderSchema.index({ status: 1 });
manufacturingOrderSchema.index({ productId: 1 });

export default mongoose.model('ManufacturingOrder', manufacturingOrderSchema);