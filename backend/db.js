const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Read the connection URI from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1); // Stop the server application if connection fails
  }
};

module.exports = connectDB;