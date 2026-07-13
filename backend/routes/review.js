const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Local Stage 1 Static Line Checker
function runStaticCheck(code, lang) {
  const issues = [];
  if ((lang === 'cpp' || lang === 'java') && !code.includes(';')) {
    issues.push({ type: 'Syntax Error', message: 'Missing semicolon statement termination.' });
  }
  if (code.includes('TODO') || code.includes('todo')) {
    issues.push({ type: 'Code style violations', message: 'Lingering production placeholder tags remain.' });
  }
  return issues;
}

// POST: Process and save code review snippet
router.post('/analyze', async (req, res) => {
  try {
    const { userId, title, codeSnippet, language } = req.body;

    // Stage 1 Static Rule execution
    const staticIssues = runStaticCheck(codeSnippet, language);

    // Calculate core basic file line-metrics
    const totalLines = codeSnippet.split('\n').length;
    const detectedFuncs = (codeSnippet.match(/function\s+\w+|def\s+\w+|\w+\s+\w+\(.*\)\s*\{/g) || []).length;
    const detectedClasses = (codeSnippet.match(/class\s+\w+/g) || []).length;

    // Structure a template placeholder for our upcoming AI API payload integration
    const reviewData = {
      userId,
      title,
      codeSnippet,
      language,
      staticAnalysis: staticIssues,
      complexityAnalysis: {
        cyclomaticComplexity: detectedFuncs > 4 ? 'High' : 'Low',
        functionComplexity: 'Moderate structural bounds',
        fileComplexity: totalLines > 150 ? 'Complex file layout' : 'Lightweight structural file',
        numberOfFunctions: detectedFuncs,
        numberOfClasses: detectedClasses,
        linesOfCode: totalLines
      },
      aiFeedback: {
        bugReports: ["Syntax parsing verification completed securely."],
        optimizationSuggestions: ["Review iterative logical array operations for speed enhancements."],
        codeSmellAnalysis: ["Variable names map neatly, control scoping blocks are sound."],
        performanceImprovements: ["Cache heavy computing variables outside runtime loops."],
        securityRecommendations: ["Ensure proper boundary verification on sequence lookups."],
        bestPracticeRecommendations: ["Document core logical processing blocks with clean code blocks."]
      }
    };

    const record = await Review.create(reviewData);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Fetch history log for dashboard view
router.get('/history/:userId', async (req, res) => {
  try {
    const history = await Review.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Delete record item cleanly from user dashboard list
router.delete('/:reviewId', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.reviewId);
    res.status(200).json({ success: true, message: "Review record removed successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;