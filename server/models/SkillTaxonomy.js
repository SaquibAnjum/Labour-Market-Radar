import mongoose from 'mongoose';

const skillTaxonomySchema = new mongoose.Schema({
  skillId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  canonical: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    index: true
  },
  synonyms: [{
    type: String,
    trim: true
  }],
  category: { 
    type: String, 
    required: true,
    enum: ['technical', 'soft', 'domain', 'certification', 'language', 'tool']
  },
  sector: {
    type: String,
    enum: ['IT', 'manufacturing', 'healthcare', 'finance', 'education', 'retail', 'logistics', 'construction', 'agriculture', 'other']
  },
  relatedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillTaxonomy'
  }],
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better performance
skillTaxonomySchema.index({ canonical: 1 });
skillTaxonomySchema.index({ category: 1 });
skillTaxonomySchema.index({ sector: 1 });
skillTaxonomySchema.index({ isActive: 1 });

export default mongoose.model('SkillTaxonomy', skillTaxonomySchema);
