import mongoose from 'mongoose';

const inventoryForecastSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  forecastType: {
    type: String,
    enum: ['demand', 'supply', 'stockout', 'reorder'],
    default: 'demand'
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  averageMonthlyUsage: {
    type: Number,
    required: true,
    min: 0
  },
  seasonalFactor: {
    type: Number,
    default: 1.0,
    min: 0.1,
    max: 5.0
  },
  trendFactor: {
    type: Number,
    default: 1.0,
    min: 0.1,
    max: 3.0
  },
  predictedDemand: {
    nextMonth: Number,
    next3Months: Number,
    next6Months: Number,
    nextYear: Number
  },
  predictedStockOutDate: {
    type: Date,
    required: true
  },
  recommendedOrderQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  recommendedOrderDate: {
    type: Date,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  factors: {
    historicalAccuracy: { type: Number, default: 0 },
    dataPoints: { type: Number, default: 0 },
    seasonality: { type: Number, default: 0 },
    trend: { type: Number, default: 0 },
    volatility: { type: Number, default: 0 }
  },
  methodology: {
    type: String,
    enum: ['moving-average', 'exponential-smoothing', 'linear-regression', 'seasonal-decomposition'],
    default: 'moving-average'
  },
  parameters: {
    windowSize: Number,
    alpha: Number,
    beta: Number,
    gamma: Number
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  accuracy: {
    lastPeriodActual: Number,
    lastPeriodPredicted: Number,
    mape: Number, // Mean Absolute Percentage Error
    bias: Number
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  lastRecalculated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
inventoryForecastSchema.index({ inventoryItem: 1, isActive: 1 });
inventoryForecastSchema.index({ predictedStockOutDate: 1 });
inventoryForecastSchema.index({ confidence: -1 });
inventoryForecastSchema.index({ validFrom: 1, validUntil: 1 });
inventoryForecastSchema.index({ generatedBy: 1, createdAt: -1 });

// Virtual for days until stockout
inventoryForecastSchema.virtual('daysUntilStockout').get(function() {
  const now = new Date();
  const diffTime = this.predictedStockOutDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for forecast status
inventoryForecastSchema.virtual('status').get(function() {
  const now = new Date();
  if (now > this.validUntil) return 'expired';
  if (!this.isActive) return 'inactive';
  
  const daysUntilStockout = this.daysUntilStockout;
  if (daysUntilStockout < 0) return 'overdue';
  if (daysUntilStockout <= 7) return 'critical';
  if (daysUntilStockout <= 30) return 'warning';
  return 'good';
});

// Virtual for accuracy rating
inventoryForecastSchema.virtual('accuracyRating').get(function() {
  if (!this.accuracy || !this.accuracy.mape) return 'unknown';
  
  const mape = this.accuracy.mape;
  if (mape < 10) return 'excellent';
  if (mape < 20) return 'good';
  if (mape < 35) return 'fair';
  return 'poor';
});

// Static method to find forecasts requiring action
inventoryForecastSchema.statics.findActionable = function(daysThreshold = 30) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysThreshold);
  
  return this.find({
    isActive: true,
    predictedStockOutDate: { $lte: targetDate },
    validUntil: { $gte: new Date() }
  })
  .populate('inventoryItem', 'partNumber material currentStock reorderPoint')
  .sort({ predictedStockOutDate: 1, confidence: -1 });
};

// Static method to calculate forecast accuracy
inventoryForecastSchema.statics.updateAccuracy = async function(forecastId, actualUsage) {
  const forecast = await this.findById(forecastId);
  if (!forecast || !forecast.predictedDemand) return null;

  const predicted = forecast.predictedDemand.nextMonth;
  const actual = actualUsage;
  
  if (predicted > 0) {
    const mape = Math.abs((predicted - actual) / actual) * 100;
    const bias = ((predicted - actual) / actual) * 100;
    
    forecast.accuracy = {
      lastPeriodActual: actual,
      lastPeriodPredicted: predicted,
      mape: mape,
      bias: bias
    };
    
    await forecast.save();
  }
  
  return forecast;
};

// Pre-save middleware to set valid until date
inventoryForecastSchema.pre('save', function(next) {
  if (this.isNew && !this.validUntil) {
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3); // Valid for 3 months
    this.validUntil = validUntil;
  }
  
  // Update recommended order date based on supplier lead time
  if (this.isModified('predictedStockOutDate')) {
    // This would typically use the supplier's lead time
    const orderDate = new Date(this.predictedStockOutDate);
    orderDate.setDate(orderDate.getDate() - 14); // Assume 14 days lead time
    this.recommendedOrderDate = orderDate;
  }
  
  next();
});

inventoryForecastSchema.set('toJSON', { virtuals: true });
inventoryForecastSchema.set('toObject', { virtuals: true });

const InventoryForecast = mongoose.model('InventoryForecast', inventoryForecastSchema);

export default InventoryForecast;