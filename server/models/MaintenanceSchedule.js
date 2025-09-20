import mongoose from 'mongoose';

const partSchema = new mongoose.Schema({
  partName: {
    type: String,
    required: true
  },
  partNumber: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  cost: {
    type: Number,
    required: true,
    default: 0
  },
  supplier: {
    type: String
  }
});

const maintenanceScheduleSchema = new mongoose.Schema({
  scheduleId: {
    type: String,
    unique: true,
    required: true
  },
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  maintenanceType: {
    type: String,
    enum: ['preventive', 'corrective', 'predictive', 'emergency'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    required: true
  },
  estimatedDuration: {
    type: Number, // hours
    required: true
  },
  actualDuration: {
    type: Number // hours
  },
  parts: [partSchema],
  laborCost: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  checklistItems: [{
    task: String,
    completed: { type: Boolean, default: false },
    notes: String
  }],
  workOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Auto-generate schedule ID
maintenanceScheduleSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('MaintenanceSchedule').countDocuments();
    this.scheduleId = `MS-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update the updatedAt field on save
maintenanceScheduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total cost from parts and labor
maintenanceScheduleSchema.pre('save', function(next) {
  const partsCost = this.parts.reduce((sum, part) => sum + (part.quantity * part.cost), 0);
  this.totalCost = partsCost + (this.laborCost || 0);
  next();
});

// Auto-update status to overdue if past scheduled date
maintenanceScheduleSchema.pre('find', function() {
  this.where({
    scheduledDate: { $lt: new Date() },
    status: 'scheduled'
  }).updateMany({ status: 'overdue' });
});

// Index for better query performance
maintenanceScheduleSchema.index({ status: 1, scheduledDate: -1 });
maintenanceScheduleSchema.index({ equipmentId: 1 });
maintenanceScheduleSchema.index({ assignedTechnician: 1 });
maintenanceScheduleSchema.index({ priority: 1 });

export default mongoose.model('MaintenanceSchedule', maintenanceScheduleSchema);