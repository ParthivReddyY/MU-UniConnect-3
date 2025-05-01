const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateUser } = require('../middleware/auth');
const { isFacultyOrAdmin } = require('../middleware/roleCheck');
const presentationController = require('../controllers/presentationController');

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/presentations'));
  },
  filename: function (req, file, cb) {
    // Create a unique filename using timestamp and original name
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

// Configure file filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  // Accept these file types
  const allowedTypes = [
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'application/zip', 'application/x-rar-compressed', 'image/jpeg', 'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR, JPG, and PNG files are allowed.'), false);
  }
};

// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter
});

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

// Book a presentation slot with file attachment
router.post('/:id/book-with-file', upload.single('file'), presentationController.bookPresentationSlotWithFile);

// Get slots for a specific presentation
router.get('/:id/slots', presentationController.getPresentationSlots);

// Start a presentation slot
router.put('/slots/:slotId/start', isFacultyOrAdmin, presentationController.startPresentationSlot);

// Complete a presentation with grading
router.put('/slots/:slotId/complete', isFacultyOrAdmin, presentationController.completePresentationSlot);

module.exports = router;
