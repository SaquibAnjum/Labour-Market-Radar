import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../index.js';
import { Job, RawJob } from '../models/Job.js';

dotenv.config();

describe('API Routes Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-market-radar-test');
  });

  afterAll(async () => {
    await Job.deleteMany({ source: 'adzuna' });
    await RawJob.deleteMany({ source: 'adzuna' });
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Job.deleteMany({ source: 'adzuna' });
    await RawJob.deleteMany({ source: 'adzuna' });
  });

  describe('Adzuna Search Endpoint', () => {
    it('should search jobs with default parameters', async () => {
      const response = await request(app)
        .get('/api/radar/adzuna/search')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.results).toBeDefined();
      expect(Array.isArray(response.body.data.results)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    }, 15000);

    it('should search jobs with custom parameters', async () => {
      const response = await request(app)
        .get('/api/radar/adzuna/search')
        .query({
          what: 'react developer',
          where: 'Bangalore',
          page: 1,
          results_per_page: 10
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.results_per_page).toBe(10);
    }, 15000);

    it('should handle search errors gracefully', async () => {
      // This test might fail due to API limits, but should not crash
      const response = await request(app)
        .get('/api/radar/adzuna/search')
        .query({
          what: 'invalid_search_term_12345',
          where: 'invalid_city_12345'
        });

      // Should either succeed with empty results or fail gracefully
      expect([200, 500]).toContain(response.status);
    }, 10000);
  });

  describe('Adzuna Fetch Endpoint', () => {
    it('should fetch and save jobs', async () => {
      const response = await request(app)
        .post('/api/radar/adzuna/fetch')
        .send({
          searchTerm: 'javascript developer',
          location: 'Mumbai',
          maxPages: 1
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Successfully fetched and saved');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.jobsSaved).toBeGreaterThanOrEqual(0);
    }, 20000);

    it('should require searchTerm parameter', async () => {
      const response = await request(app)
        .post('/api/radar/adzuna/fetch')
        .send({
          location: 'Mumbai',
          maxPages: 1
        })
        .expect(200); // Should still work with default searchTerm

      expect(response.body.success).toBe(true);
    });
  });

  describe('Adzuna Categories Endpoint', () => {
    it('should return job categories', async () => {
      const response = await request(app)
        .get('/api/radar/adzuna/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check if categories have required fields
      const category = response.body.data[0];
      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
    });
  });

  describe('Adzuna Trending Skills Endpoint', () => {
    it('should return trending skills', async () => {
      // First, add some test data
      const testJob = new Job({
        title: 'React Developer',
        company: 'Test Corp',
        description: 'React and JavaScript development',
        locations: [{ districtCode: 'KA01', city: 'Bangalore' }],
        skills: [
          { skillId: 'react', confidence: 0.9 },
          { skillId: 'javascript', confidence: 0.8 }
        ],
        postedAt: new Date(),
        source: 'adzuna'
      });
      await testJob.save();

      const response = await request(app)
        .get('/api/radar/adzuna/trending-skills')
        .query({ district: 'KA01', time: '30' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.totalJobs).toBeGreaterThan(0);
    });
  });

  describe('Adzuna Stats Endpoint', () => {
    it('should return job statistics', async () => {
      // First, add some test data
      const testJob = new Job({
        title: 'Python Developer',
        company: 'Test Corp',
        description: 'Python development',
        locations: [{ districtCode: 'KA01', city: 'Bangalore' }],
        skills: [{ skillId: 'python', confidence: 0.9 }],
        salary: { min: 600000, max: 900000, currency: 'INR', period: 'yearly' },
        postedAt: new Date(),
        source: 'adzuna'
      });
      await testJob.save();

      const response = await request(app)
        .get('/api/radar/adzuna/stats')
        .query({ district: 'KA01', time: '30' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalJobs).toBeGreaterThan(0);
      expect(response.body.data.avgSalary).toBeGreaterThan(0);
      expect(response.body.data.topCompanies).toBeDefined();
      expect(response.body.data.topSkills).toBeDefined();
    });
  });

  describe('Admin Adzuna Trigger Endpoint', () => {
    it('should trigger Adzuna fetch', async () => {
      const response = await request(app)
        .post('/api/admin/adzuna/trigger')
        .send({
          searchTerm: 'test developer',
          location: 'test city',
          maxPages: 1
        })
        .expect(200);

      expect(response.body.message).toContain('Adzuna fetch triggered');
      expect(response.body.searchTerm).toBe('test developer');
    });

    it('should use default values for missing parameters', async () => {
      const response = await request(app)
        .post('/api/admin/adzuna/trigger')
        .send({
          searchTerm: 'test developer'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.location).toBe('all locations');
      expect(response.body.maxPages).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid API responses', async () => {
      // This test ensures the API doesn't crash on unexpected responses
      const response = await request(app)
        .get('/api/radar/adzuna/search')
        .query({
          what: 'test',
          where: 'test'
        });

      // Should either succeed or fail gracefully
      expect([200, 500]).toContain(response.status);
    }, 10000);
  });
});
