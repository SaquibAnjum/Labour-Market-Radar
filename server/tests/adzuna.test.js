import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdzunaService from '../services/adzuna.js';
import { Job, RawJob } from '../models/Job.js';

dotenv.config();

describe('Adzuna API Integration Tests', () => {
  let adzunaService;
  let testJobId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-market-radar-test');
    adzunaService = new AdzunaService();
  });

  afterAll(async () => {
    // Clean up test data
    await Job.deleteMany({ source: 'adzuna' });
    await RawJob.deleteMany({ source: 'adzuna' });
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await Job.deleteMany({ source: 'adzuna' });
    await RawJob.deleteMany({ source: 'adzuna' });
  });

  describe('API Configuration', () => {
    it('should have correct API credentials', () => {
      expect(adzunaService.appId).toBe('61f7a880');
      expect(adzunaService.appKey).toBe('ce3260610c8e57a7cc1a633998f2a7dd');
      expect(adzunaService.country).toBe('in');
      expect(adzunaService.baseUrl).toBe('https://api.adzuna.com/v1/api/jobs');
    });

    it('should have rate limiting configured', () => {
      expect(adzunaService.rateLimitDelay).toBe(1000);
    });
  });

  describe('Job Fetching', () => {
    it('should fetch jobs from Adzuna API', async () => {
      const jobs = await adzunaService.fetchJobs({
        what: 'software developer',
        where: 'Bangalore',
        results_per_page: 5
      });

      expect(jobs).toBeDefined();
      expect(jobs.results).toBeDefined();
      expect(Array.isArray(jobs.results)).toBe(true);
      expect(jobs.count).toBeGreaterThan(0);
    }, 10000);

    it('should handle API errors gracefully', async () => {
      // Test with invalid credentials
      const originalAppId = adzunaService.appId;
      adzunaService.appId = 'invalid_id';
      
      await expect(adzunaService.fetchJobs({
        what: 'test',
        where: 'test'
      })).rejects.toThrow();
      
      // Restore original credentials
      adzunaService.appId = originalAppId;
    }, 10000);

    it('should respect rate limiting', async () => {
      const startTime = Date.now();
      
      await adzunaService.fetchJobs({ what: 'test1', where: 'test1' });
      await adzunaService.fetchJobs({ what: 'test2', where: 'test2' });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should take at least 1 second due to rate limiting
      expect(duration).toBeGreaterThanOrEqual(1000);
    }, 15000);
  });

  describe('Job Normalization', () => {
    it('should normalize Adzuna job data correctly', () => {
      const mockAdzunaJob = {
        title: 'Senior React Developer',
        company: { display_name: 'Tech Corp' },
        location: { display_name: 'Bangalore, India' },
        description: 'Looking for a React developer with Node.js experience',
        salary_min: 800000,
        salary_max: 1200000,
        created: '2024-01-01T00:00:00Z',
        redirect_url: 'https://example.com/job/123',
        id: '12345'
      };

      const normalized = adzunaService.normalizeJob(mockAdzunaJob);

      expect(normalized).toBeDefined();
      expect(normalized.title).toBe('Senior React Developer');
      expect(normalized.company).toBe('Tech Corp');
      expect(normalized.locations).toBeDefined();
      expect(normalized.locations[0].districtCode).toBe('KA01');
      expect(normalized.skills).toBeDefined();
      expect(normalized.skills.length).toBeGreaterThan(0);
      expect(normalized.skills.some(s => s.skillId === 'react')).toBe(true);
      expect(normalized.salary).toBeDefined();
      expect(normalized.salary.min).toBe(800000);
      expect(normalized.salary.max).toBe(1200000);
      expect(normalized.employmentType).toBe('full-time');
      expect(normalized.source).toBe('adzuna');
    });

    it('should extract skills correctly', () => {
      const skills = adzunaService.extractSkills(
        'Senior React Developer with Node.js and MongoDB experience',
        'We need someone with JavaScript, TypeScript, and AWS knowledge'
      );

      expect(skills).toContain('react');
      expect(skills).toContain('node.js');
      expect(skills).toContain('mongodb');
      expect(skills).toContain('javascript');
      expect(skills).toContain('typescript');
      expect(skills).toContain('aws');
    });

    it('should map locations to district codes', () => {
      const testCases = [
        { location: 'Bangalore, India', expected: 'KA01' },
        { location: 'Mumbai, Maharashtra, India', expected: 'MH01' },
        { location: 'Delhi, India', expected: 'DL01' },
        { location: 'Pune, Maharashtra, India', expected: 'MH02' },
        { location: 'Hyderabad, Telangana, India', expected: 'TG01' },
        { location: 'Chennai, Tamil Nadu, India', expected: 'TN01' }
      ];

      testCases.forEach(({ location, expected }) => {
        const districtCode = adzunaService.extractDistrictCode(location);
        expect(districtCode).toBe(expected);
      });
    });

    it('should determine employment type correctly', () => {
      const testCases = [
        { job: { title: 'Software Developer' }, expected: 'full-time' },
        { job: { title: 'Intern Developer' }, expected: 'internship' },
        { job: { title: 'Contract Developer' }, expected: 'contract' },
        { job: { title: 'Part-time Developer' }, expected: 'part-time' },
        { job: { title: 'Freelance Developer' }, expected: 'freelance' }
      ];

      testCases.forEach(({ job, expected }) => {
        const employmentType = adzunaService.determineEmploymentType(job);
        expect(employmentType).toBe(expected);
      });
    });
  });

  describe('Database Operations', () => {
    it('should save jobs to database', async () => {
      const mockJobs = [
        {
          title: 'Test Developer',
          company: 'Test Corp',
          description: 'Test description',
          locations: [{ districtCode: 'KA01', city: 'Bangalore' }],
          skills: [{ skillId: 'javascript', confidence: 0.8 }],
          salary: { min: 500000, max: 800000, currency: 'INR', period: 'yearly' },
          employmentType: 'full-time',
          postedAt: new Date(),
          source: 'adzuna',
          sourceUrl: 'https://test.com/job1',
          externalId: 'test1'
        }
      ];

      const savedJobs = await adzunaService.saveJobs(mockJobs);

      expect(savedJobs).toBeDefined();
      expect(savedJobs.length).toBe(1);
      expect(savedJobs[0].title).toBe('Test Developer');
      expect(savedJobs[0]._id).toBeDefined();

      // Verify job was saved in database
      const dbJob = await Job.findOne({ title: 'Test Developer' });
      expect(dbJob).toBeDefined();
      expect(dbJob.source).toBe('adzuna');
    });

    it('should prevent duplicate jobs', async () => {
      const mockJob = {
        title: 'Duplicate Test Job',
        company: 'Test Corp',
        description: 'Test description',
        locations: [{ districtCode: 'KA01', city: 'Bangalore' }],
        skills: [{ skillId: 'javascript', confidence: 0.8 }],
        salary: { min: 500000, max: 800000, currency: 'INR', period: 'yearly' },
        employmentType: 'full-time',
        postedAt: new Date(),
        source: 'adzuna',
        sourceUrl: 'https://test.com/duplicate',
        externalId: 'duplicate1'
      };

      // Save first time
      const firstSave = await adzunaService.saveJobs([mockJob]);
      expect(firstSave.length).toBe(1);

      // Try to save again
      const secondSave = await adzunaService.saveJobs([mockJob]);
      expect(secondSave.length).toBe(0); // Should not save duplicate

      // Verify only one job in database
      const count = await Job.countDocuments({ title: 'Duplicate Test Job' });
      expect(count).toBe(1);
    });
  });

  describe('End-to-End Integration', () => {
    it('should fetch and save jobs from API to database', async () => {
      const savedJobs = await adzunaService.fetchAndSaveJobs(
        'javascript developer',
        'Mumbai',
        1 // Only 1 page for testing
      );

      expect(savedJobs).toBeDefined();
      expect(Array.isArray(savedJobs)).toBe(true);

      if (savedJobs.length > 0) {
        const job = savedJobs[0];
        expect(job.title).toBeDefined();
        expect(job.company).toBeDefined();
        expect(job.source).toBe('adzuna');
        expect(job._id).toBeDefined();

        // Verify raw job was also saved
        const rawJob = await RawJob.findOne({ source: 'adzuna' });
        expect(rawJob).toBeDefined();
        expect(rawJob.processed).toBe(true);
      }
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should handle invalid job data gracefully', () => {
      const invalidJob = {
        title: null,
        company: null,
        description: null
      };

      const normalized = adzunaService.normalizeJob(invalidJob);
      expect(normalized).toBeNull();
    });

    it('should handle empty search results', async () => {
      const jobs = await adzunaService.fetchJobs({
        what: 'nonexistentjobtitle12345',
        where: 'nonexistentcity12345'
      });

      expect(jobs).toBeDefined();
      expect(jobs.results).toBeDefined();
      expect(Array.isArray(jobs.results)).toBe(true);
      expect(jobs.results.length).toBe(0);
    }, 10000);
  });
});
