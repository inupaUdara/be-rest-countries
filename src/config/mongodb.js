const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env.js');

// Track connection status to avoid multiple connections
let isConnected = false;

const connectToDatabase = async () => {
  // If already connected, reuse the connection
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return true;
  }

  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    // Optimize connection options for serverless
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 10000, // Close sockets after 10 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });
    
    isConnected = !!connection.connections[0].readyState;
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    isConnected = false;
    return false;
  }
};

module.exports = connectToDatabase;