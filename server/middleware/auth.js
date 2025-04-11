const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user middleware
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Add user info to request object
    // Include both userId and _id to ensure both formats are available
    req.user = {
      userId: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

// Check if user is faculty or admin
const isFacultyOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Faculty or admin access required' });
  }
};

// Check if user is club head or admin
const isClubHeadOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'clubHead' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Club head or admin access required' });
  }
};

module.exports = {
  authenticateUser,
  isAdmin,
  isFacultyOrAdmin,
  isClubHeadOrAdmin
};
