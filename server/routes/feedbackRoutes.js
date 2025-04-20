const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createFeedback, getAllFeedback, getUserFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/feedback');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3 // Maximum 3 files
  },
  fileFilter: fileFilter
}).array('attachments', 3); // Configure for array of files

// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size exceeds the 5MB limit' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum of 3 files allowed' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: `File upload error: ${err.message}` 
    });
  }
  
  if (err) {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
  
  next();
};

// Custom middleware to handle file uploads safely
const handleFileUpload = (req, res, next) => {
  // For JSON-only submissions, skip file processing
  if (req.headers['content-type'] === 'application/json') {
    return next();
  }

  upload(req, res, function(err) {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

/**
 * @route   POST /api/feedback
 * @desc    Submit new feedback
 * @access  Private (authenticated users only)
 */
router.post('/', authenticateUser, handleFileUpload, createFeedback);

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback (admin only)
 * @access  Private (admin only)
 */
router.get('/', authenticateUser, getAllFeedback);

/**
 * @route   GET /api/feedback/stats
 * @desc    Get feedback statistics (admin only)
 * @access  Private (admin only)
 */
router.get('/stats', authenticateUser, (req, res) => {
  // Only admins can access stats
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  // Get feedback statistics from database
  const Feedback = require('../models/Feedback');
  
  Promise.all([
    // Get total count
    Feedback.countDocuments({}),
    // Get counts by status
    Feedback.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ])
  ])
  .then(([totalFeedback, statusCounts]) => {
    // Map status counts for easier access
    const statusMap = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    // Return the stats using the correct status names
    return res.json({
      success: true,
      totalFeedback,
      statusCounts: [
        { _id: 'pending', count: statusMap.pending || 0 },
        { _id: 'in-progress', count: statusMap['in-progress'] || 0 },
        { _id: 'resolved', count: statusMap.resolved || 0 },
        { _id: 'rejected', count: statusMap.rejected || 0 }
      ]
    });
  })
  .catch(err => {
    console.error('Error getting feedback stats:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching feedback statistics'
    });
  });
});

/**
 * @route   GET /api/feedback/my-feedback
 * @desc    Get user's own feedback
 * @access  Private (authenticated users only)
 */
router.get('/my-feedback', authenticateUser, getUserFeedback);

/**
 * @route   PATCH /api/feedback/:id/status
 * @desc    Update feedback status (admin only)
 * @access  Private (admin only)
 */
router.patch('/:id/status', authenticateUser, updateFeedbackStatus);

module.exports = router;
