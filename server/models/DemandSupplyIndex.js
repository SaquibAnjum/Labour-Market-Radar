import mongoose from 'mongoose';

const demandSupplyIndexSchema = new mongoose.Schema({
  timeWindow: { 
    type: String, 
    required: true, 
    enum: ['7d', '30d', '90d'],
    index: true
  },
  districtCode: { 
    type: String, 
    required: true,
    index: true
  },
  skillId: { 
    type: String, 
    required: true,
    index: true
  },
  demandCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  supplyCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  dsi: { 
    type: Number, 
    default: 0,
    min: 0
  },
  dsiCategory: { 
    type: String, 
    enum: ['oversupplied', 'balanced', 'undersupplied'],
    default: 'balanced'
  },
  demandTrend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  trendPercentage: {
    type: Number,
    default: 0
  },
  medianSalary: {
    type: Number,
    default: 0
  },
  avgSalary: {
    type: Number,
    default: 0
  },
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  uniqueEmployers: {
    type: Number,
    default: 0
  },
  timeToFill: {
    type: Number, // in days
    default: 0
  },
  marketTightness: {
    type: String,
    enum: ['very_loose', 'loose', 'moderate', 'tight', 'very_tight'],
    default: 'moderate'
  },
  highSkilledSupply: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
demandSupplyIndexSchema.index({ districtCode: 1, skillId: 1, timeWindow: 1 }, { unique: true });
demandSupplyIndexSchema.index({ timeWindow: 1, dsi: -1 });
demandSupplyIndexSchema.index({ districtCode: 1, timeWindow: 1 });
demandSupplyIndexSchema.index({ skillId: 1, timeWindow: 1 });
demandSupplyIndexSchema.index({ dsiCategory: 1, timeWindow: 1 });

export default mongoose.model('DemandSupplyIndex', demandSupplyIndexSchema);
