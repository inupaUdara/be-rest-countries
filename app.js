const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { PORT } = require('./src/config/env.js');

const authRouter = require('./src/routes/auth.routes.js');
const errorMiddleware = require('./src/middlewares/error.middleware.js');

const app = express();

// Configure CORS
const corsOptions = {
  origin: 'https://fe-rest-countries.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

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

// Connect to MongoDB for each request instead of at startup
app.use(async (req, res, next) => {
  const connectToDatabase = require('./src/config/mongodb.js');
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/api/v1/auth', authRouter);

app.use(errorMiddleware);

module.exports = app;