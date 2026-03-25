const mongoose = require('mongoose');

const connectToDatabase = async () => {
  const url = process.env.CONNECT_STRING;

  if (!url) {
    console.error('Error: MongoDB connection string is missing in environment variables.');
    return;
  }

  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    await mongoose.connect(url);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

module.exports = connectToDatabase;
