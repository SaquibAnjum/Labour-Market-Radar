import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config({ path: 'test.env' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-market-radar-test';

// Increase timeout for API calls
jest.setTimeout(30000);
