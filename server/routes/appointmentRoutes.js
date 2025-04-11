const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateUser, isAdmin, isFacultyOrAdmin } = require('../middleware/auth');

// Student routes - create and view appointments
router.post('/', authenticateUser, appointmentController.createAppointment);

// Legacy route for compatibility with older code
router.post('/faculty', authenticateUser, appointmentController.createAppointment);

router.get('/my-appointments', authenticateUser, appointmentController.getStudentAppointments);

// Faculty routes - view and manage assigned appointments
router.get('/faculty-appointments', authenticateUser, isFacultyOrAdmin, appointmentController.getFacultyAppointments);
router.get('/faculty-stats', authenticateUser, isFacultyOrAdmin, appointmentController.getFacultyAppointmentStats);

// Admin route - view all appointments
router.get('/', authenticateUser, isAdmin, appointmentController.getAllAppointments);

// Common routes - get and update specific appointments
router.get('/:id', authenticateUser, appointmentController.getAppointmentById);
router.patch('/:id/status', authenticateUser, appointmentController.updateAppointmentStatus);

// Admin only - delete appointments
router.delete('/:id', authenticateUser, isAdmin, appointmentController.deleteAppointment);

module.exports = router;