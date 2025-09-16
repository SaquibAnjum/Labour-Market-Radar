import express from 'express';
import { RadarDemand, Skill, District, Job, RawJob } from '../models/Job.js';
import SkillTaxonomy from '../models/SkillTaxonomy.js';
import GeoMapping from '../models/GeoMapping.js';
import DemandSupplyIndex from '../models/DemandSupplyIndex.js';
import AdzunaService from '../services/adzuna.js';
import DataAggregator from '../services/DataAggregator.js';

const router = express.Router();

// Stats endpoint for dashboard KPIs
router.get('/stats', async (req, res, next) => {
  try {
    const [totalJobs, adzunaJobs, uniqueSkills, uniqueDistricts] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ source: 'adzuna' }),
      Job.distinct('skills.skillId', { source: 'adzuna' }),
      Job.distinct('locations.districtCode', { source: 'adzuna' })
    ]);
    
    res.json({
      totalSkillsTracked: uniqueSkills.length,
      districtsCovered: uniqueDistricts.length,
      supplyRecords: totalJobs,
      dsiRecords: adzunaJobs
    });
  } catch (error) { 
    next(error) 
  }
});

router.get('/top-skills', async (req, res, next) => {
  try {
    const { district, time = '30d', limit = 20 } = req.query;
    
    // Use DataAggregator to get top skills by DSI
    const topSkills = await DataAggregator.getTopSkillsByDSI(district, time, parseInt(limit));
    
    // If no DSI data, return mock data for demonstration
    if (topSkills.length === 0) {
      const mockSkills = [
        { skill: 'JavaScript', category: 'technical', jobCount: 45, dsi: 1.8, dsiCategory: 'undersupplied', trend: 'up', trendPercentage: 15, avgSalary: 850000, timeToFill: 12, marketTightness: 'tight' },
        { skill: 'Python', category: 'technical', jobCount: 38, dsi: 1.6, dsiCategory: 'undersupplied', trend: 'up', trendPercentage: 22, avgSalary: 920000, timeToFill: 14, marketTightness: 'tight' },
        { skill: 'React', category: 'technical', jobCount: 42, dsi: 1.9, dsiCategory: 'undersupplied', trend: 'up', trendPercentage: 18, avgSalary: 880000, timeToFill: 10, marketTightness: 'very_tight' },
        { skill: 'Node.js', category: 'technical', jobCount: 35, dsi: 1.4, dsiCategory: 'undersupplied', trend: 'up', trendPercentage: 12, avgSalary: 950000, timeToFill: 16, marketTightness: 'moderate' },
        { skill: 'AWS', category: 'technical', jobCount: 28, dsi: 1.2, dsiCategory: 'balanced', trend: 'up', trendPercentage: 8, avgSalary: 1100000, timeToFill: 20, marketTightness: 'moderate' },
        { skill: 'Docker', category: 'technical', jobCount: 25, dsi: 1.1, dsiCategory: 'balanced', trend: 'up', trendPercentage: 5, avgSalary: 1050000, timeToFill: 18, marketTightness: 'moderate' },
        { skill: 'Machine Learning', category: 'technical', jobCount: 22, dsi: 2.1, dsiCategory: 'undersupplied', trend: 'up', trendPercentage: 25, avgSalary: 1200000, timeToFill: 8, marketTightness: 'very_tight' },
        { skill: 'Data Science', category: 'technical', jobCount: 20, dsi: 1.9, dsiCategory: 'undersupplied', trend: 'up', trendPercentage: 20, avgSalary: 1150000, timeToFill: 9, marketTightness: 'very_tight' }
      ];
      return res.json(mockSkills.slice(0, parseInt(limit)));
    }
    
    res.json(topSkills);
  } catch (error) { 
    next(error) 
  }
});

