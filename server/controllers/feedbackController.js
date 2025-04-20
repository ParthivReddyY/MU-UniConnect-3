const Feedback = require('../models/Feedback');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
});

// Helper function to handle file upload
const handleFileUpload = upload.array('attachments', 3);

/**
 * @desc    Create new feedback entry
 * @route   POST /api/feedback
 * @access  Private
 */
exports.createFeedback = async (req, res) => {
  try {
    // Get user information (will be added to non-anonymous feedback)
    const userId = req.user.userId || req.user._id;
    
    // Debug logs to help diagnose issues
    console.log('User from request:', req.user);
    
    // Extract data from request
    const { 
      category, 
      subject, 
      description, 
      rating, 
      isAnonymous,
      contactEmail,
      contactPhone
    } = req.body;
    
    // Debugging info
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // Validate required fields
    if (!category || !subject || !description || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields (category, subject, description, rating)' 
      });
    }
    
    // Properly convert FormData values to appropriate types
    // FormData sends everything as strings, so we need to convert them
    const isAnonymousBoolean = isAnonymous === 'true' || isAnonymous === true;
    const ratingNumber = parseInt(rating);
    
    // Create new feedback object
    const feedbackData = {
      category,
      subject,
      description,
      rating: ratingNumber,
      isAnonymous: isAnonymousBoolean
    };
    
    // Only add user information if not anonymous
    if (!isAnonymousBoolean) {
      feedbackData.user = userId;
      
      // Add contact information if provided
      if (contactEmail) feedbackData.contactEmail = contactEmail;
      if (contactPhone) feedbackData.contactPhone = contactPhone;
    }
    
    // Process file attachments if available
    if (req.files && req.files.length > 0) {
      feedbackData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
    }
    
    // Create feedback entry in database
    const feedback = await Feedback.create(feedbackData);
    
    // Log activity
    console.log(`New feedback submitted${isAnonymousBoolean ? ' anonymously' : ' by user ' + userId}`);
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        category: feedback.category,
        subject: feedback.subject,
        createdAt: feedback.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error creating feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all feedback (for admins)
 * @route   GET /api/feedback
 * @access  Private (Admin only)
 */
exports.getAllFeedback = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Get all feedback with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build base query with filters
    let query = {};
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Count total for pagination
    const total = await Feedback.countDocuments(query);
    
    // Get filtered and paginated results
    const feedback = await Feedback.find(query)
      .populate('user', 'name email studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      feedback
    });
    
  } catch (error) {
    console.error('Error getting feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get current user's feedback
 * @route   GET /api/feedback/my-feedback
 * @access  Private
 */
exports.getUserFeedback = async (req, res) => {
  try {
    // Fix: Use userId or _id from the user object set by the auth middleware
    const userId = req.user.userId || req.user._id;
    
    const feedback = await Feedback.find({ 
      user: userId 
    }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: feedback.length,
      feedback
    });
    
  } catch (error) {
    console.error('Error getting user feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update feedback status (for admins)
 * @route   PATCH /api/feedback/:id/status
 * @access  Private (Admin only)
 */
exports.updateFeedbackStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    // Fix: Use userId or _id from the user object set by the auth middleware
    const userId = req.user.userId || req.user._id;
    
    // Validate status
    const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Update feedback status
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { 
        status,
        updatedBy: userId,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Feedback status updated to ${status}`,
      feedback
    });
    
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
