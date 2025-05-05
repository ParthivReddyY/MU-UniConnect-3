const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/auth');
const {
  getAllHighlights,
  getHighlightById,
  createHighlight,
  updateHighlight,
  deleteHighlight
} = require('../controllers/campusHighlightController');

// Public routes
router.get('/', getAllHighlights);
router.get('/:id', getHighlightById);

// Admin only routes
router.post('/', authenticateUser, isAdmin, createHighlight);
router.patch('/:id', authenticateUser, isAdmin, updateHighlight);
router.delete('/:id', authenticateUser, isAdmin, deleteHighlight);

module.exports = router;