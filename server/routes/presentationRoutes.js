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

// Public routes for students to view available presentations
router.get('/available', presentationController.getAvailablePresentationSlots);

// Faculty routes to manage their presentations
router.get('/faculty', presentationController.getFacultyPresentationSlots);
router.post('/create', isFacultyOrAdmin, presentationController.createPresentationSlot);
router.get('/:id', presentationController.getPresentationById);
router.put('/:id', isFacultyOrAdmin, presentationController.updatePresentation);
router.delete('/:id', isFacultyOrAdmin, presentationController.deletePresentationSlot);

// Booking routes for students
router.post('/:id/book', presentationController.bookPresentationSlot);
router.post('/:id/book-with-file', upload.single('file'), presentationController.bookPresentationSlotWithFile);

// Routes for handling specific slots
router.get('/slots/:slotId', presentationController.getSlotById);
router.get('/:id/slots', presentationController.getPresentationSlots);
router.put('/slots/:slotId/start', isFacultyOrAdmin, presentationController.startPresentationSlot);
router.post('/slots/:slotId/grades', isFacultyOrAdmin, presentationController.completePresentationSlot);

module.exports = router;
