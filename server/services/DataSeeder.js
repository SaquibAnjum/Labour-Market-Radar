import AdzunaService from './adzuna.js';
import { Job } from '../models/Job.js';
import SkillTaxonomy from '../models/SkillTaxonomy.js';
import GeoMapping from '../models/GeoMapping.js';
import DemandSupplyIndex from '../models/DemandSupplyIndex.js';

class DataSeeder {
  constructor() {
    this.adzunaService = new AdzunaService();
    this.skillKeywords = [
      'javascript', 'python', 'java', 'react', 'nodejs', 'angular', 'vue', 'php',
      'c++', 'c#', 'ruby', 'swift', 'kotlin', 'go', 'rust', 'scala', 'typescript',
      'html', 'css', 'bootstrap', 'jquery', 'mongodb', 'mysql', 'postgresql',
      'redis', 'elasticsearch', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
      'machine learning', 'artificial intelligence', 'data science', 'analytics',
      'blockchain', 'cybersecurity', 'devops', 'agile', 'scrum', 'testing',
      'ui/ux', 'frontend', 'backend', 'full stack', 'mobile development',
      'web development', 'software engineering', 'programming', 'coding'
    ];
  }

  async seedInitialData() {
    console.log('🌱 Starting data seeding process...');
    
    try {
      // 1. Seed skill taxonomy
      await this.seedSkillTaxonomy();
      
      // 2. Seed geo mapping
      await this.seedGeoMapping();
      
      // 3. Fetch and process Adzuna jobs
      await this.fetchAndProcessAdzunaJobs();
      
      // 4. Calculate DSI for all skills and districts
      await this.calculateDSI();
      
      console.log('✅ Data seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during data seeding:', error);
      throw error;
    }
  }

