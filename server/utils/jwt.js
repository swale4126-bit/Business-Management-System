// server/utils/jwt.js
// JWT token generation and verification helpers

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Generate an access token (short-lived)
 * @param {object} payload - { id, email, role, isDemo }
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: payload.isDemo ? '2h' : env.JWT_ACCESS_EXPIRES_IN,
  });
};

/**
 * Generate a refresh token (long-lived)
 * @param {object} payload - { id, isDemo }
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: payload.isDemo ? '24h' : env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify an access token
 * @param {string} token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verify a refresh token
 * @param {string} token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
