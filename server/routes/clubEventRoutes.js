const express = require('express');
const router = express.Router();
const clubEventController = require('../controllers/clubEventController');
const { authenticateUser } = require('../middleware/auth');
const { isClubHeadOrAdmin } = require('../middleware/roleCheck');

// Public club event routes
router.get('/', clubEventController.getClubEvents);
router.get('/details/:id', clubEventController.getClubEventDetails);

// Club head/Admin routes for managing club events
router.get('/managed', authenticateUser, isClubHeadOrAdmin, clubEventController.getManagedClubEvents);
router.post('/managed', authenticateUser, isClubHeadOrAdmin, clubEventController.createClubEvent);
router.get('/managed/:id', authenticateUser, isClubHeadOrAdmin, clubEventController.getManagedClubEventDetails);
router.put('/managed/:id', authenticateUser, isClubHeadOrAdmin, clubEventController.updateClubEvent);
router.delete('/managed/:id', authenticateUser, isClubHeadOrAdmin, clubEventController.deleteClubEvent);

module.exports = router;