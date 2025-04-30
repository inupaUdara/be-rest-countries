const express = require('express');
const serverless = require('serverless-http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { PORT } = require('./src/config/env.js');

const authRouter = require('./src/routes/auth.routes.js');
const connectToDatabase = require('./src/config/mongodb.js');
const errorMiddleware = require('./src/middlewares/error.middleware.js');

const app = express();

app.use(cors({
  origin: 'https://fe-rest-countries.vercel.app/', 
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);

app.use(errorMiddleware);

// Connect to MongoDB during initialization
connectToDatabase().catch((err) => console.error('MongoDB connection failed:', err));

// Export for Vercel serverless
module.exports.handler = serverless(app);

// Optional: Local server for development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT || 5000, () => {
        console.log(`Server is running on port ${PORT || 5000}`);
    });
}