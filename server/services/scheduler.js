import Agenda from 'agenda';
import WebScraper from './scraper.js';
import JobNormalizer from './normalizer.js';
import TrendAggregator from './aggregator.js';
import AdzunaService from './adzuna.js';
import { RawJob } from '../models/Job.js';

// This file sets up and schedules all the background jobs.
class JobScheduler {
  constructor() {
    this.agenda = new Agenda({
      db: { address: process.env.MONGODB_URI, collection: 'agendaJobs' },
      processEvery: '1 minute',
    });
    this.scraper = new WebScraper();
    this.normalizer = new JobNormalizer();
    this.aggregator = new TrendAggregator();
    this.adzunaService = new AdzunaService();
  }

  async start() {
    this.defineJobs();
    await this.agenda.start();
    this.scheduleJobs();
    console.log('Job scheduler started and jobs scheduled.');
  }

  async stop() {
    await this.scraper.close();
    await this.agenda.stop();
    console.log('Job scheduler stopped.');
  }

  defineJobs() {
    this.agenda.define('scrape source', async (job) => {
      const { source, searchTerm, location } = job.attrs.data;
      console.log(`Starting scrape job for ${searchTerm} in ${location} from ${source}`);
      
      const searchUrl = this.generateSearchUrl(source, searchTerm, location);
      const jobLinks = await this.scraper.getJobLinksFromSearchPage(searchUrl, source);
      
      for (const link of jobLinks) {
        await this.scraper.getJobDetailsAndSave(link, source);
      }
    });

    this.agenda.define('normalize raw jobs', async () => {
      console.log('Starting normalization job...');
      const pendingJobs = await RawJob.find({ parseStatus: 'pending' }).limit(50);
      for (const rawJob of pendingJobs) {
        await this.normalizer.normalizeAndSave(rawJob);
      }
      console.log(`Attempted to normalize ${pendingJobs.length} jobs.`);
    });
    
    this.agenda.define('aggregate trends', async () => {
      console.log('Starting trend aggregation job...');
      await this.aggregator.recomputeAll();
    });

    this.agenda.define('fetch adzuna jobs', async (job) => {
      const { searchTerm, location, maxPages } = job.attrs.data;
      console.log(`Starting Adzuna fetch job for ${searchTerm} in ${location}`);
      
      try {
        const savedJobs = await this.adzunaService.fetchAndSaveJobs(
          searchTerm, 
          location, 
          maxPages || 3
        );
        console.log(`Successfully saved ${savedJobs.length} jobs from Adzuna`);
      } catch (error) {
        console.error('Adzuna fetch job failed:', error);
      }
    });
  }

  scheduleJobs() {
    // Web scraping jobs
    this.agenda.every('4 hours', 'scrape source', { source: 'indeed', searchTerm: 'Software Developer', location: 'Bangalore' });
    this.agenda.every('4 hours', 'scrape source', { source: 'indeed', searchTerm: 'Data Analyst', location: 'Delhi' });
    
    // Adzuna API jobs - fetch popular tech skills
    this.agenda.every('2 hours', 'fetch adzuna jobs', { searchTerm: 'software developer', location: 'Bangalore', maxPages: 2 });
    this.agenda.every('2 hours', 'fetch adzuna jobs', { searchTerm: 'data scientist', location: 'Mumbai', maxPages: 2 });
    this.agenda.every('2 hours', 'fetch adzuna jobs', { searchTerm: 'react developer', location: 'Delhi', maxPages: 2 });
    this.agenda.every('2 hours', 'fetch adzuna jobs', { searchTerm: 'python developer', location: 'Pune', maxPages: 2 });
    this.agenda.every('2 hours', 'fetch adzuna jobs', { searchTerm: 'node.js developer', location: 'Hyderabad', maxPages: 2 });
    this.agenda.every('2 hours', 'fetch adzuna jobs', { searchTerm: 'machine learning engineer', location: 'Chennai', maxPages: 2 });
    
    // Data processing jobs
    this.agenda.every('5 minutes', 'normalize raw jobs');
    this.agenda.every('12 hours', 'aggregate trends');
    
    console.log('Recurring jobs have been scheduled.');
  }
  
  generateSearchUrl(source, searchTerm, location) {
    const term = encodeURIComponent(searchTerm);
    const loc = encodeURIComponent(location);
    if (source === 'indeed') {
      return `https://in.indeed.com/jobs?q=${term}&l=${loc}`;
    }
    return '';
  }

  // --- Manual Trigger Functions for Admin Panel ---
  async triggerScraping(source, searchTerm, location) {
    console.log(`Manually triggering scrape for ${searchTerm}`);
    await this.agenda.now('scrape source', { source, searchTerm, location });
  }

  async triggerAggregation() {
    console.log('Manually triggering aggregation...');
    await this.agenda.now('aggregate trends');
  }

  async triggerAdzunaFetch(searchTerm, location, maxPages = 3) {
    console.log(`Manually triggering Adzuna fetch for ${searchTerm} in ${location}`);
    await this.agenda.now('fetch adzuna jobs', { searchTerm, location, maxPages });
  }
}

export default JobScheduler;