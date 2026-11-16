// server/middleware/auth.js
// JWT authentication middleware — verifies access token from Authorization header

const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const prisma = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Auth] Missing or invalid header:', authHeader);
      return sendError(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Fetch fresh user to check if account is still active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true,
        profilePhoto: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 401);
    }
    if (!user.isActive) {
      return sendError(res, 'Account is deactivated. Contact admin.', 403);
    }

    const isDemo = decoded.isDemo || user.email === (process.env.DEMO_USER_EMAIL || 'demo@bms.com');

    req.user = {
      ...user,
      isDemo: !!isDemo,
    };

    // Global Read-Only Demo Guard:
    // If request belongs to a demo session, block all mutating methods (POST, PUT, PATCH, DELETE)
    // with exception only for logout
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (isDemo && !safeMethods.includes(req.method)) {
      const isLogout = req.originalUrl?.includes('/auth/logout') || req.path === '/logout';
      if (!isLogout) {
        return sendError(
          res,
          'Demo Mode: Modification actions are disabled in the public demo to protect data integrity.',
          403
        );
      }
    }

    next();
  } catch (error) {
    console.log('[Auth] Error:', error.name, error.message);
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Access token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid access token', 401);
    }
    next(error);
  }
};

module.exports = { authenticate };
