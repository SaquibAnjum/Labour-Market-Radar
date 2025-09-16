import fetch from 'node-fetch';
import { Job, RawJob } from '../models/Job.js';

/**
 * Adzuna API Service
 * Handles fetching job data from Adzuna API and integrating it with the radar system
 */
class AdzunaService {
  constructor() {
    this.appId = process.env.ADZUNA_APP_ID;
    this.appKey = process.env.ADZUNA_APP_KEY;
    this.country = process.env.ADZUNA_COUNTRY || 'in';
    this.baseUrl = process.env.ADZUNA_BASE_URL || 'https://api.adzuna.com/v1/api/jobs';
    this.rateLimitDelay = 1000; // 1 second delay between requests
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting to respect API limits
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch jobs from Adzuna API
   * @param {Object} params - Search parameters
   * @param {string} params.what - Job keyword/search term
   * @param {string} params.where - Location
   * @param {number} params.page - Page number (1-based)
   * @param {number} params.results_per_page - Results per page (max 50)
   * @param {string} params.category - Job category
   * @param {number} params.salary_min - Minimum salary
   * @param {boolean} params.full_time - Full-time jobs only
   */
  async fetchJobs(params = {}) {
    const {
      what = 'software developer',
      where = '',
      page = 1,
      results_per_page = 50,
      category = '',
      salary_min = '',
      full_time = true
    } = params;

    await this.rateLimit();

    // Build query parameters according to Adzuna API documentation
    const queryParams = [];
    queryParams.push(`app_id=${this.appId}`);
    queryParams.push(`app_key=${this.appKey}`);
    queryParams.push(`results_per_page=${Math.min(results_per_page, 50)}`);
    queryParams.push(`what=${encodeURIComponent(what)}`);
    // Note: page number is in the URL path, not in query params
    
    // Only add optional parameters if they have values
    if (where && where.trim()) {
      queryParams.push(`where=${encodeURIComponent(where.trim())}`);
    }
    if (category && category.trim()) {
      queryParams.push(`category=${encodeURIComponent(category.trim())}`);
    }
    if (salary_min && salary_min > 0) {
      queryParams.push(`salary_min=${salary_min}`);
    }
    if (full_time) {
      queryParams.push('full_time=1');
    }

    const url = `${this.baseUrl}/${this.country}/search/${page}?${queryParams.join('&')}`;
    
    try {
      console.log(`Fetching Adzuna jobs: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Adzuna API error response: ${errorText}`);
        throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching from Adzuna API:', error);
      throw error;
    }
  }

  /**
   * Fetch multiple pages of jobs
   * @param {Object} params - Search parameters
   * @param {number} maxPages - Maximum pages to fetch
   */
  async fetchAllJobs(params = {}, maxPages = 5) {
    const allJobs = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages && currentPage <= maxPages) {
      try {
        const data = await this.fetchJobs({ ...params, page: currentPage });
        
        if (data.results && data.results.length > 0) {
          allJobs.push(...data.results);
          console.log(`Fetched ${data.results.length} jobs from page ${currentPage}`);
          
          // Check if there are more pages
          const totalResults = data.count || 0;
          const resultsPerPage = params.results_per_page || 50;
          const totalPages = Math.ceil(totalResults / resultsPerPage);
          
          hasMorePages = currentPage < totalPages;
          currentPage++;
        } else {
          hasMorePages = false;
        }
      } catch (error) {
        console.error(`Error fetching page ${currentPage}:`, error);
        hasMorePages = false;
      }
    }

    return allJobs;
  }

  /**
   * Normalize Adzuna job data to our Job model format
   * @param {Object} adzunaJob - Raw job data from Adzuna
   */
  normalizeJob(adzunaJob) {
    try {
      // Validate required fields
      if (!adzunaJob || !adzunaJob.title || !adzunaJob.company) {
        return null;
      }

      // Extract location information
      const location = adzunaJob.location?.display_name || '';
      const districtCode = this.extractDistrictCode(location);
      
      // Extract skills from title and description
      const skills = this.extractSkills(adzunaJob.title, adzunaJob.description);
      
      // Parse salary information
      const salary = this.parseSalary(adzunaJob.salary_min, adzunaJob.salary_max);
      
      // Determine employment type
      const employmentType = this.determineEmploymentType(adzunaJob);
      
      // Extract company information
      const company = adzunaJob.company?.display_name || 'Unknown Company';
      
      return {
        title: adzunaJob.title || 'Untitled Position',
        company: company,
        description: adzunaJob.description || '',
        locations: [{
          districtCode: districtCode,
          city: this.extractCity(location),
          state: this.extractState(location)
        }],
        skills: skills.map(skill => ({
          skillId: skill,
          confidence: 0.8 // High confidence for Adzuna data
        })),
        salary: salary,
        employmentType: employmentType,
        postedAt: new Date(adzunaJob.created || new Date()),
        source: 'adzuna',
        sourceUrl: adzunaJob.redirect_url || '',
        externalId: adzunaJob.id?.toString() || '',
        duplicateOf: null
      };
    } catch (error) {
      console.error('Error normalizing Adzuna job:', error);
      return null;
    }
  }

