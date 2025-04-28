const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const facultyRoutes = require('./facultyRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const newsRoutes = require('./newsRoutes');
const uploadRoutes = require('./uploadRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const clubRoutes = require('./clubRoutes');
const eventRoutes = require('./eventRoutes');
const presentationRoutes = require('./presentationRoutes');

// Register routes
router.use('/auth', authRoutes);
router.use('/faculty', facultyRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/news', newsRoutes);
router.use('/uploads', uploadRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/clubs', clubRoutes);
router.use('/events', eventRoutes);
router.use('/presentations', presentationRoutes);

module.exports = router;