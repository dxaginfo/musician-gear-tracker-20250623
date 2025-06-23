require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { createClient } = require('redis');

const { setupRoutes } = require('./routes');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musician-gear-tracker')
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize Redis (if available)
let redisClient;
if (process.env.REDIS_URI) {
  redisClient = createClient({
    url: process.env.REDIS_URI
  });
  
  redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
  });
  
  redisClient.connect().then(() => {
    logger.info('Connected to Redis');
  }).catch((err) => {
    logger.error('Failed to connect to Redis:', err);
  });

  // Make Redis client available globally
  app.set('redisClient', redisClient);
}

// API routes
setupRoutes(app);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
  
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
  
  process.exit(0);
});

module.exports = app;