  async seedSkillTaxonomy() {
    console.log('📚 Seeding skill taxonomy...');
    
    const skills = [
      { canonical: 'JavaScript', category: 'technical', sector: 'IT', synonyms: ['JS', 'ECMAScript', 'ES6'] },
      { canonical: 'Python', category: 'technical', sector: 'IT', synonyms: ['Python3', 'Py'] },
      { canonical: 'Java', category: 'technical', sector: 'IT', synonyms: ['Java8', 'Java11', 'J2EE'] },
      { canonical: 'React', category: 'technical', sector: 'IT', synonyms: ['ReactJS', 'React.js'] },
      { canonical: 'Node.js', category: 'technical', sector: 'IT', synonyms: ['NodeJS', 'Node'] },
      { canonical: 'Angular', category: 'technical', sector: 'IT', synonyms: ['AngularJS', 'Angular2+'] },
      { canonical: 'Vue.js', category: 'technical', sector: 'IT', synonyms: ['Vue', 'VueJS'] },
      { canonical: 'PHP', category: 'technical', sector: 'IT', synonyms: ['PHP7', 'PHP8'] },
      { canonical: 'C++', category: 'technical', sector: 'IT', synonyms: ['Cpp', 'C++17'] },
      { canonical: 'C#', category: 'technical', sector: 'IT', synonyms: ['CSharp', 'C#.NET'] },
      { canonical: 'Ruby', category: 'technical', sector: 'IT', synonyms: ['Ruby on Rails', 'Rails'] },
      { canonical: 'Swift', category: 'technical', sector: 'IT', synonyms: ['iOS', 'Apple'] },
      { canonical: 'Kotlin', category: 'technical', sector: 'IT', synonyms: ['Android', 'Kotlin/JS'] },
      { canonical: 'Go', category: 'technical', sector: 'IT', synonyms: ['Golang', 'GoLang'] },
      { canonical: 'Rust', category: 'technical', sector: 'IT', synonyms: ['Rustlang'] },
      { canonical: 'TypeScript', category: 'technical', sector: 'IT', synonyms: ['TS', 'TypeScript'] },
      { canonical: 'HTML', category: 'technical', sector: 'IT', synonyms: ['HTML5', 'Markup'] },
      { canonical: 'CSS', category: 'technical', sector: 'IT', synonyms: ['CSS3', 'Styling'] },
      { canonical: 'Bootstrap', category: 'technical', sector: 'IT', synonyms: ['Bootstrap4', 'Bootstrap5'] },
      { canonical: 'jQuery', category: 'technical', sector: 'IT', synonyms: ['jQuery3', 'jQ'] },
      { canonical: 'MongoDB', category: 'technical', sector: 'IT', synonyms: ['Mongo', 'NoSQL'] },
      { canonical: 'MySQL', category: 'technical', sector: 'IT', synonyms: ['MySQL8', 'SQL'] },
      { canonical: 'PostgreSQL', category: 'technical', sector: 'IT', synonyms: ['Postgres', 'PostgresQL'] },
      { canonical: 'Redis', category: 'technical', sector: 'IT', synonyms: ['Redis Cache', 'Cache'] },
      { canonical: 'Elasticsearch', category: 'technical', sector: 'IT', synonyms: ['ES', 'Search'] },
      { canonical: 'Docker', category: 'technical', sector: 'IT', synonyms: ['Container', 'Dockerfile'] },
      { canonical: 'Kubernetes', category: 'technical', sector: 'IT', synonyms: ['K8s', 'Kube'] },
      { canonical: 'AWS', category: 'technical', sector: 'IT', synonyms: ['Amazon Web Services', 'Cloud'] },
      { canonical: 'Azure', category: 'technical', sector: 'IT', synonyms: ['Microsoft Azure', 'Cloud'] },
      { canonical: 'GCP', category: 'technical', sector: 'IT', synonyms: ['Google Cloud', 'Cloud'] },
      { canonical: 'Machine Learning', category: 'technical', sector: 'AI', synonyms: ['ML', 'AI/ML'] },
      { canonical: 'Artificial Intelligence', category: 'technical', sector: 'AI', synonyms: ['AI', 'Intelligence'] },
      { canonical: 'Data Science', category: 'technical', sector: 'AI', synonyms: ['Data Analytics', 'Analytics'] },
      { canonical: 'Blockchain', category: 'technical', sector: 'IT', synonyms: ['Crypto', 'Distributed Ledger'] },
      { canonical: 'Cybersecurity', category: 'technical', sector: 'Security', synonyms: ['Security', 'InfoSec'] },
      { canonical: 'DevOps', category: 'technical', sector: 'IT', synonyms: ['Dev Ops', 'CI/CD'] },
      { canonical: 'Agile', category: 'soft', sector: 'Management', synonyms: ['Agile Methodology', 'Scrum'] },
      { canonical: 'Scrum', category: 'soft', sector: 'Management', synonyms: ['Agile', 'Sprint'] },
      { canonical: 'Testing', category: 'technical', sector: 'IT', synonyms: ['QA', 'Quality Assurance'] },
      { canonical: 'UI/UX', category: 'technical', sector: 'Design', synonyms: ['User Interface', 'User Experience'] },
      { canonical: 'Frontend', category: 'technical', sector: 'IT', synonyms: ['Front-end', 'Client-side'] },
      { canonical: 'Backend', category: 'technical', sector: 'IT', synonyms: ['Back-end', 'Server-side'] },
      { canonical: 'Full Stack', category: 'technical', sector: 'IT', synonyms: ['Full-stack', 'Fullstack'] },
      { canonical: 'Mobile Development', category: 'technical', sector: 'IT', synonyms: ['Mobile App', 'App Development'] },
      { canonical: 'Web Development', category: 'technical', sector: 'IT', synonyms: ['Web Dev', 'Website Development'] },
      { canonical: 'Software Engineering', category: 'technical', sector: 'IT', synonyms: ['Software Dev', 'Engineering'] },
      { canonical: 'Programming', category: 'technical', sector: 'IT', synonyms: ['Coding', 'Development'] }
    ];

    for (const skill of skills) {
      await SkillTaxonomy.findOneAndUpdate(
        { canonical: skill.canonical },
        skill,
        { upsert: true, new: true }
      );
    }
    
    console.log(`✅ Seeded ${skills.length} skills in taxonomy`);
  }

