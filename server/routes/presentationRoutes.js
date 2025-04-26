const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { isFacultyOrAdmin } = require('../middleware/roleCheck');
const presentationController = require('../controllers/presentationController');

// Public routes - none

// Protected routes
router.use(authenticateUser);

// Get all available presentation slots (for students to book)
router.get('/available', presentationController.getAvailablePresentationSlots);

// Get slots created by the logged-in faculty member
router.get('/faculty', isFacultyOrAdmin, presentationController.getFacultyPresentationSlots);

// Create a new presentation slot (faculty only)
router.post('/', isFacultyOrAdmin, presentationController.createPresentationSlot);

// Book a presentation slot (student)
router.post('/:id/book', presentationController.bookPresentationSlot);

// Delete/cancel a presentation slot (faculty who created it)
router.delete('/:id', isFacultyOrAdmin, presentationController.deletePresentationSlot);

module.exports = router;
