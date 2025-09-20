import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  departmentCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  departmentName: {
    type: String,
    required: true,
    trim: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

departmentSchema.index({ departmentCode: 1 });
departmentSchema.index({ managerId: 1 });

export default mongoose.model('Department', departmentSchema);