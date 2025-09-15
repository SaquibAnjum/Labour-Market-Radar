import mongoose from 'mongoose';

const rawJobSchema = new mongoose.Schema({
  source: { type: String, required: true, enum: ['ncs', 'indeed', 'naukri'] },
  fetchUrl: { type: String, required: true, unique: true },
  htmlContent: { type: String, required: true },
  parseStatus: { type: String, enum: ['pending', 'parsed', 'error'], default: 'pending' },
  error: String,
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  source: { type: String, required: true, enum: ['ncs', 'indeed', 'naukri'] },
  sourceJobId: { type: String },
  canonicalUrl: { type: String },
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  postedAt: { type: Date, default: Date.now },
  locations: [{
    city: String,
    districtCode: String,
    _id: false
  }],
  skills: [{
    skillId: String,
    name: String,
    weight: { type: Number, default: 1 },
    _id: false
  }],
  dedupeKey: { type: String, unique: true, sparse: true },
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
}, { timestamps: true });

const skillSchema = new mongoose.Schema({
  skillId: { type: String, required: true, unique: true },
  canonical: { type: String, required: true },
  synonyms: [String],
  sector: { type: String },
});

const districtSchema = new mongoose.Schema({
  districtCode: { type: String, required: true, unique: true },
  districtName: { type: String, required: true },
  stateName: { type: String, required: true },
  centroid: { lat: Number, lon: Number },
  cities: [String],
});

const radarDemandSchema = new mongoose.Schema({
  window: { type: String, required: true, enum: ['7d', '30d', '90d'] },
  districtCode: { type: String, required: true },
  skillId: { type: String, required: true },
  demandCount: { type: Number, default: 0 },
  demandTrendScore: { type: Number, default: 0 },
  employers: { type: Number, default: 0 },
}, { timestamps: true });

const talentSupplySchema = new mongoose.Schema({
  districtCode: { type: String, required: true },
  skillId: { type: String, required: true },
  candidatesTotal: { type: Number, default: 0 },
  candidatesAboveScore70: { type: Number, default: 0 },
});

const demandSupplyIndexSchema = new mongoose.Schema({
  window: { type: String, required: true, enum: ['7d', '30d', '90d'] },
  districtCode: { type: String, required: true },
  skillId: { type: String, required: true },
  demand: { type: Number, default: 0 },
  supply: { type: Number, default: 0 },
  dsi: { type: Number, default: 0 },
}, { timestamps: true });

jobSchema.index({ postedAt: -1 });
radarDemandSchema.index({ districtCode: 1, skillId: 1, window: 1 }, { unique: true });

export const RawJob = mongoose.model('RawJob', rawJobSchema);
export const Job = mongoose.model('Job', jobSchema);
export const Skill = mongoose.model('Skill', skillSchema);
export const District = mongoose.model('District', districtSchema);
export const RadarDemand = mongoose.model('RadarDemand', radarDemandSchema);
export const TalentSupply = mongoose.model('TalentSupply', talentSupplySchema);
export const DemandSupplyIndex = mongoose.model('DemandSupplyIndex', demandSupplyIndexSchema);