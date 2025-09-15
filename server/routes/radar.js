import express from 'express';
import { RadarDemand, Skill, District, Job, RawJob } from '../models/Job.js';

const router = express.Router();

// Stats endpoint for dashboard KPIs
router.get('/stats', async (req, res, next) => {
  try {
    const [totalSkillsTracked, districtsCovered, supplyRecords, dsiRecords] = await Promise.all([
      Skill.countDocuments(),
      District.countDocuments(),
      Job.countDocuments(),
      RawJob.countDocuments()
    ]);
    
    res.json({
      totalSkillsTracked,
      districtsCovered,
      supplyRecords,
      dsiRecords
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
    
    // For now, always return mock data since talent supply data needs to be seeded
    const mockSkills = [
      { skill: 'React.js', jobCount: 1243, trend: 'up', rank: 1 },
      { skill: 'Node.js', jobCount: 982, trend: 'up', rank: 2 },
      { skill: 'Data Science', jobCount: 845, trend: 'up', rank: 3 },
      { skill: 'Cloud Computing', jobCount: 723, trend: 'up', rank: 4 },
      { skill: 'UI/UX Design', jobCount: 612, trend: 'down', rank: 5 },
      { skill: 'Python', jobCount: 589, trend: 'up', rank: 6 },
      { skill: 'JavaScript', jobCount: 567, trend: 'up', rank: 7 },
      { skill: 'AWS', jobCount: 445, trend: 'up', rank: 8 },
      { skill: 'MongoDB', jobCount: 423, trend: 'up', rank: 9 },
      { skill: 'SQL', jobCount: 398, trend: 'up', rank: 10 }
    ];
    return res.json(mockSkills);
    
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
        
        // For now, always return mock data since talent supply data needs to be seeded
        const mockHeatmap = [
            { district: 'Bangalore Urban', jobCount: 3245, districtCode: 'KA01' },
            { district: 'Hyderabad', jobCount: 2789, districtCode: 'TG01' },
            { district: 'Mumbai City', jobCount: 2456, districtCode: 'MH01' },
            { district: 'Pune', jobCount: 1987, districtCode: 'MH02' },
            { district: 'Delhi', jobCount: 1765, districtCode: 'DL01' },
            { district: 'Gurugram', jobCount: 1543, districtCode: 'HR01' },
            { district: 'Chennai', jobCount: 1321, districtCode: 'TN01' },
            { district: 'Kolkata', jobCount: 1098, districtCode: 'WB01' }
        ];
        return res.json(mockHeatmap);
        
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
        const districts = await District.find({}).sort({ districtName: 1 }).lean();
        
        if (districts.length === 0) {
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
        
        // Transform real data to expected format
        const formattedDistricts = districts.map(district => ({
            code: district.districtCode,
            name: district.districtName,
            state: district.stateName
        }));
        
        res.json(formattedDistricts);
    } catch (error) { next(error) }
});

router.get('/skills', async (req, res, next) => {
    try {
        const skills = await Skill.find({}).sort({ canonical: 1 }).lean();
        
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
        const formattedSkills = skills.map(skill => ({
            id: skill.skillId,
            name: skill.canonical
        }));
        
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

        // Mock analytics data - replace with real calculations
        const analyticsData = {
            demandScore: Math.floor(Math.random() * 40) + 60, // 60-100
            jobPostings: Math.floor(Math.random() * 200) + 50,
            availableTalent: Math.floor(Math.random() * 500) + 200,
            timeToFill: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9) + 1} months`,
            salary: {
                min: Math.floor(Math.random() * 500000) + 500000,
                max: Math.floor(Math.random() * 1000000) + 1000000,
                avg: Math.floor(Math.random() * 750000) + 750000
            },
            marketCompetition: {
                activeEmployers: Math.floor(Math.random() * 50) + 20,
                dsi: (Math.random() * 0.5 + 0.2).toFixed(2)
            },
            talentSupply: {
                total: Math.floor(Math.random() * 500) + 200,
                highSkilled: Math.floor(Math.random() * 200) + 100
            },
            recommendation: "High demand, moderate talent pool. Consider upskilling existing employees or offering competitive packages to attract top talent."
        };

        res.json(analyticsData);
    } catch (error) { 
        next(error) 
    }
});

export default router;