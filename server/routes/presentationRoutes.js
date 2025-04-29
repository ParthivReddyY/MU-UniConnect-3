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

// Create a new presentation
router.post('/', isFacultyOrAdmin, presentationController.createPresentationSlot);

// Get a single presentation by ID
router.get('/:id', presentationController.getPresentationById);

// Update presentation details
router.put('/:id', isFacultyOrAdmin, presentationController.updatePresentation);

// Delete a presentation
router.delete('/:id', isFacultyOrAdmin, presentationController.deletePresentationSlot);

// Book a presentation slot
router.post('/:id/book', presentationController.bookPresentationSlot);

// Get slots for a specific presentation
router.get('/:id/slots', presentationController.getPresentationSlots);

// Start a presentation slot
router.put('/slots/:slotId/start', isFacultyOrAdmin, presentationController.startPresentationSlot);

// Complete a presentation with grading
router.put('/slots/:slotId/complete', isFacultyOrAdmin, presentationController.completePresentationSlot);

module.exports = router;
