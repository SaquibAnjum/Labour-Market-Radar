const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Labour Market Radar...\n');

// Check if MongoDB is running
const checkMongoDB = () => {
  return new Promise((resolve) => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-market-radar', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('✅ MongoDB connection successful');
      resolve(true);
    })
    .catch((err) => {
      console.log('❌ MongoDB connection failed:', err.message);
      console.log('Please make sure MongoDB is running on your system');
      resolve(false);
    });
  });
};

// Seed initial data
const seedData = async () => {
  try {
    console.log('🌱 Seeding initial data...');
    const { seedAll } = require('./server/scripts/seedData');
    await seedAll();
    console.log('✅ Data seeding completed');
  } catch (error) {
    console.log('⚠️  Data seeding failed:', error.message);
  }
};

// Start the application
const startApp = async () => {
  try {
    // Check MongoDB connection
    const mongoConnected = await checkMongoDB();
    if (!mongoConnected) {
      process.exit(1);
    }

    // Seed data
    await seedData();

    // Start the server
    console.log('🔧 Starting server...');
    const server = spawn('node', ['server/index.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Start the client after a short delay
    setTimeout(() => {
      console.log('🎨 Starting client...');
      const client = spawn('npm', ['start'], {
        stdio: 'inherit',
        cwd: path.join(process.cwd(), 'client')
      });

      // Handle process termination
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down...');
        server.kill();
        client.kill();
        process.exit(0);
      });
    }, 3000);

  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
};

// Load environment variables
require('dotenv').config();

// Start the application
startApp();
