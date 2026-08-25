// server/middleware/authorize.js
// Role-based access control middleware

const { sendError } = require('../utils/response');

/**
 * Restrict route access to specific roles
 * Usage: authorize('ADMIN', 'MANAGER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `You don't have permission to perform this action. Required role: ${roles.join(' or ')}. Please contact an Administrator.`,
        403
      );
    }
    next();
  };
};

module.exports = { authorize };
