const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin, isFacultyOrAdmin } = require('../middleware/auth');
const facultyController = require('../controllers/facultyController');

// Public routes
router.get('/', facultyController.getAllFaculty);
router.get('/:id', facultyController.getFacultyById);

// Protected routes - only admin can create faculty
router.post('/', authenticateUser, isAdmin, facultyController.createFaculty);

// Protected routes - faculty can edit their own profile, admin can edit any profile
router.put('/:id', authenticateUser, isFacultyOrAdmin, facultyController.updateFaculty);
router.delete('/:id', authenticateUser, isAdmin, facultyController.deleteFaculty);

module.exports = router;