// Heatmap endpoint
router.get('/heatmap', async (req, res, next) => {
    try {
        const { skill, time = '30d' } = req.query;
        
        // Use DataAggregator to get heatmap data
        const heatmapData = await DataAggregator.getHeatmapData(skill, time);
        
        // If no heatmap data, return mock data for demonstration
        if (heatmapData.length === 0) {
            const mockHeatmap = [
                { district: 'Bangalore Urban', districtCode: 'KA01', jobCount: 45, dsi: 1.8, dsiCategory: 'undersupplied', avgSalary: 850000, trend: 'up' },
                { district: 'Mumbai City', districtCode: 'MH01', jobCount: 38, dsi: 1.6, dsiCategory: 'undersupplied', avgSalary: 920000, trend: 'up' },
                { district: 'Pune', districtCode: 'MH02', jobCount: 42, dsi: 1.9, dsiCategory: 'undersupplied', avgSalary: 880000, trend: 'up' },
                { district: 'Delhi', districtCode: 'DL01', jobCount: 35, dsi: 1.4, dsiCategory: 'undersupplied', avgSalary: 950000, trend: 'up' },
                { district: 'Gurugram', districtCode: 'HR01', jobCount: 28, dsi: 1.2, dsiCategory: 'balanced', avgSalary: 1100000, trend: 'up' },
                { district: 'Hyderabad', districtCode: 'TG01', jobCount: 25, dsi: 1.1, dsiCategory: 'balanced', avgSalary: 1050000, trend: 'up' },
                { district: 'Chennai', districtCode: 'TN01', jobCount: 22, dsi: 2.1, dsiCategory: 'undersupplied', avgSalary: 1200000, trend: 'up' },
                { district: 'Kolkata', districtCode: 'WB01', jobCount: 20, dsi: 1.9, dsiCategory: 'undersupplied', avgSalary: 1150000, trend: 'up' }
            ];
            return res.json(mockHeatmap);
        }
        
        res.json(heatmapData);
    } catch (error) { 
        next(error) 
    }
});

// Districts endpoint
router.get('/districts', async (req, res, next) => {
    try {
        // Get districts from GeoMapping collection
        const districts = await GeoMapping.find({ isActive: true })
            .select('districtCode districtName stateName stateCode')
            .sort({ districtName: 1 })
            .lean();
        
        if (districts.length === 0) {
            // Return mock data for demonstration
            const mockDistricts = [
                { districtCode: 'KA01', districtName: 'Bangalore Urban', stateName: 'Karnataka', stateCode: 'KA' },
                { districtCode: 'MH01', districtName: 'Mumbai City', stateName: 'Maharashtra', stateCode: 'MH' },
                { districtCode: 'MH02', districtName: 'Pune', stateName: 'Maharashtra', stateCode: 'MH' },
                { districtCode: 'DL01', districtName: 'Delhi', stateName: 'Delhi', stateCode: 'DL' },
                { districtCode: 'HR01', districtName: 'Gurugram', stateName: 'Haryana', stateCode: 'HR' },
                { districtCode: 'TG01', districtName: 'Hyderabad', stateName: 'Telangana', stateCode: 'TG' },
                { districtCode: 'TN01', districtName: 'Chennai', stateName: 'Tamil Nadu', stateCode: 'TN' },
                { districtCode: 'WB01', districtName: 'Kolkata', stateName: 'West Bengal', stateCode: 'WB' }
            ];
            return res.json(mockDistricts);
        }
        
        // Transform to expected format
        const formattedDistricts = districts.map(district => ({
            districtCode: district.districtCode,
            districtName: district.districtName,
            stateName: district.stateName,
            stateCode: district.stateCode
        }));
        
        res.json(formattedDistricts);
    } catch (error) { next(error) }
});