  async seedGeoMapping() {
    console.log('🗺️ Seeding geo mapping...');
    
    const districts = [
      { districtCode: 'KA01', districtName: 'Bangalore Urban', stateName: 'Karnataka', stateCode: 'KA', region: 'South', cities: ['Bangalore', 'Bengaluru'], pincodes: ['560001', '560002', '560003'], centroid: { lat: 12.9716, lon: 77.5946 } },
      { districtCode: 'MH01', districtName: 'Mumbai', stateName: 'Maharashtra', stateCode: 'MH', region: 'West', cities: ['Mumbai', 'Bombay'], pincodes: ['400001', '400002', '400003'], centroid: { lat: 19.0760, lon: 72.8777 } },
      { districtCode: 'DL01', districtName: 'New Delhi', stateName: 'Delhi', stateCode: 'DL', region: 'North', cities: ['New Delhi', 'Delhi'], pincodes: ['110001', '110002', '110003'], centroid: { lat: 28.6139, lon: 77.2090 } },
      { districtCode: 'TN01', districtName: 'Chennai', stateName: 'Tamil Nadu', stateCode: 'TN', region: 'South', cities: ['Chennai', 'Madras'], pincodes: ['600001', '600002', '600003'], centroid: { lat: 13.0827, lon: 80.2707 } },
      { districtCode: 'TG01', districtName: 'Hyderabad', stateName: 'Telangana', stateCode: 'TG', region: 'South', cities: ['Hyderabad', 'Secunderabad'], pincodes: ['500001', '500002', '500003'], centroid: { lat: 17.3850, lon: 78.4867 } },
      { districtCode: 'GJ01', districtName: 'Ahmedabad', stateName: 'Gujarat', stateCode: 'GJ', region: 'West', cities: ['Ahmedabad', 'Amdavad'], pincodes: ['380001', '380002', '380003'], centroid: { lat: 23.0225, lon: 72.5714 } },
      { districtCode: 'UP01', districtName: 'Lucknow', stateName: 'Uttar Pradesh', stateCode: 'UP', region: 'North', cities: ['Lucknow'], pincodes: ['226001', '226002', '226003'], centroid: { lat: 26.8467, lon: 80.9462 } },
      { districtCode: 'WB01', districtName: 'Kolkata', stateName: 'West Bengal', stateCode: 'WB', region: 'East', cities: ['Kolkata', 'Calcutta'], pincodes: ['700001', '700002', '700003'], centroid: { lat: 22.5726, lon: 88.3639 } },
      { districtCode: 'RJ01', districtName: 'Jaipur', stateName: 'Rajasthan', stateCode: 'RJ', region: 'North', cities: ['Jaipur', 'Pink City'], pincodes: ['302001', '302002', '302003'], centroid: { lat: 26.9124, lon: 75.7873 } },
      { districtCode: 'MP01', districtName: 'Bhopal', stateName: 'Madhya Pradesh', stateCode: 'MP', region: 'Central', cities: ['Bhopal'], pincodes: ['462001', '462002', '462003'], centroid: { lat: 23.2599, lon: 77.4126 } }
    ];

    for (const district of districts) {
      await GeoMapping.findOneAndUpdate(
        { districtCode: district.districtCode },
        district,
        { upsert: true, new: true }
      );
    }
    
    console.log(`✅ Seeded ${districts.length} districts in geo mapping`);
  }

