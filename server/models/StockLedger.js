import mongoose from 'mongoose';

const stockLedgerSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['in', 'out']
  },
  quantity: {
    type: Number,
    required: true
  },
  reference: {
    type: String,
    required: true,
    trim: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

stockLedgerSchema.index({ materialId: 1 });
stockLedgerSchema.index({ transactionType: 1 });

export default mongoose.model('StockLedger', stockLedgerSchema);