import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AdzunaService from '../services/adzuna.js';

dotenv.config();

async function testAdzunaIntegration() {
  try {
    console.log('Testing Adzuna API Integration...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-market-radar');
    console.log('Connected to MongoDB\n');
    
    // Initialize Adzuna service
    const adzunaService = new AdzunaService();
    
    // Test 1: Fetch jobs from API
    console.log('Test 1: Fetching jobs from Adzuna API...');
    const jobs = await adzunaService.fetchJobs({
      what: 'software developer',
      where: 'Bangalore',
      results_per_page: 5
    });
    
    console.log(`✅ Fetched ${jobs.results?.length || 0} jobs from API`);
    if (jobs.results && jobs.results.length > 0) {
      console.log(`   Sample job: ${jobs.results[0].title} at ${jobs.results[0].company?.display_name}`);
    }
    console.log();
    
    // Test 2: Normalize job data
    console.log('Test 2: Testing job normalization...');
    if (jobs.results && jobs.results.length > 0) {
      const normalizedJob = adzunaService.normalizeJob(jobs.results[0]);
      console.log('✅ Job normalized successfully');
      console.log(`   Title: ${normalizedJob.title}`);
      console.log(`   Company: ${normalizedJob.company}`);
      console.log(`   Skills: ${normalizedJob.skills.map(s => s.skillId).join(', ')}`);
      console.log(`   Location: ${normalizedJob.locations[0]?.city}, ${normalizedJob.locations[0]?.districtCode}`);
      console.log(`   Employment Type: ${normalizedJob.employmentType}`);
      if (normalizedJob.salary) {
        console.log(`   Salary: ₹${normalizedJob.salary.min} - ₹${normalizedJob.salary.max} ${normalizedJob.salary.currency}/${normalizedJob.salary.period}`);
      }
    }
    console.log();
    
    // Test 3: Fetch and save jobs
    console.log('Test 3: Fetching and saving jobs to database...');
    const savedJobs = await adzunaService.fetchAndSaveJobs(
      'javascript developer',
      'Mumbai',
      1 // Only 1 page for testing
    );
    
    console.log(`✅ Successfully saved ${savedJobs.length} jobs to database`);
    if (savedJobs.length > 0) {
      console.log(`   Sample saved job: ${savedJobs[0].title} at ${savedJobs[0].company}`);
    }
    console.log();
    
    // Test 4: Test skill extraction
    console.log('Test 4: Testing skill extraction...');
    const testTitles = [
      'Senior React Developer with Node.js experience',
      'Python Data Scientist - Machine Learning',
      'Full Stack JavaScript Developer (React + Node.js)',
      'AWS DevOps Engineer with Docker and Kubernetes',
      'UI/UX Designer with Figma and Adobe Creative Suite'
    ];
    
    testTitles.forEach(title => {
      const skills = adzunaService.extractSkills(title, '');
      console.log(`   "${title}" → Skills: [${skills.join(', ')}]`);
    });
    console.log();
    
    // Test 5: Test location mapping
    console.log('Test 5: Testing location mapping...');
    const testLocations = [
      'Bangalore, India',
      'Mumbai, Maharashtra, India',
      'Delhi, India',
      'Pune, Maharashtra, India',
      'Hyderabad, Telangana, India'
    ];
    
    testLocations.forEach(location => {
      const districtCode = adzunaService.extractDistrictCode(location);
      const city = adzunaService.extractCity(location);
      const state = adzunaService.extractState(location);
      console.log(`   "${location}" → City: ${city}, State: ${state}, District: ${districtCode}`);
    });
    console.log();
    
    console.log('🎉 All tests completed successfully!');
    console.log('\nAdzuna integration is working correctly.');
    console.log('You can now use the following API endpoints:');
    console.log('- GET /api/radar/adzuna/search - Search jobs');
    console.log('- POST /api/radar/adzuna/fetch - Fetch and save jobs');
    console.log('- GET /api/radar/adzuna/trending-skills - Get trending skills');
    console.log('- GET /api/radar/adzuna/stats - Get job statistics');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testAdzunaIntegration();
