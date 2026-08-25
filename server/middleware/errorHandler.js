// server/middleware/errorHandler.js
// Global Express error handler — catches all unhandled errors

const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Prisma-specific errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return sendError(res, `A record with this ${field} already exists`, 409);
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }
  if (err.code === 'P2003') {
    return sendError(res, 'Referenced record does not exist', 400);
  }

  // JWT errors
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File size too large (max 5MB)', 400);
  }

  // Validation errors
  if (err.name === 'ZodError') {
    return sendError(res, 'Validation failed', 400, err.errors);
  }

  // Default
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, statusCode);
};

const notFoundHandler = (req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.path}`, 404);
};

module.exports = { errorHandler, notFoundHandler };
