const authRoutes = require('./auth.routes');
const equipmentRoutes = require('./equipment.routes');
const userRoutes = require('./user.routes');
const insuranceRoutes = require('./insurance.routes');
const bandRoutes = require('./band.routes');

/**
 * Initialize all routes
 * @param {Express} app - Express app
 */
const setupRoutes = (app) => {
  // API version prefix
  const API_PREFIX = '/api/v1';
  
  // Health check route
  app.get(`${API_PREFIX}/health`, (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });
  
  // Set up API routes
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/equipment`, equipmentRoutes);
  app.use(`${API_PREFIX}/users`, userRoutes);
  app.use(`${API_PREFIX}/insurance`, insuranceRoutes);
  app.use(`${API_PREFIX}/bands`, bandRoutes);
  
  // 404 handler for API routes
  app.use(`${API_PREFIX}/*`, (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: 'API endpoint not found',
        code: 'NOT_FOUND'
      }
    });
  });
};

module.exports = { setupRoutes };