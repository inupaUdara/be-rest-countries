const express = require('express');
const serverless = require('serverless-http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { PORT } = require('./src/config/env.js');

const authRouter = require('./src/routes/auth.routes.js');
const connectToDatabase = require('./src/config/mongodb.js');
const errorMiddleware = require('./src/middlewares/error.middleware.js');

const app = express();

// CORS configuration - UPDATED
const corsOptions = {
  origin: 'https://fe-rest-countries.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware first, before any other middleware
app.use(cors(corsOptions));

// Handle OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test route to confirm server is running
app.get('/api/test', (req, res) => res.json({ message: 'Server is running' }));

// Connect to MongoDB before handling routes
let dbConnected = false;
app.use(async (req, res, next) => {
  // Skip DB connection for OPTIONS requests
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  if (!dbConnected) {
    try {
      dbConnected = await connectToDatabase();
      if (!dbConnected) {
        return res.status(500).json({ error: 'Database connection failed' });
      }
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

app.use('/api/v1/auth', authRouter);

app.use(errorMiddleware);

// Determine if we're running on Vercel or locally
const isVercel = process.env.VERCEL === '1';

if (isVercel) {
  // Export for Vercel serverless
  module.exports = serverless(app, {
    provider: {
      timeout: 10 // in seconds
    }
  });
} else {
  // Start local server
  const server = app.listen(PORT || 5001, () => {
    console.log(`Server is running on port ${PORT || 5001}`);
  });
  
  module.exports = app;
}