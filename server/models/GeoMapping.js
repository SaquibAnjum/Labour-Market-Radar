import mongoose from 'mongoose';

const geoMappingSchema = new mongoose.Schema({
  districtCode: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  districtName: { 
    type: String, 
    required: true,
    trim: true
  },
  stateName: { 
    type: String, 
    required: true,
    trim: true
  },
  stateCode: {
    type: String,
    required: true,
    trim: true
  },
  centroid: { 
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  cities: [{
    type: String,
    trim: true
  }],
  pincodes: [{
    type: String,
    trim: true
  }],
  population: {
    type: Number,
    default: 0
  },
  area: {
    type: Number, // in square kilometers
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  }
}, {
  timestamps: true
});

// Indexes for better performance
geoMappingSchema.index({ districtCode: 1 });
geoMappingSchema.index({ stateName: 1 });
geoMappingSchema.index({ stateCode: 1 });
geoMappingSchema.index({ isActive: 1 });
geoMappingSchema.index({ 'centroid.lat': 1, 'centroid.lon': 1 });

export default mongoose.model('GeoMapping', geoMappingSchema);
