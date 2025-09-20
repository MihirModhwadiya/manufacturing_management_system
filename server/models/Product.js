import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['finished-good']
  }
});

productSchema.index({ productCode: 1 });
productSchema.index({ category: 1 });

export default mongoose.model('Product', productSchema);