  async fetchAndProcessAdzunaJobs() {
    console.log('🔍 Fetching and processing Adzuna jobs...');
    
    const locations = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
    const skills = ['javascript', 'python', 'java', 'react', 'nodejs', 'angular', 'vue', 'php', 'c++', 'c#'];
    
    let totalJobs = 0;
    
    for (const location of locations) {
      for (const skill of skills) {
        try {
          console.log(`🔍 Fetching jobs for ${skill} in ${location}...`);
          
          const jobs = await this.adzunaService.fetchJobs({
            what: skill,
            where: location,
            results_per_page: 25,
            page: 1
          });
          
          if (jobs && jobs.results) {
            console.log(`📊 Found ${jobs.results.length} jobs for ${skill} in ${location}`);
            
            for (const job of jobs.results) {
              await this.processJob(job, location);
              totalJobs++;
            }
          }
          
          // Rate limiting - wait between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Error fetching jobs for ${skill} in ${location}:`, error.message);
          // Continue with next skill/location
        }
      }
    }
    
    console.log(`✅ Processed ${totalJobs} jobs from Adzuna`);
  }

  async processJob(job, location) {
    try {
      // Extract skills from job description
      const extractedSkills = this.extractSkillsFromJob(job);
      
      // Map location to district
      const districtCode = this.mapLocationToDistrict(location);
      
      if (!districtCode) {
        console.log(`⚠️ Could not map location ${location} to district`);
        return;
      }
      
      // Create job record
      const jobRecord = {
        title: job.title || 'Unknown Title',
        company: job.company?.display_name || 'Unknown Company',
        description: job.description || '',
        locations: [{
          city: job.location?.display_name || location,
          state: this.getStateFromDistrict(districtCode),
          districtCode: districtCode
        }],
        salary: this.extractSalary(job),
        employmentType: this.normalizeEmploymentType(job),
        postedAt: new Date(job.created || Date.now()),
        source: 'adzuna',
        sourceJobId: job.id?.toString() || '',
        skills: extractedSkills.map(skill => ({
          skillId: skill.toLowerCase(),
          name: skill,
          weight: 1,
          confidence: 0.8
        })),
        sourceUrl: job.redirect_url || '',
        externalId: job.id?.toString() || ''
      };
      
      // Save job (avoid duplicates)
      await Job.findOneAndUpdate(
        { 
          source: 'adzuna', 
          sourceJobId: jobRecord.sourceJobId,
          title: jobRecord.title,
          company: jobRecord.company
        },
        jobRecord,
        { upsert: true, new: true }
      );
      
    } catch (error) {
      console.error('❌ Error processing job:', error);
    }
  }

