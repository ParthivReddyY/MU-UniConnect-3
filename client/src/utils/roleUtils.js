/**
 * Utility functions for role-based checks
 */

/**
 * Check if a user has any of the specified roles
 * @param {Object} user - The user object
 * @param {Array} roles - Array of roles to check against
 * @returns {Boolean} True if user has any of the roles
 */
export const userHasRole = (user, roles) => {
  if (!user || !user.role || !roles || !Array.isArray(roles) || roles.length === 0) {
    return false;
  }
  return roles.includes(user.role);
};

/**
 * Generate consistent error messages for role checks
 * @param {Array} roles - The required roles
 * @returns {String} Formatted error message
 */
export const generateRoleErrorMessage = (roles) => {
  if (!roles || roles.length === 0) return 'Access denied';
  
  if (roles.length === 1) {
    return `Access denied. ${roles[0].charAt(0).toUpperCase() + roles[0].slice(1)} role required.`;
  }
  
  const formattedRoles = roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(' or ');
  return `Access denied. ${formattedRoles} role required.`;
};
