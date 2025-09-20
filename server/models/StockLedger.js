import mongoose from 'mongoose';

const stockLedgerSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  movementType: {
    type: String,
    required: true,
    enum: ['in', 'out', 'adjustment', 'transfer']
  },
  quantity: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true,
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
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

stockLedgerSchema.index({ material: 1 });
stockLedgerSchema.index({ movementType: 1 });
stockLedgerSchema.index({ createdAt: -1 });

export default mongoose.model('StockLedger', stockLedgerSchema);