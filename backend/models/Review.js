const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true // e.g., "bubble_sort.cpp" or "Snippet Check"
  },
  codeSnippet: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  // Stage 1: Static Engine Array
  staticAnalysis: [{
    type: { type: String }, // e.g., "Syntax Error", "Warning", "Style"
    message: String
  }],
  // Stage 2: AI Structural Review Data
  complexityAnalysis: {
    cyclomaticComplexity: String,
    functionComplexity: String,
    fileComplexity: String,
    numberOfFunctions: Number,
    numberOfClasses: Number,
    linesOfCode: Number
  },
  aiFeedback: {
    bugReports: [String],
    optimizationSuggestions: [String],
    codeSmellAnalysis: [String],
    performanceImprovements: [String],
    securityRecommendations: [String],
    bestPracticeRecommendations: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);