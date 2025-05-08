const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/auth');
const announcementController = require('../controllers/announcementController');

// Public routes
router.get('/', announcementController.getAllAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);

// Protected routes - Admin only
router.post('/', authenticateUser, isAdmin, announcementController.createAnnouncement);
router.put('/:id', authenticateUser, isAdmin, announcementController.updateAnnouncement);
router.delete('/:id', authenticateUser, isAdmin, announcementController.deleteAnnouncement);

module.exports = router;