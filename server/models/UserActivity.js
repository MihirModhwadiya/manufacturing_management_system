import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'CREATE_WORK_ORDER',
      'UPDATE_WORK_ORDER',
      'DELETE_WORK_ORDER',
      'CREATE_MANUFACTURING_ORDER',
      'UPDATE_MANUFACTURING_ORDER',
      'DELETE_MANUFACTURING_ORDER',
      'CREATE_BOM',
      'UPDATE_BOM',
      'DELETE_BOM',
      'CREATE_STOCK_MOVEMENT',
      'UPDATE_STOCK_MOVEMENT',
      'DELETE_STOCK_MOVEMENT',
      'CREATE_QUALITY_INSPECTION',
      'UPDATE_QUALITY_INSPECTION',
      'DELETE_QUALITY_INSPECTION',
      'CREATE_MAINTENANCE_SCHEDULE',
      'UPDATE_MAINTENANCE_SCHEDULE',
      'DELETE_MAINTENANCE_SCHEDULE',
      'CREATE_EQUIPMENT',
      'UPDATE_EQUIPMENT',
      'DELETE_EQUIPMENT',
      'EXPORT_DATA',
      'SYSTEM_BACKUP',
      'SYSTEM_RESTORE'
    ]
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  sessionId: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  errorMessage: {
    type: String
  }
});

// Index for better query performance
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });
userActivitySchema.index({ resource: 1, timestamp: -1 });
userActivitySchema.index({ timestamp: -1 });

// TTL index to automatically delete old activities after 90 days
userActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('UserActivity', userActivitySchema);