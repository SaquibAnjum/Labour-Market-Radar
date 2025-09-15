import { chromium } from 'playwright';
import { RawJob } from '../models/Job.js';

// This is the most important file for fetching real trends.
// It uses Playwright to act like a real user in a browser.
class WebScraper {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    if (this.browser) return;
    console.log('Launching browser...');
    this.browser = await chromium.launch({
      headless: true, // Set to false to see the browser UI
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('Browser closed.');
    }
  }

  // Step 1: Visit a search page and get all the individual job links
  async getJobLinksFromSearchPage(searchUrl, source) {
    await this.initialize();
    const page = await this.browser.newPage();
    console.log(`Navigating to search page: ${searchUrl}`);
    
    try {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000); // Wait for dynamic content

      let jobLinks = [];
      if (source === 'indeed') {
        jobLinks = await page.evaluate(() => 
          Array.from(document.querySelectorAll('a[id^="job-"]'))
               .map(link => link.href)
        );
      }
      // Add selectors for other sources like 'naukri' here

      console.log(`Found ${jobLinks.length} job links from ${source}.`);
      return [...new Set(jobLinks)];
    } catch (error) {
      console.error(`Failed to scrape job links from ${searchUrl}:`, error);
      return [];
    } finally {
      await page.close();
    }
  }

  // Step 2: Visit an individual job link, get its HTML, and save it
  async getJobDetailsAndSave(jobUrl, source) {
    const existing = await RawJob.findOne({ fetchUrl: jobUrl });
    if (existing) {
      console.log(`Skipping already fetched URL: ${jobUrl}`);
      return null;
    }
      
    await this.initialize();
    const page = await this.browser.newPage();
    console.log(`Fetching details from: ${jobUrl}`);
    
    try {
      await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);
      
      const htmlContent = await page.content();
      
      const rawJob = new RawJob({
        source,
        fetchUrl: jobUrl,
        htmlContent,
      });
      await rawJob.save();
      console.log(`Saved raw job from ${jobUrl}`);
      return rawJob;
    } catch (error) {
      console.error(`Failed to fetch details from ${jobUrl}:`, error);
      return null;
    } finally {
      await page.close();
    }
  }
}

export default WebScraper;