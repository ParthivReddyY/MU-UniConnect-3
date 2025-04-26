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

// Replace multiple similar middleware functions with this more flexible approach
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (roles.includes(req.user.role)) {
      next();
    } else {
      const formattedRoles = roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' or ');
      res.status(403).json({ 
        success: false, 
        message: `${formattedRoles} access required` 
      });
    }
  };
};

// Then export specific role check functions using the general approach
const isAdmin = hasRole(['admin']);
const isFaculty = hasRole(['faculty']);
const isStudent = hasRole(['student']);
const isClubHead = hasRole(['clubHead', 'clubs']);
const isFacultyOrAdmin = hasRole(['faculty', 'admin']);
const isClubHeadOrAdmin = hasRole(['clubHead', 'clubs', 'admin']);

module.exports = {
  authenticateUser,
  isAdmin,
  isFaculty,
  isStudent,
  isClubHead,
  isFacultyOrAdmin,
  isClubHeadOrAdmin,
  // Allow custom role combinations too
  hasRole
};
