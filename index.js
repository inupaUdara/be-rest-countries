const serverless = require('serverless-http');
const app = require('./app');

// Export only the serverless handler for Vercel
module.exports = serverless(app, {
  binary: ['image/png', 'image/jpeg'],
  provider: {
    timeout: 10 // in seconds, adjust based on your plan
  }
});