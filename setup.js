const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Labour Market Radar...\n');

// Check if Node.js version is compatible
const checkNodeVersion = () => {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    console.log('❌ Node.js version 16 or higher is required');
    console.log(`Current version: ${nodeVersion}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version: ${nodeVersion}`);
};

// Check if required services are running
const checkServices = () => {
  console.log('🔍 Checking required services...');
  
  // Check MongoDB
  try {
    execSync('mongod --version', { stdio: 'pipe' });
    console.log('✅ MongoDB is available');
  } catch (error) {
    console.log('⚠️  MongoDB not found. Please install MongoDB');
  }
  
  // Check Redis
  try {
    execSync('redis-cli --version', { stdio: 'pipe' });
    console.log('✅ Redis is available');
  } catch (error) {
    console.log('⚠️  Redis not found. Please install Redis');
  }
};

// Install dependencies
const installDependencies = () => {
  console.log('📦 Installing server dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Server dependencies installed');
  } catch (error) {
    console.log('❌ Failed to install server dependencies');
    process.exit(1);
  }
  
  console.log('📦 Installing client dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
    console.log('✅ Client dependencies installed');
  } catch (error) {
    console.log('❌ Failed to install client dependencies');
    process.exit(1);
  }
};

// Create .env file if it doesn't exist
const createEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, 'env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from template');
    } else {
      const envContent = `# Database
MONGODB_URI=mongodb://localhost:27017/labour-market-radar
REDIS_URL=redis://localhost:6379

# Server
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Scraping Configuration
SCRAPING_DELAY_MS=2000
MAX_CONCURRENT_SCRAPERS=3
`;
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Created .env file with default values');
    }
  } else {
    console.log('✅ .env file already exists');
  }
};

// Create necessary directories
const createDirectories = () => {
  const dirs = [
    'server/logs',
    'server/cache',
    'client/build'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

// Main setup function
const setup = async () => {
  try {
    checkNodeVersion();
    checkServices();
    createEnvFile();
    createDirectories();
    installDependencies();
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure MongoDB and Redis are running');
    console.log('2. Run: node start.js');
    console.log('3. Open http://localhost:3000 in your browser');
    console.log('\n📚 For more information, check the README.md file');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup
setup();
