const express = require('express');
const serverless = require('serverless-http');
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

// Log requests
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

// Connect to MongoDB without crashing
connectToDatabase()
  .then(() => console.log('MongoDB connection established'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err.message));

// Export for Vercel serverless (use default export)
module.exports = serverless(app);

// Local server (for development only)
app.listen(PORT || 5000, () => {
  console.log(`Server is running on port ${PORT || 5000}`);
});