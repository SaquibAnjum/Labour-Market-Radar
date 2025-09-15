import crypto from 'crypto';
import * as cheerio from 'cheerio';
import { Job, Skill, District, RawJob } from '../models/Job.js';

// This class takes a raw job document and converts it into structured, clean data.
class JobNormalizer {
  constructor() {
    this.skillsMaster = [];
    this.districtsMaster = [];
  }

  async init() {
    if (this.skillsMaster.length === 0) this.skillsMaster = await Skill.find({}).lean();
    if (this.districtsMaster.length === 0) this.districtsMaster = await District.find({}).lean();
  }

  async normalizeAndSave(rawJob) {
    await this.init();
    
    try {
      const $ = cheerio.load(rawJob.htmlContent);
      
      // Selectors are specific to Indeed. Must be adapted for other sites.
      const title = $('#jobsearch-ViewjobHeaderText-title-container h1').text().trim() || 'Title not found';
      const company = $('[data-company-name="true"]').text().trim() || 'Company not found';
      const description = $('#jobDescriptionText').text().trim() || 'Description not found';
      const locationText = $('div[data-testid="job-location"]').text().trim() || '';

      const normalized = {
        source: rawJob.source,
        sourceJobId: rawJob.fetchUrl.match(/jk=([a-zA-Z0-9]+)/)?.[1] || rawJob.fetchUrl,
        canonicalUrl: rawJob.fetchUrl,
        title,
        company,
        description,
        postedAt: new Date(), // More robust date parsing would be needed for production
        locations: this.parseLocations(locationText),
        skills: this.extractSkills(title, description),
      };

      normalized.dedupeKey = crypto.createHash('sha1').update(`${company}|${title}|${locationText}`).digest('hex');

      const duplicate = await Job.findOne({ dedupeKey: normalized.dedupeKey });
      if (duplicate) {
        normalized.duplicateOf = duplicate._id;
      }
      
      const job = new Job(normalized);
      await job.save();
      
      rawJob.parseStatus = 'parsed';
    } catch (error) {
      console.error(`Error normalizing job ${rawJob._id}:`, error);
      rawJob.parseStatus = 'error';
      rawJob.error = error.message;
    }
    
    await rawJob.save();
  }

  parseLocations(locationText) {
    if (!locationText) return [];
    const city = locationText.split(',')[0].trim();
    const district = this.districtsMaster.find(d => 
        d.cities.some(c => c.toLowerCase() === city.toLowerCase())
    );
    return district ? [{ city, districtCode: district.districtCode }] : [{ city }];
  }

  extractSkills(title, description) {
    const content = `${title} ${description}`.toLowerCase();
    const foundSkills = new Map();
    
    this.skillsMaster.forEach(skill => {
        const synonyms = [skill.canonical, ...skill.synonyms].map(s => s.toLowerCase());
        if (synonyms.some(s => content.includes(s))) {
            const weight = title.toLowerCase().includes(skill.canonical.toLowerCase()) ? 2 : 1;
            if (!foundSkills.has(skill.skillId) || weight > foundSkills.get(skill.skillId).weight) {
                foundSkills.set(skill.skillId, {
                    skillId: skill.skillId,
                    name: skill.canonical,
                    weight,
                });
            }
        }
    });
    return Array.from(foundSkills.values());
  }
}

export default JobNormalizer;