  /**
   * Extract district code from location string
   * @param {string} location - Location string from Adzuna
   */
  extractDistrictCode(location) {
    // Map major cities to district codes
    const cityToDistrict = {
      'bangalore': 'KA01',
      'bengaluru': 'KA01',
      'mumbai': 'MH01',
      'pune': 'MH02',
      'delhi': 'DL01',
      'gurgaon': 'HR01',
      'gurugram': 'HR01',
      'hyderabad': 'TG01',
      'chennai': 'TN01',
      'kolkata': 'WB01',
      'ahmedabad': 'GJ01',
      'noida': 'UP01',
      'indore': 'MP01',
      'jaipur': 'RJ01',
      'kochi': 'KL01',
      'coimbatore': 'TN02',
      'vadodara': 'GJ02',
      'nashik': 'MH03',
      'rajkot': 'GJ03',
      'visakhapatnam': 'AP01'
    };

    const locationLower = location.toLowerCase();
    for (const [city, code] of Object.entries(cityToDistrict)) {
      if (locationLower.includes(city)) {
        return code;
      }
    }
    return 'UNKNOWN';
  }

  /**
   * Extract city name from location string
   */
  extractCity(location) {
    const parts = location.split(',').map(part => part.trim());
    return parts[0] || 'Unknown City';
  }

  /**
   * Extract state name from location string
   */
  extractState(location) {
    const parts = location.split(',').map(part => part.trim());
    return parts[1] || 'Unknown State';
  }

  /**
   * Extract skills from job title and description
   * @param {string} title - Job title
   * @param {string} description - Job description
   */
  extractSkills(title, description) {
    const skillKeywords = [
      'javascript', 'react', 'node.js', 'nodejs', 'python', 'java', 'php',
      'angular', 'vue', 'typescript', 'html', 'css', 'bootstrap', 'jquery',
      'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
      'git', 'github', 'gitlab', 'ci/cd', 'devops', 'agile', 'scrum',
      'machine learning', 'ai', 'artificial intelligence', 'data science',
      'analytics', 'big data', 'hadoop', 'spark', 'tensorflow', 'pytorch',
      'blockchain', 'cryptocurrency', 'solidity', 'web3',
      'mobile', 'ios', 'android', 'react native', 'flutter', 'xamarin',
      'ui/ux', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
      'salesforce', 'sap', 'oracle', 'microsoft', 'office', 'excel',
      'testing', 'qa', 'selenium', 'cypress', 'jest', 'mocha',
      'microservices', 'api', 'rest', 'graphql', 'soap',
      'security', 'cybersecurity', 'penetration testing', 'owasp'
    ];

    const text = `${title} ${description}`.toLowerCase();
    const foundSkills = [];

    for (const skill of skillKeywords) {
      if (text.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }

    return [...new Set(foundSkills)]; // Remove duplicates
  }

  /**
   * Parse salary information
   * @param {number} minSalary - Minimum salary
   * @param {number} maxSalary - Maximum salary
   */
  parseSalary(minSalary, maxSalary) {
    if (!minSalary && !maxSalary) return null;

    return {
      min: minSalary || 0,
      max: maxSalary || 0,
      currency: 'INR',
      period: 'yearly'
    };
  }

  /**
   * Determine employment type from job data
   * @param {Object} job - Job data from Adzuna
   */
  determineEmploymentType(job) {
    const title = (job.title || '').toLowerCase();
    const description = (job.description || '').toLowerCase();
    
    if (title.includes('intern') || description.includes('internship')) {
      return 'internship';
    }
    if (title.includes('contract') || description.includes('contract')) {
      return 'contract';
    }
    if (title.includes('part-time') || description.includes('part time')) {
      return 'part-time';
    }
    if (title.includes('freelance') || description.includes('freelance')) {
      return 'freelance';
    }
    
    return 'full-time'; // Default
  }

  /**
   * Save jobs to database
   * @param {Array} jobs - Array of normalized job objects
   */
  async saveJobs(jobs) {
    const savedJobs = [];
    
    for (const job of jobs) {
      if (!job) continue;

      try {
        // Check for duplicates
        const existingJob = await Job.findOne({
          title: job.title,
          company: job.company,
          'locations.districtCode': job.locations[0]?.districtCode,
          source: 'adzuna'
        });

        if (existingJob) {
          console.log(`Skipping duplicate job: ${job.title} at ${job.company}`);
          continue;
        }

        // Save raw job data for traceability
        const rawJob = new RawJob({
          source: 'adzuna',
          fetchUrl: job.sourceUrl,
          htmlContent: JSON.stringify(job), // Store normalized data as JSON
          processed: true
        });
        await rawJob.save();

        // Save normalized job
        const newJob = new Job(job);
        await newJob.save();
        savedJobs.push(newJob);
        
        console.log(`Saved Adzuna job: ${job.title} at ${job.company}`);
      } catch (error) {
        console.error('Error saving job:', error);
      }
    }

    return savedJobs;
  }

  /**
   * Fetch and save jobs for a specific search term
   * @param {string} searchTerm - Job search term
   * @param {string} location - Location filter
   * @param {number} maxPages - Maximum pages to fetch
   */
  async fetchAndSaveJobs(searchTerm, location = '', maxPages = 3) {
    try {
      console.log(`Fetching Adzuna jobs for: ${searchTerm} in ${location}`);
      
      const jobs = await this.fetchAllJobs({
        what: searchTerm,
        where: location,
        results_per_page: 50
      }, maxPages);

      console.log(`Fetched ${jobs.length} jobs from Adzuna`);

      const normalizedJobs = jobs.map(job => this.normalizeJob(job)).filter(Boolean);
      const savedJobs = await this.saveJobs(normalizedJobs);

      console.log(`Saved ${savedJobs.length} new jobs from Adzuna`);
      return savedJobs;
    } catch (error) {
      console.error('Error in fetchAndSaveJobs:', error);
      throw error;
    }
  }
}

export default AdzunaService;