router.get('/skills', async (req, res, next) => {
    try {
        // Get skills from SkillTaxonomy collection
        const skills = await SkillTaxonomy.find({ isActive: true })
            .select('canonical category sector')
            .sort({ canonical: 1 })
            .lean();
        
        if (skills.length === 0) {
            // Return mock data for demonstration
            const mockSkills = [
                { canonical: 'React.js', category: 'technical', sector: 'IT' },
                { canonical: 'Node.js', category: 'technical', sector: 'IT' },
                { canonical: 'Python', category: 'technical', sector: 'IT' },
                { canonical: 'JavaScript', category: 'technical', sector: 'IT' },
                { canonical: 'Data Science', category: 'technical', sector: 'IT' },
                { canonical: 'Cloud Computing', category: 'technical', sector: 'IT' },
                { canonical: 'UI/UX Design', category: 'technical', sector: 'IT' },
                { canonical: 'AWS', category: 'technical', sector: 'IT' },
                { canonical: 'MongoDB', category: 'technical', sector: 'IT' },
                { canonical: 'SQL', category: 'technical', sector: 'IT' }
            ];
            return res.json(mockSkills);
        }
        
        // Transform real data to expected format
        const formattedSkills = skills
            .filter(skill => skill && skill.canonical) // Remove null/undefined values
            .map(skill => ({
                id: skill._id,
                name: skill.canonical,
                category: skill.category,
                sector: skill.sector
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        
        res.json(formattedSkills);
    } catch (error) { next(error) }
});

// Analytics endpoint for detailed skill-district analysis
router.get('/analytics', async (req, res, next) => {
    try {
        const { skill, district, time = '30d' } = req.query;
        
        if (!skill || !district) {
            return res.status(400).json({ error: 'Both skill and district parameters are required' });
        }

        // Use DataAggregator to get analytics data
        const analyticsData = await DataAggregator.getAnalyticsData(skill, district, time);
        
        if (!analyticsData) {
            // Return mock data for demonstration
            const mockAnalytics = {
                skill,
                district,
                timeWindow: time,
                jobPostings: 45,
                availableTalent: 120,
                dsi: 1.8,
                dsiCategory: 'undersupplied',
                uniqueEmployers: 12,
                salary: { min: 600000, max: 1200000, avg: 850000 },
                timeToFill: 12,
                marketTightness: 'tight',
                trend: 'up',
                trendPercentage: 15
            };
            return res.json(mockAnalytics);
        }
        
        res.json(analyticsData);
    } catch (error) { 
        next(error) 
    }
});

// Adzuna API Integration Routes

// Initialize Adzuna service (will be created when needed)
let adzunaService = null;

// Function to get Adzuna service instance
const getAdzunaService = () => {
  if (!adzunaService) {
    adzunaService = new AdzunaService();
  }
  return adzunaService;
};

// Debug endpoint to test Adzuna connection
router.get('/adzuna/debug', async (req, res, next) => {
  try {
    console.log('🔧 Adzuna Debug Endpoint Called');
    
    // Check environment variables
    const envCheck = {
      ADZUNA_APP_ID: process.env.ADZUNA_APP_ID ? '✅ Set' : '❌ Missing',
      ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY ? '✅ Set' : '❌ Missing',
      ADZUNA_COUNTRY: process.env.ADZUNA_COUNTRY || 'in',
      ADZUNA_BASE_URL: process.env.ADZUNA_BASE_URL || 'https://api.adzuna.com/v1/api/jobs',
      NODE_ENV: process.env.NODE_ENV
    };
    
    console.log('🔧 Environment Variables Check:', envCheck);
    
    // Test a simple API call
    try {
      const testResult = await getAdzunaService().fetchJobs({
        what: 'software developer',
        where: 'Bangalore',
        page: 1,
        results_per_page: 5
      });
      
      res.json({
        success: true,
        message: 'Adzuna API connection successful',
        environment: envCheck,
        testResult: {
          count: testResult.count || 0,
          resultsLength: testResult.results?.length || 0,
          page: testResult.page || 1
        }
      });
    } catch (apiError) {
      res.status(500).json({
        success: false,
        message: 'Adzuna API connection failed',
        environment: envCheck,
        error: {
          message: apiError.message,
          stack: apiError.stack
        }
      });
    }
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint error',
      error: error.message
    });
  }
});

// Search jobs using Adzuna API
router.get('/adzuna/search', async (req, res, next) => {
    try {
        const { 
            what = 'software developer', 
            where = '', 
            page = 1, 
            results_per_page = 20,
            category = '',
            salary_min = '',
            full_time = true
        } = req.query;

        const jobs = await getAdzunaService().fetchJobs({
            what,
            where,
            page: parseInt(page),
            results_per_page: Math.min(parseInt(results_per_page), 50),
            category,
            salary_min,
            full_time: full_time === 'true'
        });

        res.json({
            success: true,
            data: jobs,
            pagination: {
                page: parseInt(page),
                results_per_page: parseInt(results_per_page),
                total: jobs.count || 0
            }
        });
    } catch (error) {
        console.error('Adzuna search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search jobs from Adzuna',
            message: error.message
        });
    }
});

