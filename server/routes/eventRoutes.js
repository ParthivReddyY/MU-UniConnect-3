const express = require('express');
const router = express.Router();
const { getUniversityEvents, updateUniversityEvents, createUniversityEvent } = require('../controllers/eventController');
const { authenticateUser, isAdmin, isClubHeadOrAdmin } = require('../middleware/auth');

// University events routes
router.get('/university', getUniversityEvents);
// Apply authentication middleware for update and create operations
router.put('/university', authenticateUser, isClubHeadOrAdmin, updateUniversityEvents);
router.post('/university', authenticateUser, isClubHeadOrAdmin, createUniversityEvent);

module.exports = router;