const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user based on JWT
const authenticateUser = async (req, res, next) => {
  // Check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication invalid' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user and his/her permissions to the request object
    req.user = {
      userId: payload.userId,
      name: payload.name,
      role: payload.role,
      email: payload.email
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication invalid' });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User with role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Check if user is faculty or admin
const isFacultyOrAdmin = (req, res, next) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Faculty or admin privileges required.' });
  }
  next();
};

// Check if user is club head or admin
const isClubHeadOrAdmin = (req, res, next) => {
  if (req.user.role !== 'clubHead' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Club head or admin privileges required.' });
  }
  next();
};

module.exports = {
  authenticateUser,
  authorizeRoles,
  isAdmin,
  isFacultyOrAdmin,
  isClubHeadOrAdmin
};
