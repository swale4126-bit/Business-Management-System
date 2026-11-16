// server/middleware/rateLimiter.js
// Rate limiting to prevent brute-force attacks

const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
});

// Dedicated limiter for public demo login (allows generous exploration for recruiters)
const demoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many demo access requests from this IP. Please try again in 15 minutes.',
  },
});

module.exports = { apiLimiter, authLimiter, demoLimiter };
