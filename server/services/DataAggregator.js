import SkillTaxonomy from '../models/SkillTaxonomy.js';
import GeoMapping from '../models/GeoMapping.js';
import DemandSupplyIndex from '../models/DemandSupplyIndex.js';
import { Job } from '../models/Job.js';

class DataAggregator {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get top skills by DSI for a specific district and time window
  async getTopSkillsByDSI(district = '', timeWindow = '30d', limit = 20) {
    try {
      const query = { timeWindow };
      if (district) {
        query.districtCode = district;
      }

      const skills = await DemandSupplyIndex.find(query)
        .populate('skillId', 'canonical category')
        .sort({ dsi: -1 })
        .limit(parseInt(limit))
        .lean();

      return skills.map(skill => ({
        skill: skill.skillId?.canonical || 'Unknown',
        category: skill.skillId?.category || 'technical',
        jobCount: skill.demandCount,
        dsi: skill.dsi,
        dsiCategory: skill.dsiCategory,
        trend: skill.demandTrend,
        trendPercentage: skill.trendPercentage,
        avgSalary: skill.avgSalary,
        timeToFill: skill.timeToFill,
        marketTightness: skill.marketTightness
      }));
    } catch (error) {
      console.error('Error getting top skills by DSI:', error);
      return [];
    }
  }

  // Get heatmap data for a specific skill and time window
  async getHeatmapData(skillId, timeWindow = '30d') {
    try {
      // If skillId is a string (skill name), find the actual ObjectId
      let skillObjectId = skillId;
      if (skillId && typeof skillId === 'string' && !skillId.match(/^[0-9a-fA-F]{24}$/)) {
        const skill = await SkillTaxonomy.findOne({ canonical: skillId }).lean();
        if (skill) {
          skillObjectId = skill._id;
        } else {
          // Return empty array if skill not found
          return [];
        }
      }

      const districts = await DemandSupplyIndex.find({
        skillId: skillObjectId,
        timeWindow
      })
      .populate('skillId', 'canonical')
      .sort({ dsi: -1 })
      .lean();

      return districts.map(district => ({
        district: district.districtCode,
        districtCode: district.districtCode,
        jobCount: district.demandCount,
        dsi: district.dsi,
        dsiCategory: district.dsiCategory,
        avgSalary: district.avgSalary,
        trend: district.demandTrend
      }));
    } catch (error) {
      console.error('Error getting heatmap data:', error);
      return [];
    }
  }

  // Calculate DSI for a specific skill-district combination
  async calculateDSI(districtCode, skillId, timeWindow = '30d') {
    try {
      const dsiData = await DemandSupplyIndex.findOne({
        districtCode,
        skillId,
        timeWindow
      }).lean();

      if (dsiData) {
        return dsiData.dsi;
      }

      // If no DSI data exists, calculate it
      const demandCount = await Job.countDocuments({
        'locations.districtCode': districtCode,
        'skills.skillId': skillId,
        postedAt: { $gte: this.getDateFromTimeWindow(timeWindow) }
      });

      // For now, use a mock supply count
      // In a real system, this would come from your learner database
      const supplyCount = Math.floor(demandCount * (0.5 + Math.random() * 0.5));
      
      const dsi = supplyCount > 0 ? demandCount / supplyCount : 0;
      
      // Save the calculated DSI
      await DemandSupplyIndex.findOneAndUpdate(
        { districtCode, skillId, timeWindow },
        {
          districtCode,
          skillId,
          timeWindow,
          demandCount,
          supplyCount,
          dsi,
          dsiCategory: this.categorizeDSI(dsi),
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      return dsi;
    } catch (error) {
      console.error('Error calculating DSI:', error);
      return 0;
    }
  }

  // Get analytics data for a specific skill-district combination
  async getAnalyticsData(skill, district, timeWindow = '30d') {
    try {
      // Find skill by name
      const skillDoc = await SkillTaxonomy.findOne({ canonical: skill }).lean();
      if (!skillDoc) {
        return null;
      }

      // Get DSI data
      const dsiData = await DemandSupplyIndex.findOne({
        districtCode: district,
        skillId: skillDoc._id,
        timeWindow
      }).lean();

      if (!dsiData) {
        return null;
      }

      // Get job data for additional analytics
      const jobs = await Job.find({
        'locations.districtCode': district,
        'skills.skillId': skillDoc._id,
        postedAt: { $gte: this.getDateFromTimeWindow(timeWindow) }
      }).lean();

      const uniqueCompanies = [...new Set(jobs.map(job => job.company?.name))].length;
      const salaries = jobs
        .filter(job => job.salary && (job.salary.min || job.salary.max))
        .map(job => {
          const min = job.salary.min || 0;
          const max = job.salary.max || min;
          return { min, max, avg: (min + max) / 2 };
        });

      const salaryStats = salaries.length > 0 ? {
        min: Math.min(...salaries.map(s => s.min)),
        max: Math.max(...salaries.map(s => s.max)),
        avg: Math.round(salaries.reduce((sum, s) => sum + s.avg, 0) / salaries.length)
      } : { min: 0, max: 0, avg: 0 };

      return {
        skill,
        district,
        timeWindow,
        jobPostings: dsiData.demandCount,
        availableTalent: dsiData.supplyCount,
        dsi: dsiData.dsi,
        dsiCategory: dsiData.dsiCategory,
        uniqueEmployers,
        salary: salaryStats,
        timeToFill: dsiData.timeToFill,
        marketTightness: dsiData.marketTightness,
        trend: dsiData.demandTrend,
        trendPercentage: dsiData.trendPercentage
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return null;
    }
  }

  // Helper method to get date from time window
  getDateFromTimeWindow(timeWindow) {
    const now = new Date();
    const days = timeWindow === '7d' ? 7 : timeWindow === '30d' ? 30 : 90;
    return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  }

  // Helper method to categorize DSI
  categorizeDSI(dsi) {
    if (dsi < 0.5) return 'oversupplied';
    if (dsi < 1.5) return 'balanced';
    return 'undersupplied';
  }

  // Cache management
  getCacheKey(method, ...params) {
    return `${method}_${params.join('_')}`;
  }

  async getCachedData(key, fetchFunction) {
    if (this.cache.has(key)) {
      const { data, timestamp } = this.cache.get(key);
      if (Date.now() - timestamp < this.cacheTimeout) {
        return data;
      }
    }

    const data = await fetchFunction();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new DataAggregator();