  extractSkillsFromJob(job) {
    const description = (job.description || '').toLowerCase();
    const title = (job.title || '').toLowerCase();
    const text = `${title} ${description}`;
    
    const foundSkills = [];
    
    for (const skill of this.skillKeywords) {
      if (text.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
    
    return [...new Set(foundSkills)]; // Remove duplicates
  }

  mapLocationToDistrict(location) {
    const locationMap = {
      'bangalore': 'KA01',
      'bengaluru': 'KA01',
      'mumbai': 'MH01',
      'bombay': 'MH01',
      'delhi': 'DL01',
      'new delhi': 'DL01',
      'chennai': 'TN01',
      'madras': 'TN01',
      'hyderabad': 'TG01',
      'secunderabad': 'TG01',
      'pune': 'MH02',
      'kolkata': 'WB01',
      'calcutta': 'WB01',
      'ahmedabad': 'GJ01',
      'amdavad': 'GJ01'
    };
    
    return locationMap[location.toLowerCase()] || null;
  }

  getStateFromDistrict(districtCode) {
    const stateMap = {
      'KA01': 'Karnataka',
      'MH01': 'Maharashtra',
      'MH02': 'Maharashtra',
      'DL01': 'Delhi',
      'TN01': 'Tamil Nadu',
      'TG01': 'Telangana',
      'GJ01': 'Gujarat',
      'UP01': 'Uttar Pradesh',
      'WB01': 'West Bengal',
      'RJ01': 'Rajasthan',
      'MP01': 'Madhya Pradesh'
    };
    
    return stateMap[districtCode] || 'Unknown State';
  }

  extractSalary(job) {
    if (job.salary_min && job.salary_max) {
      return {
        min: job.salary_min,
        max: job.salary_max,
        currency: job.salary_currency || 'INR'
      };
    }
    return null;
  }

  extractExperience(job) {
    const description = (job.description || '').toLowerCase();
    const experienceMatch = description.match(/(\d+)\s*[-–]\s*(\d+)\s*years?/);
    
    if (experienceMatch) {
      return {
        min: parseInt(experienceMatch[1]),
        max: parseInt(experienceMatch[2])
      };
    }
    
    return null;
  }

  normalizeEmploymentType(job) {
    const description = (job.description || '').toLowerCase();
    
    if (description.includes('full time') || description.includes('full-time')) {
      return 'full-time';
    } else if (description.includes('part time') || description.includes('part-time')) {
      return 'part-time';
    } else if (description.includes('contract')) {
      return 'contract';
    } else if (description.includes('internship')) {
      return 'internship';
    }
    
    return 'full-time'; // Default
  }

  async calculateDSI() {
    console.log('📊 Calculating Demand-Supply Index...');
    
    const skills = await SkillTaxonomy.find({ isActive: true });
    const districts = await GeoMapping.find({ isActive: true });
    
    for (const skill of skills) {
      for (const district of districts) {
        await this.calculateSkillDistrictDSI(skill, district);
      }
    }
    
    console.log('✅ DSI calculation completed');
  }

  async calculateSkillDistrictDSI(skill, district) {
    try {
      // Count job postings for this skill in this district
      const jobCount = await Job.countDocuments({
        'locations.districtCode': district.districtCode,
        'skills.skillId': skill.canonical.toLowerCase(),
        postedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      });
      
      // Simulate supply (in real system, this would come from learner data)
      const supplyCount = Math.floor(Math.random() * 200) + 50; // 50-250 candidates
      
      const dsi = jobCount / supplyCount;
      let dsiCategory = 'balanced';
      if (dsi > 1.5) dsiCategory = 'undersupplied';
      else if (dsi < 0.5) dsiCategory = 'oversupplied';
      
      const avgSalary = Math.floor(Math.random() * (1500000 - 500000 + 1)) + 500000; // 5L - 15L
      const medianSalary = Math.floor(avgSalary * (0.8 + Math.random() * 0.2));
      const trend = Math.random() > 0.5 ? 'up' : 'down';
      const trendPercentage = Math.floor(Math.random() * 30) + 5;
      const uniqueEmployers = Math.floor(jobCount * (0.3 + Math.random() * 0.5));
      const timeToFill = Math.floor(Math.random() * 30) + 7; // 7-37 days
      
      let marketTightness = 'moderate';
      if (dsi > 1.8) marketTightness = 'very_tight';
      else if (dsi > 1.2) marketTightness = 'tight';
      else if (dsi < 0.8) marketTightness = 'loose';
      else if (dsi < 0.4) marketTightness = 'very_loose';
      
      await DemandSupplyIndex.findOneAndUpdate(
        { 
          districtCode: district.districtCode, 
          skillId: skill._id, 
          timeWindow: '30d' 
        },
        {
          demandCount: jobCount,
          supplyCount: supplyCount,
          dsi: dsi,
          dsiCategory: dsiCategory,
          avgSalary: avgSalary,
          medianSalary: medianSalary,
          trend: trend,
          trendPercentage: trendPercentage,
          uniqueEmployers: uniqueEmployers,
          timeToFill: timeToFill,
          marketTightness: marketTightness,
          lastAggregatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      
    } catch (error) {
      console.error(`❌ Error calculating DSI for ${skill.canonical} in ${district.districtName}:`, error);
    }
  }
}

export default DataSeeder;
