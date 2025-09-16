import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AdzunaService from '../services/adzuna.js';
import { Job, RawJob } from '../models/Job.js';

// Load environment variables
dotenv.config({ path: 'test.env' });

class IntegrationTester {
  constructor() {
    this.adzunaService = new AdzunaService();
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running: ${testName}`);
    try {
      await testFunction();
      console.log(`✅ PASSED: ${testName}`);
      this.testResults.passed++;
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push({ test: testName, error: error.message });
    }
  }

  async testAPIConnection() {
    const jobs = await this.adzunaService.fetchJobs({
      what: 'software developer',
      where: 'Bangalore',
      results_per_page: 1
    });
    
    if (!jobs || !jobs.results) {
      throw new Error('API returned invalid response');
    }
    
    console.log(`   📊 API returned ${jobs.results.length} jobs`);
  }

  async testJobNormalization() {
    const mockJob = {
      title: 'Senior React Developer',
      company: { display_name: 'Tech Corp' },
      location: { display_name: 'Bangalore, India' },
      description: 'Looking for a React developer with Node.js and MongoDB experience',
      salary_min: 800000,
      salary_max: 1200000,
      created: '2024-01-01T00:00:00Z',
      redirect_url: 'https://example.com/job/123',
      id: '12345'
    };

    const normalized = this.adzunaService.normalizeJob(mockJob);
    
    if (!normalized) {
      throw new Error('Job normalization returned null');
    }
    
    if (normalized.title !== 'Senior React Developer') {
      throw new Error('Title not normalized correctly');
    }
    
    if (normalized.company !== 'Tech Corp') {
      throw new Error('Company not normalized correctly');
    }
    
    if (normalized.locations[0].districtCode !== 'KA01') {
      throw new Error('Location not mapped to correct district code');
    }
    
    if (!normalized.skills || normalized.skills.length === 0) {
      throw new Error('Skills not extracted');
    }
    
    console.log(`   📝 Normalized job: ${normalized.title} at ${normalized.company}`);
    console.log(`   🎯 Skills extracted: ${normalized.skills.map(s => s.skillId).join(', ')}`);
  }

  async testSkillExtraction() {
    const testCases = [
      {
        title: 'React Developer with Node.js',
        description: 'JavaScript, TypeScript, MongoDB, AWS',
        expectedSkills: ['react', 'node.js', 'javascript', 'typescript', 'mongodb', 'aws']
      },
      {
        title: 'Python Data Scientist',
        description: 'Machine Learning, TensorFlow, Pandas, NumPy',
        expectedSkills: ['python', 'machine learning', 'tensorflow']
      }
    ];

    for (const testCase of testCases) {
      const skills = this.adzunaService.extractSkills(testCase.title, testCase.description);
      
      for (const expectedSkill of testCase.expectedSkills) {
        if (!skills.includes(expectedSkill)) {
          throw new Error(`Expected skill '${expectedSkill}' not found in extracted skills: [${skills.join(', ')}]`);
        }
      }
    }
    
    console.log(`   🎯 Skill extraction working correctly`);
  }

  async testLocationMapping() {
    const testCases = [
      { location: 'Bangalore, India', expected: 'KA01' },
      { location: 'Mumbai, Maharashtra, India', expected: 'MH01' },
      { location: 'Delhi, India', expected: 'DL01' },
      { location: 'Pune, Maharashtra, India', expected: 'MH02' },
      { location: 'Hyderabad, Telangana, India', expected: 'TG01' }
    ];

    for (const testCase of testCases) {
      const districtCode = this.adzunaService.extractDistrictCode(testCase.location);
      if (districtCode !== testCase.expected) {
        throw new Error(`Location '${testCase.location}' mapped to '${districtCode}' instead of '${testCase.expected}'`);
      }
    }
    
    console.log(`   🗺️  Location mapping working correctly`);
  }

  async testDatabaseOperations() {
    // Clean up any existing test data
    await Job.deleteMany({ title: 'Integration Test Job' });
    await RawJob.deleteMany({ source: 'adzuna', fetchUrl: 'https://test.com/integration' });

    const mockJob = {
      title: 'Integration Test Job',
      company: 'Test Corp',
      description: 'Test description for integration testing',
      locations: [{ districtCode: 'KA01', city: 'Bangalore' }],
      skills: [{ skillId: 'javascript', confidence: 0.8 }],
      salary: { min: 500000, max: 800000, currency: 'INR', period: 'yearly' },
      employmentType: 'full-time',
      postedAt: new Date(),
      source: 'adzuna',
      sourceUrl: 'https://test.com/integration',
      externalId: 'integration-test-1'
    };

    const savedJobs = await this.adzunaService.saveJobs([mockJob]);
    
    if (savedJobs.length !== 1) {
      throw new Error(`Expected 1 job to be saved, got ${savedJobs.length}`);
    }
    
    const dbJob = await Job.findOne({ title: 'Integration Test Job' });
    if (!dbJob) {
      throw new Error('Job not found in database');
    }
    
    const rawJob = await RawJob.findOne({ source: 'adzuna', fetchUrl: 'https://test.com/integration' });
    if (!rawJob) {
      throw new Error('Raw job not found in database');
    }
    
    console.log(`   💾 Database operations working correctly`);
    
    // Clean up
    await Job.deleteMany({ title: 'Integration Test Job' });
    await RawJob.deleteMany({ source: 'adzuna', fetchUrl: 'https://test.com/integration' });
  }

  async testEndToEndFlow() {
    // Clean up
    await Job.deleteMany({ source: 'adzuna', company: 'End-to-End Test Corp' });
    await RawJob.deleteMany({ source: 'adzuna', 'htmlContent': { $regex: 'End-to-End Test' } });

    const savedJobs = await this.adzunaService.fetchAndSaveJobs(
      'javascript developer',
      'Mumbai',
      1 // Only 1 page for testing
    );
    
    if (savedJobs.length === 0) {
      console.log(`   ⚠️  No jobs were saved (this might be due to API limits or no results)`);
      return;
    }
    
    const job = savedJobs[0];
    
    if (!job.title || !job.company) {
      throw new Error('Saved job missing required fields');
    }
    
    if (job.source !== 'adzuna') {
      throw new Error('Job source not set correctly');
    }
    
    console.log(`   🔄 End-to-end flow working: saved ${savedJobs.length} jobs`);
    console.log(`   📋 Sample job: ${job.title} at ${job.company}`);
    
    // Clean up
    await Job.deleteMany({ source: 'adzuna', company: job.company });
    await RawJob.deleteMany({ source: 'adzuna' });
  }

  async testRateLimiting() {
    const startTime = Date.now();
    
    await this.adzunaService.fetchJobs({ what: 'test1', where: 'test1' });
    await this.adzunaService.fetchJobs({ what: 'test2', where: 'test2' });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration < 1000) {
      throw new Error(`Rate limiting not working: requests completed in ${duration}ms (expected at least 1000ms)`);
    }
    
    console.log(`   ⏱️  Rate limiting working correctly (${duration}ms between requests)`);
  }

  async testErrorHandling() {
    // Test with invalid job data
    const invalidJob = {
      title: null,
      company: null,
      description: null
    };

    const normalized = this.adzunaService.normalizeJob(invalidJob);
    if (normalized !== null) {
      throw new Error('Invalid job data should return null');
    }
    
    console.log(`   🛡️  Error handling working correctly`);
  }

  async runAllTests() {
    console.log('🚀 Starting Adzuna Integration Tests...\n');
    console.log('=' * 50);

    try {
      // Connect to database
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-market-radar-test');
      console.log('📡 Connected to MongoDB\n');

      // Run all tests
      await this.runTest('API Connection', () => this.testAPIConnection());
      await this.runTest('Job Normalization', () => this.testJobNormalization());
      await this.runTest('Skill Extraction', () => this.testSkillExtraction());
      await this.runTest('Location Mapping', () => this.testLocationMapping());
      await this.runTest('Database Operations', () => this.testDatabaseOperations());
      await this.runTest('Rate Limiting', () => this.testRateLimiting());
      await this.runTest('Error Handling', () => this.testErrorHandling());
      await this.runTest('End-to-End Flow', () => this.testEndToEndFlow());

    } catch (error) {
      console.error('❌ Test setup failed:', error);
    } finally {
      await mongoose.disconnect();
      console.log('\n📡 Disconnected from MongoDB');
    }

    // Print results
    console.log('\n' + '=' * 50);
    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100)}%`);

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.errors.forEach(({ test, error }) => {
        console.log(`   • ${test}: ${error}`);
      });
    }

    if (this.testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Adzuna integration is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }

    process.exit(this.testResults.failed === 0 ? 0 : 1);
  }
}

// Run the tests
const tester = new IntegrationTester();
tester.runAllTests();
