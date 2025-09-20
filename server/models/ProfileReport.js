// Import Mongoose for MongoDB object modeling
import mongoose from 'mongoose';

// Profile Report schema: tracks detailed work performance and manufacturing analytics
const profileReportSchema = new mongoose.Schema({
  // Report identification and metadata
  reportId: {
    type: String, // Unique report identifier (e.g., 'RPT-2024-001')
    required: true,
    unique: true,
    trim: true
  },
  
  // Report type and scope
  reportType: {
    type: String,
    enum: ['operator', 'workCenter', 'order', 'daily', 'weekly', 'monthly'], // Different report types
    required: true
  },
  
  // Time period for the report
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  
  // Reference entities (flexible based on report type)
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the operator/user
    required: function() { return this.reportType === 'operator'; }
  },
  
  workCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter', // References work center
    required: function() { return this.reportType === 'workCenter'; }
  },
  
  manufacturingOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ManufacturingOrder', // References manufacturing order
    required: function() { return this.reportType === 'order'; }
  },
  
  // Performance metrics and analytics
  metrics: {
    // Time tracking metrics
    totalWorkTime: { type: Number, default: 0 }, // Total work time in minutes
    plannedTime: { type: Number, default: 0 },   // Planned time in minutes
    actualTime: { type: Number, default: 0 },    // Actual time in minutes
    setupTime: { type: Number, default: 0 },     // Setup time in minutes
    runTime: { type: Number, default: 0 },       // Run time in minutes
    downTime: { type: Number, default: 0 },      // Downtime in minutes
    
    // Productivity metrics
    efficiency: { type: Number, default: 0 },    // Efficiency percentage
    utilization: { type: Number, default: 0 },   // Utilization percentage
    productivity: { type: Number, default: 0 },  // Productivity rate
    
    // Quality metrics
    unitsProduced: { type: Number, default: 0 }, // Total units produced
    unitsPlanned: { type: Number, default: 0 },  // Units planned for production
    defectRate: { type: Number, default: 0 },    // Defect rate percentage
    qualityScore: { type: Number, default: 0 },  // Overall quality score
    
    // Cost metrics
    laborCost: { type: Number, default: 0 },     // Labor cost
    materialCost: { type: Number, default: 0 },  // Material cost
    overheadCost: { type: Number, default: 0 },  // Overhead cost
    totalCost: { type: Number, default: 0 },     // Total cost
    
    // Performance indicators
    onTimeDelivery: { type: Number, default: 0 }, // On-time delivery percentage
    cycleTime: { type: Number, default: 0 },      // Average cycle time
    throughput: { type: Number, default: 0 }      // Throughput rate
  },
  
  // Detailed breakdown of activities
  activities: [{
    activityType: {
      type: String,
      enum: ['setup', 'production', 'maintenance', 'quality_check', 'material_handling', 'idle'],
      required: true
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    description: { type: String, default: '' },
    notes: { type: String, default: '' }
  }],
  
  // Issues and improvements
  issues: [{
    issueType: {
      type: String,
      enum: ['quality', 'equipment', 'material', 'process', 'safety', 'other'],
      required: true
    },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    reportedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    resolution: { type: String, default: '' }
  }],
  
  // Recommendations and improvements
  recommendations: [{
    category: {
      type: String,
      enum: ['efficiency', 'quality', 'safety', 'cost', 'process'],
      required: true
    },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    estimatedImpact: { type: String, default: '' }, // Expected impact description
    implementationCost: { type: Number, default: 0 }
  }],
  
  // Report generation metadata
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User who generated the report
    required: true
  },
  
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Report status and approvals
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'published'],
    default: 'draft'
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Manager/supervisor who approved the report
  },
  
  approvedAt: {
    type: Date
  },
  
  // Additional metadata
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  tags: [{ type: String }], // Tags for categorization and search
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  // Schema options
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  toJSON: { virtuals: true }, // Include virtual fields in JSON output
  toObject: { virtuals: true } // Include virtual fields in object output
});

// Virtual fields for calculated values
profileReportSchema.virtual('reportDuration').get(function() {
  return this.periodEnd - this.periodStart; // Duration in milliseconds
});

profileReportSchema.virtual('efficiencyPercentage').get(function() {
  if (this.metrics.plannedTime > 0) {
    return (this.metrics.actualTime / this.metrics.plannedTime) * 100;
  }
  return 0;
});

profileReportSchema.virtual('costPerUnit').get(function() {
  if (this.metrics.unitsProduced > 0) {
    return this.metrics.totalCost / this.metrics.unitsProduced;
  }
  return 0;
});

// Database indexes for optimized queries
profileReportSchema.index({ reportId: 1 }); // Unique index on report ID
profileReportSchema.index({ reportType: 1 }); // Index on report type
profileReportSchema.index({ operatorId: 1, periodStart: 1 }); // Operator reports by date
profileReportSchema.index({ workCenterId: 1, periodStart: 1 }); // Work center reports by date
profileReportSchema.index({ manufacturingOrderId: 1 }); // Order-specific reports
profileReportSchema.index({ periodStart: 1, periodEnd: 1 }); // Date range queries
profileReportSchema.index({ generatedAt: -1 }); // Recent reports first
profileReportSchema.index({ status: 1 }); // Filter by status

// Pre-save middleware: calculate derived metrics before saving
profileReportSchema.pre('save', function(next) {
  // Calculate total cost from component costs
  this.metrics.totalCost = 
    (this.metrics.laborCost || 0) + 
    (this.metrics.materialCost || 0) + 
    (this.metrics.overheadCost || 0);
  
  // Calculate efficiency if planned time exists
  if (this.metrics.plannedTime > 0 && this.metrics.actualTime > 0) {
    this.metrics.efficiency = (this.metrics.actualTime / this.metrics.plannedTime) * 100;
  }
  
  // Calculate productivity if applicable
  if (this.metrics.totalWorkTime > 0 && this.metrics.unitsProduced > 0) {
    this.metrics.productivity = this.metrics.unitsProduced / (this.metrics.totalWorkTime / 60); // Units per hour
  }
  
  // Generate report ID if not provided
  if (!this.reportId) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    this.reportId = `RPT-${year}${month}-${timestamp}`;
  }
  
  next();
});

// Static methods for common queries
profileReportSchema.statics.findByOperator = function(operatorId, startDate, endDate) {
  return this.find({
    operatorId: operatorId,
    periodStart: { $gte: startDate },
    periodEnd: { $lte: endDate },
    isActive: true
  }).sort({ periodStart: -1 });
};

profileReportSchema.statics.findByWorkCenter = function(workCenterId, startDate, endDate) {
  return this.find({
    workCenterId: workCenterId,
    periodStart: { $gte: startDate },
    periodEnd: { $lte: endDate },
    isActive: true
  }).sort({ periodStart: -1 });
};

profileReportSchema.statics.getPerformanceMetrics = function(filters = {}) {
  return this.aggregate([
    { $match: { ...filters, isActive: true } },
    {
      $group: {
        _id: null,
        avgEfficiency: { $avg: '$metrics.efficiency' },
        avgUtilization: { $avg: '$metrics.utilization' },
        totalUnitsProduced: { $sum: '$metrics.unitsProduced' },
        avgQualityScore: { $avg: '$metrics.qualityScore' },
        totalCost: { $sum: '$metrics.totalCost' }
      }
    }
  ]);
};

// Export the ProfileReport model
export default mongoose.model('ProfileReport', profileReportSchema);