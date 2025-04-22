const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { authenticateUser } = require('../middleware/auth');
const Club = require('../models/Club'); // Add missing Club model import

// Get all clubs
router.get('/', clubController.getAllClubs);

// Create a new club
router.post('/', authenticateUser, clubController.createClub);

// Get clubs by category
router.get('/category/:category', clubController.getClubsByCategory);

// Get a specific club
router.get('/:id', clubController.getClubById);

// Update a club
router.patch('/:id', authenticateUser, clubController.updateClub);

// Update club route - requires authentication
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const clubId = req.params.id;
    const updateData = req.body;
    
    // Debug logging to verify incoming data
    console.log('Updating club with ID:', clubId);
    console.log('Member data received:', JSON.stringify(updateData.members, null, 2));

    // Explicitly process members to ensure emails are included
    if (updateData.members && Array.isArray(updateData.members)) {
      updateData.members = updateData.members.map(member => {
        // Ensure each member has the required fields
        return {
          name: member.name || '',
          position: member.position || '',
          email: member.email || '' // Explicitly include email
        };
      });
    }

    // Update with runValidators to ensure schema validation
    const updatedClub = await Club.findByIdAndUpdate(
      clubId, 
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedClub) {
      return res.status(404).json({ message: 'Club not found' });
    }

    console.log('Updated club members:', JSON.stringify(updatedClub.members, null, 2));
    res.json(updatedClub);
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a club
router.delete('/:id', authenticateUser, clubController.deleteClub);

// Add an event to a club
router.post('/:id/events', authenticateUser, clubController.addEvent);

// Delete an event from a club
router.delete('/:clubId/events/:eventId', authenticateUser, clubController.deleteEvent);

module.exports = router;