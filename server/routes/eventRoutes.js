const express = require('express');
const router = express.Router();
const { getUniversityEvents, updateUniversityEvents, createUniversityEvent } = require('../controllers/eventController');

// University events routes
router.get('/university', getUniversityEvents);
router.put('/university', updateUniversityEvents);
router.post('/university', createUniversityEvent);

module.exports = router;