const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const facultyRoutes = require('./facultyRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const presentationRoutes = require('./presentationRoutes');
const campusHighlightRoutes = require('./campusHighlightRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const clubRoutes = require('./clubRoutes');
const eventRoutes = require('./eventRoutes');
const newsRoutes = require('./newsRoutes');
const sitemapRoutes = require('./sitemapRoutes');
const announcementRoutes = require('./announcementRoutes');

// Register auth routes
router.use('/auth', authRoutes);

// Register faculty routes
router.use('/faculty', facultyRoutes);

// Register appointment routes
router.use('/appointments', appointmentRoutes);

// Register presentation routes
router.use('/presentations', presentationRoutes);

// Register campus highlight routes
router.use('/campus-highlights', campusHighlightRoutes);

// Register feedback routes
router.use('/feedback', feedbackRoutes);

// Register club routes
router.use('/clubs', clubRoutes);

// Register event routes
router.use('/events', eventRoutes);

// Register news routes
router.use('/news', newsRoutes);

// Register announcement routes
router.use('/announcements', announcementRoutes);

// Register sitemap routes - will be accessible at /api/sitemap.xml
router.use('/', sitemapRoutes);

module.exports = router;