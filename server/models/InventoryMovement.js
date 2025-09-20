import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  movementType: {
    type: String,
    enum: ['in', 'out', 'transfer', 'adjustment', 'return', 'scrap', 'initial'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  previousStock: {
    type: Number,
    required: true,
    min: 0
  },
  newStock: {
    type: Number,
    required: true,
    min: 0
  },
  unitCost: {
    type: Number,
    min: 0
  },
  totalCost: {
    type: Number,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  reference: {
    type: String,
    trim: true
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: Date,
  location: {
    from: String,
    to: String
  },
  workOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder'
  },
  purchaseOrder: {
    type: String,
    trim: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  customer: {
    type: String,
    trim: true
  },
  qualityCheck: {
    passed: { type: Boolean, default: true },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    checkedAt: Date
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  notes: String,
  isReversed: {
    type: Boolean,
    default: false
  },
  reversalReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryMovement'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
inventoryMovementSchema.index({ inventoryItem: 1, createdAt: -1 });
inventoryMovementSchema.index({ movementType: 1 });
inventoryMovementSchema.index({ createdAt: -1 });
inventoryMovementSchema.index({ workOrder: 1 });
inventoryMovementSchema.index({ supplier: 1 });
inventoryMovementSchema.index({ reference: 1 });

// Compound indexes
inventoryMovementSchema.index({ inventoryItem: 1, movementType: 1, createdAt: -1 });
inventoryMovementSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for movement direction
inventoryMovementSchema.virtual('direction').get(function() {
  return ['in', 'return', 'initial'].includes(this.movementType) ? 'inbound' : 'outbound';
});

// Virtual for value change
inventoryMovementSchema.virtual('valueChange').get(function() {
  if (!this.unitCost) return 0;
  const multiplier = this.direction === 'inbound' ? 1 : -1;
  return this.quantity * this.unitCost * multiplier;
});

// Static method to get movement summary for an item
inventoryMovementSchema.statics.getMovementSummary = function(inventoryItemId, startDate, endDate) {
  const matchStage = {
    inventoryItem: inventoryItemId,
    isReversed: false
  };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$movementType',
        totalQuantity: { $sum: '$quantity' },
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitCost'] } }
      }
    },
    {
      $group: {
        _id: null,
        movements: {
          $push: {
            type: '$_id',
            quantity: '$totalQuantity',
            count: '$count',
            value: '$totalValue'
          }
        },
        totalMovements: { $sum: '$count' },
        totalValue: { $sum: '$totalValue' }
      }
    }
  ]);
};

// Pre-save middleware to calculate total cost
inventoryMovementSchema.pre('save', function(next) {
  if (this.unitCost && this.quantity) {
    this.totalCost = this.unitCost * this.quantity;
  }
  next();
});

inventoryMovementSchema.set('toJSON', { virtuals: true });
inventoryMovementSchema.set('toObject', { virtuals: true });

const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);

export default InventoryMovement;