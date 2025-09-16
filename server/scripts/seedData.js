import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DataSeeder from '../services/DataSeeder.js';

// Load environment variables
dotenv.config({ path: '../.env' });

async function seedData() {
  try {
    console.log('🚀 Starting Labour Market Radar Data Seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Initialize data seeder
    const seeder = new DataSeeder();
    
    // Run the seeding process
    await seeder.seedInitialData();
    
    console.log('🎉 Data seeding completed successfully!');
    console.log('📊 Your dashboard should now show real data from Adzuna API');
    
  } catch (error) {
    console.error('❌ Error during data seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding
seedData();