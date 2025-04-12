const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/auth');
const presentationSlotController = require('../../controllers/presentationSlotController');

// Route to create a single presentation slot
// POST /api/presentation-slots
router.post('/', authenticateUser, presentationSlotController.createPresentationSlot);

// Route to create multiple presentation slots in batch
// POST /api/presentation-slots/batch
router.post('/batch', authenticateUser, presentationSlotController.createBatchPresentationSlots);

// Route to get all presentation slots created by the logged-in host
// GET /api/presentation-slots/host
router.get('/host', authenticateUser, presentationSlotController.getHostPresentationSlots);

// Route to get all available presentation slots (filterable by year, school, department)
// GET /api/presentation-slots/available
router.get('/available', authenticateUser, presentationSlotController.getAvailablePresentationSlots);

// Route to get all presentation slots booked by the student
// GET /api/presentation-slots/student-bookings
router.get('/student-bookings', authenticateUser, presentationSlotController.getStudentBookings);

// Route to get a single presentation slot by ID
// GET /api/presentation-slots/:id
router.get('/:id', authenticateUser, presentationSlotController.getPresentationSlotById);

// Route to update a presentation slot
// PUT /api/presentation-slots/:id
router.put('/:id', authenticateUser, presentationSlotController.updatePresentationSlot);

// Route to delete a presentation slot
// DELETE /api/presentation-slots/:id
router.delete('/:id', authenticateUser, presentationSlotController.deletePresentationSlot);

// Route to book a presentation slot
// POST /api/presentation-slots/:id/book
router.post('/:id/book', authenticateUser, presentationSlotController.bookPresentationSlot);

// Route to cancel a booked presentation slot
// POST /api/presentation-slots/:id/cancel
router.post('/:id/cancel', authenticateUser, presentationSlotController.cancelBooking);

module.exports = router;