// Fetch and save jobs from Adzuna to our database
router.post('/adzuna/fetch', async (req, res, next) => {
    try {
        const { 
            searchTerm = 'software developer', 
            location = '', 
            maxPages = 3 
        } = req.body;

        console.log(`Fetching Adzuna jobs for: ${searchTerm} in ${location}`);

        const savedJobs = await getAdzunaService().fetchAndSaveJobs({
            searchTerm,
            location,
            maxPages: parseInt(maxPages)
        });

        res.json({
            success: true,
            message: `Successfully fetched and saved ${savedJobs.length} jobs from Adzuna`,
            data: {
                jobsSaved: savedJobs.length,
                searchTerm,
                location,
                maxPages: parseInt(maxPages)
            }
        });
    } catch (error) {
        console.error('Adzuna fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch and save jobs from Adzuna',
            message: error.message
        });
    }
});

// Get job categories from Adzuna
router.get('/adzuna/categories', async (req, res, next) => {
    try {
        // Adzuna doesn't have a categories endpoint, so we'll return common categories
        const categories = [
            { id: 'it-jobs', name: 'IT Jobs' },
            { id: 'engineering-jobs', name: 'Engineering Jobs' },
            { id: 'sales-jobs', name: 'Sales Jobs' },
            { id: 'marketing-jobs', name: 'Marketing Jobs' },
            { id: 'finance-jobs', name: 'Finance Jobs' },
            { id: 'hr-jobs', name: 'HR Jobs' },
            { id: 'design-jobs', name: 'Design Jobs' },
            { id: 'data-jobs', name: 'Data Jobs' },
            { id: 'product-jobs', name: 'Product Jobs' },
            { id: 'operations-jobs', name: 'Operations Jobs' }
        ];

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Adzuna categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories',
            message: error.message
        });
    }
});

// Get trending skills from Adzuna data
router.get('/adzuna/trending-skills', async (req, res, next) => {
    try {
        const { district, time = '30' } = req.query;
        
        // Query jobs from Adzuna source in the last N days
        const days = parseInt(time.replace('d', ''));
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        const query = { 
            source: 'adzuna',
            postedAt: { $gte: startDate }
        };
        
        if (district) {
            query['locations.districtCode'] = district;
        }
        
        const jobs = await Job.find(query).lean();
        
        // Aggregate skills from Adzuna jobs
        const skillCounts = {};
        jobs.forEach(job => {
            if (job.skills && Array.isArray(job.skills)) {
                job.skills.forEach(skill => {
                    const skillName = skill.skillId || skill;
                    if (skillName) {
                        skillCounts[skillName] = (skillCounts[skillName] || 0) + 1;
                    }
                });
            }
        });
        
        // Convert to array and sort by count
        const trendingSkills = Object.entries(skillCounts)
            .map(([skill, count]) => ({
                skill: skill.charAt(0).toUpperCase() + skill.slice(1),
                count,
                trend: 'up' // For now, always up since we're using recent data
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        res.json({
            success: true,
            data: trendingSkills,
            meta: {
                totalJobs: jobs.length,
                timeWindow: time,
                district: district || 'all'
            }
        });
    } catch (error) {
        console.error('Adzuna trending skills error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trending skills from Adzuna data',
            message: error.message
        });
    }
});

// Get job statistics from Adzuna data
router.get('/adzuna/stats', async (req, res, next) => {
    try {
        const { district, time = '30' } = req.query;
        
        const days = parseInt(time.replace('d', ''));
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const query = { 
            source: 'adzuna',
            postedAt: { $gte: startDate }
        };
        
        if (district) {
            query['locations.districtCode'] = district;
        }
        
        const jobs = await Job.find(query).lean();
        
        // Calculate statistics
        const totalJobs = jobs.length;
        const uniqueCompanies = [...new Set(jobs.map(job => job.company?.name))].length;
        const uniqueSkills = [...new Set(jobs.flatMap(job => 
            job.skills ? job.skills.map(skill => skill.skillId || skill) : []
        ))].length;
        
        const salaryJobs = jobs.filter(job => job.salary && (job.salary.min || job.salary.max));
        const avgSalary = salaryJobs.length > 0 
            ? Math.round(salaryJobs.reduce((sum, job) => {
                const min = job.salary.min || 0;
                const max = job.salary.max || min;
                return sum + (min + max) / 2;
            }, 0) / salaryJobs.length)
            : 0;
        
        res.json({
            success: true,
            data: {
                totalJobs,
                uniqueCompanies,
                uniqueSkills,
                avgSalary,
                salaryJobs: salaryJobs.length,
                timeWindow: time,
                district: district || 'all'
            }
        });
    } catch (error) {
        console.error('Adzuna stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch Adzuna statistics',
            message: error.message
        });
    }
});

export default router;
