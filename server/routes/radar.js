import express from 'express';
import { RadarDemand, Skill, District, Job, RawJob } from '../models/Job.js';
import AdzunaService from '../services/adzuna.js';

const router = express.Router();

// Stats endpoint for dashboard KPIs
router.get('/stats', async (req, res, next) => {
  try {
    const [totalJobs, adzunaJobs, uniqueSkills, uniqueDistricts] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ source: 'adzuna' }),
      Job.distinct('skills.skillId', { source: 'adzuna' }),
      Job.distinct('districtCode', { source: 'adzuna' })
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
    const { district, time = '30', limit = 10 } = req.query;
    
    // Import TalentSupply model
    const { TalentSupply } = await import('../models/Job.js');
    
    // Build query for talent supply data
    const query = {};
    if (district) {
      query.districtCode = district;
    }
    
    // Build query for jobs
    const jobQuery = { source: 'adzuna' };
    if (district) {
        jobQuery['locations.districtCode'] = district;
    }
    
    // Get all jobs (Adzuna data is from 2020, so no date filtering for now)
    const jobs = await Job.find(jobQuery);
    
    // Count skills from jobs
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
    const topSkills = Object.entries(skillCounts)
      .map(([skill, jobCount], index) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        jobCount,
        trend: 'up', // For now, always up since we're using recent data
        rank: index + 1
      }))
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, parseInt(limit));
    
    return res.json(topSkills);
    
    // Aggregate by skill and calculate job counts
    const skillAggregation = {};
    talentData.forEach(item => {
      const skillName = item.skillId?.canonical || 'Unknown';
      if (!skillAggregation[skillName]) {
        skillAggregation[skillName] = {
          skill: skillName,
          jobCount: 0,
          totalCandidates: 0,
          highSkilledCandidates: 0
        };
      }
      
      // Simulate job count based on talent supply and some randomness
      const baseJobCount = Math.floor(item.candidatesTotal * (0.1 + Math.random() * 0.2));
      skillAggregation[skillName].jobCount += baseJobCount;
      skillAggregation[skillName].totalCandidates += item.candidatesTotal;
      skillAggregation[skillName].highSkilledCandidates += item.candidatesAboveScore70;
    });
    
    // Convert to array and sort by job count
    const result = Object.values(skillAggregation)
      .map((item, index) => ({
        skill: item.skill,
        jobCount: item.jobCount,
        trend: Math.random() > 0.3 ? 'up' : 'down',
        rank: index + 1,
        totalCandidates: item.totalCandidates,
        highSkilledCandidates: item.highSkilledCandidates
      }))
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, parseInt(limit));

    res.json(result);
  } catch (error) { 
    next(error) 
  }
});

