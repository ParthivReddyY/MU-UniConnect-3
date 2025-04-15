const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/auth');
const presentationSlotController = require('../../controllers/presentationSlotController');
const PresentationSlot = require('../../models/PresentationSlot'); // Add this import for the delete-by-title route

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

// Add a new route for bulk deletion by title
router.post('/delete-by-title', authenticateUser, async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const userId = req.user.userId || req.user._id;
    
    // Find all slots with matching title and host
    const slots = await PresentationSlot.find({ 
      title, 
      'host.user': userId,
      status: 'available' // Only delete available slots
    });
    
    if (slots.length === 0) {
      return res.status(404).json({ message: 'No available slots found with this title' });
    }
    
    // Delete all matching slots
    const result = await PresentationSlot.deleteMany({ 
      title, 
      'host.user': userId,
      status: 'available'
    });
    
    res.json({ 
      message: `Successfully deleted ${result.deletedCount} presentation slots`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error deleting slots by title:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;