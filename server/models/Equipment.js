import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  equipmentId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['production', 'assembly', 'testing', 'packaging', 'hvac', 'electrical']
  },
  manufacturer: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'breakdown', 'retired'],
    default: 'operational'
  },
  installationDate: {
    type: Date,
    required: true
  },
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date
  },
  maintenanceInterval: {
    type: Number, // days
    default: 30
  },
  downtimeHours: {
    type: Number,
    default: 0
  },
  efficiency: {
    type: Number, // percentage
    default: 100,
    min: 0,
    max: 100
  },
  specifications: {
    capacity: String,
    powerRating: String,
    dimensions: String,
    weight: String
  },
  warrantyInfo: {
    startDate: Date,
    endDate: Date,
    provider: String
  },
  maintenanceHistory: [{
    date: Date,
    type: String,
    description: String,
    technician: String,
    duration: Number,
    cost: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate equipment ID
equipmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Equipment').countDocuments();
    this.equipmentId = `EQ-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update the updatedAt field on save
equipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate next maintenance date based on interval
equipmentSchema.pre('save', function(next) {
  if (this.lastMaintenanceDate && this.maintenanceInterval) {
    this.nextMaintenanceDate = new Date(
      this.lastMaintenanceDate.getTime() + (this.maintenanceInterval * 24 * 60 * 60 * 1000)
    );
  }
  next();
});

// Index for better query performance
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ type: 1 });
equipmentSchema.index({ location: 1 });
equipmentSchema.index({ nextMaintenanceDate: 1 });

export default mongoose.model('Equipment', equipmentSchema);