router.get('/heatmap', async (req, res, next) => {
    try {
        const { skill, time = '30' } = req.query;
        
        // Import TalentSupply model
        const { TalentSupply } = await import('../models/Job.js');
        
        // Build query for talent supply data
        const query = {};
        if (skill) {
            // Find skill by canonical name
            const skillDoc = await Skill.findOne({ canonical: skill }).lean();
            if (skillDoc) {
                query.skillId = skillDoc._id;
            }
        }
        
        // Build query for jobs
        const jobQuery = { source: 'adzuna' };
        if (skill) {
            jobQuery.skills = { $elemMatch: { skillId: skill.toLowerCase() } };
        }
        
        // Get all jobs (Adzuna data is from 2020, so no date filtering for now)
        const jobs = await Job.find(jobQuery);
        
        // Group by district and count jobs
        const districtCounts = {};
        jobs.forEach(job => {
            // Get location from locations array
            const location = job.locations && job.locations.length > 0 ? job.locations[0] : {};
            const districtCode = location.districtCode || 'UNKNOWN';
            const districtName = location.city || 'Unknown District';
            
            if (!districtCounts[districtCode]) {
                districtCounts[districtCode] = {
                    district: districtName,
                    districtCode: districtCode,
                    jobCount: 0
                };
            }
            districtCounts[districtCode].jobCount += 1;
        });
        
        // Convert to array and sort by job count
        const heatmapData = Object.values(districtCounts)
            .sort((a, b) => b.jobCount - a.jobCount);
        
        return res.json(heatmapData);
        
        // Aggregate by district and calculate job counts
        const districtAggregation = {};
        talentData.forEach(item => {
            const districtName = item.districtCode?.districtName || 'Unknown District';
            const districtCode = item.districtCode?.districtCode || 'UNKNOWN';
            
            if (!districtAggregation[districtCode]) {
                districtAggregation[districtCode] = {
                    district: districtName,
                    districtCode: districtCode,
                    jobCount: 0,
                    totalCandidates: 0
                };
            }
            
            // Simulate job count based on talent supply and some randomness
            const baseJobCount = Math.floor(item.candidatesTotal * (0.1 + Math.random() * 0.2));
            districtAggregation[districtCode].jobCount += baseJobCount;
            districtAggregation[districtCode].totalCandidates += item.candidatesTotal;
        });
        
        // Convert to array and sort by job count
        const result = Object.values(districtAggregation)
            .sort((a, b) => b.jobCount - a.jobCount);
        
        res.json(result);
    } catch (error) { 
        next(error) 
    }
});

router.get('/districts', async (req, res, next) => {
    try {
        // Get unique districts from Adzuna jobs
        const jobs = await Job.find({ source: 'adzuna' }).select('locations').lean();
        
        if (jobs.length === 0) {
            // Return mock data for demonstration
            const mockDistricts = [
                { code: 'KA01', name: 'Bangalore Urban', state: 'Karnataka' },
                { code: 'MH01', name: 'Mumbai City', state: 'Maharashtra' },
                { code: 'MH02', name: 'Pune', state: 'Maharashtra' },
                { code: 'DL01', name: 'Delhi', state: 'Delhi' },
                { code: 'HR01', name: 'Gurugram', state: 'Haryana' },
                { code: 'TG01', name: 'Hyderabad', state: 'Telangana' },
                { code: 'TN01', name: 'Chennai', state: 'Tamil Nadu' },
                { code: 'WB01', name: 'Kolkata', state: 'West Bengal' }
            ];
            return res.json(mockDistricts);
        }
        
        // Group by district and create unique list
        const districtMap = new Map();
        jobs.forEach(job => {
            if (job.locations && job.locations.length > 0) {
                const location = job.locations[0];
                const code = location.districtCode || 'UNKNOWN';
                const name = location.city || 'Unknown District';
                const state = location.state || 'Unknown State';
                
                if (!districtMap.has(code)) {
                    districtMap.set(code, { code, name, state });
                }
            }
        });
        
        // Transform to array and sort
        const formattedDistricts = Array.from(districtMap.values())
            .sort((a, b) => a.name.localeCompare(b.name));
        
        res.json(formattedDistricts);
    } catch (error) { next(error) }
});

