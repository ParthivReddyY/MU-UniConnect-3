const express = require('express');
const router = express.Router();

// ...existing code...

const feedbackRoutes = require('./feedbackRoutes');


// Register feedback routes - mount at /feedback not /api/feedback
// This will result in /api/feedback when mounted in server.js
router.use('/feedback', feedbackRoutes);

// ...existing code...

module.exports = router;