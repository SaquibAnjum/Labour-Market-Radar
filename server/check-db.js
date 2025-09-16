import mongoose from 'mongoose';
import { Job } from './models/Job.js';

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/labour-market-radar');
    console.log('Connected to MongoDB');

    const jobCount = await Job.countDocuments();
    const adzunaJobs = await Job.countDocuments({ source: 'adzuna' });
    const skills = await Job.distinct('skills');
    const districts = await Job.distinct('districtCode');

    console.log('Total jobs:', jobCount);
    console.log('Adzuna jobs:', adzunaJobs);
    console.log('Unique skills count:', skills.length);
    console.log('Sample skills:', skills.slice(0, 10));
    console.log('Districts count:', districts.length);
    console.log('Sample districts:', districts.slice(0, 10));

    // Get some sample job data
    const sampleJobs = await Job.find({ source: 'adzuna' }).limit(3);
    console.log('\nSample Adzuna jobs:');
    sampleJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company} - ${job.districtCode}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkDatabase();
