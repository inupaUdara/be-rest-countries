const express = require('express');
// const serverless = require('serverless-http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { PORT } = require('./src/config/env.js');

const authRouter = require('./src/routes/auth.routes.js');
const connectToDatabase = require('./src/config/mongodb.js');
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

app.use('/api/v1/auth', authRouter);

app.use(errorMiddleware);

// Test route to confirm server is running
app.get('/api/test', (req, res) => res.json({ message: 'Server is running' }));

// Connect to MongoDB without blocking
(async () => {
  try {
    await connectToDatabase();
  } catch (err) {
    console.error('Failed to connect to MongoDB during startup:', err.message);
  }
})();

// Export for Vercel serverless
// module.exports = serverless(app);

// Local server for development
app.listen(PORT || 5001, () => {
  console.log(`Server is running on port ${PORT || 5001}`);
});

module.exports = app;