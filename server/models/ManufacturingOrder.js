import mongoose from 'mongoose';

const manufacturingOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  product: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // Add createdAt and updatedAt fields
});

manufacturingOrderSchema.index({ orderNumber: 1 });
manufacturingOrderSchema.index({ status: 1 });
manufacturingOrderSchema.index({ product: 1 });
manufacturingOrderSchema.index({ createdAt: -1 });

export default mongoose.model('ManufacturingOrder', manufacturingOrderSchema);