/**
 * Middleware to check if the user is a faculty member or admin
 * Used for routes that should only be accessible to faculty and administrators
 */
const isFacultyOrAdmin = (req, res, next) => {
  try {
    // Check if user exists and is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user role is faculty or admin
    if (req.user.role === 'faculty' || req.user.role === 'admin') {
      return next(); // Allow access
    }
    
    // If not faculty or admin, deny access
    return res.status(403).json({
      success: false,
      message: 'Access denied. Faculty or admin role required.'
    });
  } catch (error) {
    console.error('Role check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during role verification'
    });
  }
};

/**
 * Middleware to check if the user is a club head or admin
 * Used for routes that should only be accessible to club heads and administrators
 */
const isClubHeadOrAdmin = (req, res, next) => {
  try {
    // Check if user exists and is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user role is clubHead, clubs or admin
    if (req.user.role === 'clubHead' || req.user.role === 'clubs' || req.user.role === 'admin') {
      return next(); // Allow access
    }
    
    // If not club head or admin, deny access
    return res.status(403).json({
      success: false,
      message: 'Access denied. Club head or admin role required.'
    });
  } catch (error) {
    console.error('Role check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during role verification'
    });
  }
};

// Export the middleware
module.exports = {
  isFacultyOrAdmin,
  isClubHeadOrAdmin
};
