import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  machineCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  machineName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['cutting', 'drilling', 'welding', 'assembly', 'packaging']
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'busy', 'maintenance'],
    default: 'available'
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

machineSchema.index({ machineCode: 1 });
machineSchema.index({ status: 1 });
machineSchema.index({ departmentId: 1 });

export default mongoose.model('Machine', machineSchema);