router.get('/skills', async (req, res, next) => {
    try {
        // Get unique skills from Adzuna jobs
        const skills = await Job.distinct('skills.skillId', { source: 'adzuna' });
        
        if (skills.length === 0) {
            // Return mock data for demonstration
            const mockSkills = [
                { id: 'react', name: 'React.js' },
                { id: 'nodejs', name: 'Node.js' },
                { id: 'python', name: 'Python' },
                { id: 'javascript', name: 'JavaScript' },
                { id: 'data-science', name: 'Data Science' },
                { id: 'cloud-computing', name: 'Cloud Computing' },
                { id: 'ui-ux', name: 'UI/UX Design' },
                { id: 'aws', name: 'AWS' },
                { id: 'mongodb', name: 'MongoDB' },
                { id: 'sql', name: 'SQL' }
            ];
            return res.json(mockSkills);
        }
        
        // Transform real data to expected format
        const formattedSkills = skills
            .filter(skill => skill) // Remove null/undefined values
            .map(skill => ({
                id: skill,
                name: skill.charAt(0).toUpperCase() + skill.slice(1)
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        
        res.json(formattedSkills);
    } catch (error) { next(error) }
});

// Analytics endpoint for detailed skill-district analysis
router.get('/analytics', async (req, res, next) => {
    try {
        const { skill, district, time = '30' } = req.query;
        
        if (!skill || !district) {
            return res.status(400).json({ error: 'Both skill and district parameters are required' });
        }

        // Build query for jobs
        const jobQuery = { 
            source: 'adzuna',
            'locations.districtCode': district,
            skills: { $elemMatch: { skillId: skill.toLowerCase() } }
        };
        
        // Get all jobs (Adzuna data is from 2020, so no date filtering for now)
        const jobs = await Job.find(jobQuery);
        
        // Calculate analytics data
        const jobPostings = jobs.length;
        const uniqueCompanies = [...new Set(jobs.map(job => job.company))].length;
        
        // Calculate salary statistics
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
        
        // Calculate demand score based on job count and time period
        const demandScore = Math.min(100, Math.max(0, Math.round((jobPostings / days) * 10)));
        
        // Calculate DSI (Demand-Supply Index) - simplified
        const dsi = jobPostings > 0 ? (uniqueCompanies / jobPostings).toFixed(2) : '0.00';
        
        const analyticsData = {
            demandScore,
            jobPostings,
            availableTalent: Math.floor(jobPostings * 0.8), // Estimate based on job postings
            timeToFill: jobPostings > 10 ? '2.5 months' : '3.2 months',
            salary: salaryStats,
            marketCompetition: {
                activeEmployers: uniqueCompanies,
                dsi: dsi
            },
            talentSupply: {
                total: Math.floor(jobPostings * 0.8),
                highSkilled: Math.floor(jobPostings * 0.3)
            },
            recommendation: jobPostings > 20 
                ? "High demand for this skill. Consider upskilling existing employees or offering competitive packages to attract top talent."
                : "Moderate demand. Focus on building internal capabilities and consider targeted recruitment."
        };

        res.json(analyticsData);
    } catch (error) { 
        next(error) 
    }
});

// Adzuna API Integration Routes

// Initialize Adzuna service
const adzunaService = new AdzunaService();

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

        const jobs = await adzunaService.fetchJobs({
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

        const savedJobs = await adzunaService.fetchAndSaveJobs(
            searchTerm, 
            location, 
            parseInt(maxPages)
        );

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
            { id: 'healthcare-jobs', name: 'Healthcare Jobs' },
            { id: 'education-jobs', name: 'Education Jobs' },
            { id: 'retail-jobs', name: 'Retail Jobs' },
            { id: 'hospitality-jobs', name: 'Hospitality Jobs' }
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
            job.skills?.forEach(skill => {
                const skillName = skill.skillId || 'Unknown';
                skillCounts[skillName] = (skillCounts[skillName] || 0) + 1;
            });
        });

        // Convert to array and sort by count
        const trendingSkills = Object.entries(skillCounts)
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

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

        const [totalJobs, avgSalary, topCompanies, topSkills] = await Promise.all([
            Job.countDocuments(query),
            Job.aggregate([
                { $match: query },
                { $match: { 'salary.min': { $exists: true, $gt: 0 } } },
                { $group: { _id: null, avgSalary: { $avg: '$salary.min' } } }
            ]),
            Job.aggregate([
                { $match: query },
                { $group: { _id: '$company', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            Job.aggregate([
                { $match: query },
                { $unwind: '$skills' },
                { $group: { _id: '$skills.skillId', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalJobs,
                avgSalary: avgSalary[0]?.avgSalary || 0,
                topCompanies: topCompanies.map(comp => ({
                    company: comp._id,
                    jobCount: comp.count
                })),
                topSkills: topSkills.map(skill => ({
                    skill: skill._id,
                    count: skill.count
                })),
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