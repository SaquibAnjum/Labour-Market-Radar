import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set environment variables if not already set
process.env.ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '61f7a880';
process.env.ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || 'ce3260610c8e57a7cc1a633998f2a7dd';
process.env.ADZUNA_COUNTRY = process.env.ADZUNA_COUNTRY || 'in';
process.env.ADZUNA_BASE_URL = process.env.ADZUNA_BASE_URL || 'https://api.adzuna.com/v1/api/jobs';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/labour-market-radar';
process.env.PORT = process.env.PORT || '5000';

console.log('Environment variables loaded:');
console.log('ADZUNA_APP_ID:', process.env.ADZUNA_APP_ID);
console.log('ADZUNA_APP_KEY:', process.env.ADZUNA_APP_KEY ? 'SET' : 'NOT SET');
console.log('ADZUNA_COUNTRY:', process.env.ADZUNA_COUNTRY);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

// Import and start the server
import('./index.js');
