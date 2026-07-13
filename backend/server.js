// Load environment variables right at the start
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Import Routers
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');

const app = express();

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors()); // Permits connection from your Vite React frontend
app.use(express.json()); // Allows parsing JSON bodies in requests

// Attach Routes to Base API Paths
app.use('/api/auth', authRoutes);
app.use('/api/review', reviewRoutes);

// Base Diagnostic Route
app.get('/', (req, res) => {
  res.send('🚀 AI Code Reviewer Backend Engine is Active');
});

// Start listening on port 8080 (as specified in your .env)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`⚡ Server running in development mode on port ${PORT}`);
});