import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true
  },
  expectedValue: {
    type: String,
    required: true
  },
  actualValue: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  result: {
    type: String,
    enum: ['pass', 'fail', 'pending'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
});

const defectSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['minor', 'major', 'critical'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  }
});

const inspectionCriteriaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specification: {
    type: String,
    required: true
  },
  tolerance: {
    type: String,
    default: ''
  },
  method: {
    type: String,
    default: ''
  }
});

const qualityInspectionSchema = new mongoose.Schema({
  workOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true
  },
  inspectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inspectionNumber: {
    type: String,
    unique: true,
    required: true
  },
  productType: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  quantityInspected: {
    type: Number,
    required: true
  },
  inspectionDate: {
    type: Date,
    default: Date.now
  },
  inspectionCriteria: [inspectionCriteriaSchema],
  testResults: [testResultSchema],
  defects: [defectSchema],
  status: {
    type: String,
    enum: ['pending', 'approved', 'conditional', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate inspection number
qualityInspectionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('QualityInspection').countDocuments();
    this.inspectionNumber = `QI-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update the updatedAt field on save
qualityInspectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
qualityInspectionSchema.index({ status: 1, inspectionDate: -1 });
qualityInspectionSchema.index({ inspectorId: 1 });
qualityInspectionSchema.index({ workOrderId: 1 });
qualityInspectionSchema.index({ productType: 1 });

export default mongoose.model('QualityInspection', qualityInspectionSchema);