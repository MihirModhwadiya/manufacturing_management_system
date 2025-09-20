import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  material: {
    type: String,
    required: true,
    trim: true
  },
  partNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  maxStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reorderPoint: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  averageCost: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'overstock'],
    default: 'in-stock'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  category: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    default: 'units',
    trim: true
  },
  batchTracking: {
    enabled: { type: Boolean, default: false },
    batches: [{
      batchNumber: String,
      quantity: Number,
      expiryDate: Date,
      receivedDate: Date
    }]
  },
  qrCode: String,
  barcode: String,
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
inventoryItemSchema.index({ partNumber: 1 });
inventoryItemSchema.index({ status: 1 });
inventoryItemSchema.index({ supplier: 1 });
inventoryItemSchema.index({ location: 1 });
inventoryItemSchema.index({ material: 'text', description: 'text', partNumber: 'text' });

// Pre-save middleware to update status based on stock levels
inventoryItemSchema.pre('save', function(next) {
  if (this.isModified('currentStock') || this.isModified('reorderPoint') || this.isModified('maxStock')) {
    if (this.currentStock === 0) {
      this.status = 'out-of-stock';
    } else if (this.currentStock <= this.reorderPoint) {
      this.status = 'low-stock';
    } else if (this.currentStock >= this.maxStock) {
      this.status = 'overstock';
    } else {
      this.status = 'in-stock';
    }
  }
  next();
});

// Virtual for calculated fields
inventoryItemSchema.virtual('stockValue').get(function() {
  return this.currentStock * this.averageCost;
});

inventoryItemSchema.virtual('stockCoverage').get(function() {
  // This would be calculated based on usage patterns
  return Math.floor(this.currentStock / Math.max(1, this.reorderPoint)) * 30; // Rough estimate in days
});

inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;