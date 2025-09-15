import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isConnected = dbState === 1;

  const healthCheck = {
    uptime: process.uptime(),
    message: isConnected ? 'OK' : 'Database not connected',
    timestamp: Date.now(),
    database: mongoose.STATES[dbState],
  };
  
  res.status(isConnected ? 200 : 503).json(healthCheck);
});

export default router;