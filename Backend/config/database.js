const mongoose = require('mongoose');

const connectToDatabase = async () => {
  const url = process.env.CONNECT_STRING;

  if (!url) {
    console.error('Error: MongoDB connection string is missing in environment variables.');
    return; // Don't exit process in Vercel
  }

  try {
    // Check if already connected to avoid multiple connections in serverless
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    await mongoose.connect(url);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Don't exit process in Vercel
  }
};

module.exports = connectToDatabase;
