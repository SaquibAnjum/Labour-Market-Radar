import Agenda from 'agenda';
import WebScraper from './scraper.js';
import JobNormalizer from './normalizer.js';
import TrendAggregator from './aggregator.js';
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
  }

  scheduleJobs() {
    this.agenda.every('4 hours', 'scrape source', { source: 'indeed', searchTerm: 'Software Developer', location: 'Bangalore' });
    this.agenda.every('4 hours', 'scrape source', { source: 'indeed', searchTerm: 'Data Analyst', location: 'Delhi' });
    
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
}

export default JobScheduler;