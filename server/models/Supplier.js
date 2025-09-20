import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  leadTime: {
    type: Number,
    required: true,
    min: 0,
    default: 7
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  paymentTerms: {
    type: String,
    default: 'Net 30'
  },
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  performanceMetrics: {
    onTimeDeliveries: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    qualityRating: { type: Number, default: 5, min: 1, max: 5 },
    lastDeliveryDate: Date,
    averageLeadTime: { type: Number, default: 0 }
  },
  certifications: [String],
  notes: String,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    swiftCode: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    email: String
  },
  isPreferred: {
    type: Boolean,
    default: false
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

// Indexes
supplierSchema.index({ name: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ rating: -1 });
supplierSchema.index({ 'performanceMetrics.onTimeDeliveries': -1 });
supplierSchema.index({ name: 'text', contact: 'text', email: 'text' });

// Virtual for on-time delivery percentage
supplierSchema.virtual('onTimeDeliveryPercentage').get(function() {
  if (this.performanceMetrics.totalDeliveries === 0) return 100;
  return Math.round((this.performanceMetrics.onTimeDeliveries / this.performanceMetrics.totalDeliveries) * 100);
});

// Pre-save middleware to generate supplier code
supplierSchema.pre('save', function(next) {
  if (this.isNew && !this.code) {
    // Generate supplier code from name
    const namePrefix = this.name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    this.code = `SUP-${namePrefix}${timestamp}`;
  }
  next();
});

supplierSchema.set('toJSON', { virtuals: true });
supplierSchema.set('toObject', { virtuals: true });

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;