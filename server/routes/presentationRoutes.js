const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { isFacultyOrAdmin } = require('../middleware/roleCheck');
const presentationController = require('../controllers/presentationController');

// Protected routes
router.use(authenticateUser);

// Get all available presentation slots (for students to book)
router.get('/available', presentationController.getAvailablePresentationSlots);

// Get presentation slots created by a faculty member
router.get('/faculty', presentationController.getFacultyPresentationSlots);

// Create a new presentation slot
router.post('/', isFacultyOrAdmin, presentationController.createPresentationSlot);

// Book a presentation slot
router.post('/:id/book', presentationController.bookPresentationSlot);

// Get slots for a specific presentation (for grading)
router.get('/:id/slots', isFacultyOrAdmin, presentationController.getPresentationSlots);

// Start a presentation (change slot status to in-progress)
router.put('/slots/:slotId/start', isFacultyOrAdmin, presentationController.startPresentationSlot);

// Complete a presentation (grade and provide feedback)
router.put('/slots/:slotId/complete', isFacultyOrAdmin, presentationController.completePresentationSlot);

// Delete a presentation event
router.delete('/:id', isFacultyOrAdmin, presentationController.deletePresentationSlot);

// Get a single presentation by ID
router.get('/:id', presentationController.getPresentationById);

// Update a presentation
router.put('/:id', isFacultyOrAdmin, presentationController.updatePresentation);

module.exports = router;
