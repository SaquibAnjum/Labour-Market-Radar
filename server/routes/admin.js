import express from 'express';
import { Job, RawJob } from '../models/Job.js';

const router = express.Router();

router.get('/stats', async (req, res, next) => {
  try {
    const [totalRawJobs, totalJobs, uniqueJobs, pendingJobs, errorJobs] = await Promise.all([
        RawJob.countDocuments(),
        Job.countDocuments(),
        Job.countDocuments({ duplicateOf: { $exists: false } }),
        RawJob.countDocuments({ parseStatus: 'pending' }),
        RawJob.countDocuments({ parseStatus: 'error' }),
    ]);
    res.json({ totalRawJobs, totalJobs, uniqueJobs, pendingJobs, errorJobs });
  } catch (error) { next(error) }
});

router.post('/scrape/trigger', async (req, res, next) => {
    try {
        const { source, searchTerm, location } = req.body;
        if (!source || !searchTerm || !location) {
            return res.status(400).json({ error: 'Source, searchTerm, and location are required.' });
        }
        await req.scheduler.triggerScraping(source, searchTerm, location);
        res.json({ message: `Scraping triggered for ${searchTerm} in ${location}.` });
    } catch (error) { next(error) }
});

router.post('/aggregation/trigger', async (req, res, next) => {
    try {
        await req.scheduler.triggerAggregation();
        res.json({ message: 'Aggregation triggered successfully.' });
    } catch (error) { next(error) }
});

export default router;