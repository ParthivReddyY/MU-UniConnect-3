const express = require('express');
const router = express.Router();

// ...existing code...

const feedbackRoutes = require('./feedbackRoutes');
const clubRoutes = require('./clubRoutes');
const eventRoutes = require('./eventRoutes');
const newsRoutes = require('./newsRoutes');
const sitemapRoutes = require('./sitemapRoutes');
const calendarEventRoutes = require('./calendarEventRoutes'); // Add this line

// Register feedback routes - mount at /feedback not /api/feedback
// This will result in /api/feedback when mounted in server.js
router.use('/feedback', feedbackRoutes);

// Register club routes
router.use('/clubs', clubRoutes);

// Register event routes
router.use('/events', eventRoutes);

// Register news routes
router.use('/news', newsRoutes);

// Register sitemap routes - will be accessible at /api/sitemap.xml
router.use('/', sitemapRoutes);

// Register calendar event routes
router.use('/calendar-events', calendarEventRoutes); // Add this line

// Make sure auth routes are properly mounted
const authRoutes = require('./authRoutes');
router.use('/auth', authRoutes);  // This ensures /api/auth prefix works

// ...existing code...

module.exports = router;