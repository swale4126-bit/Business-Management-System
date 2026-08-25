// server/controllers/auth.controller.js
// Handles login, logout, token refresh, forgot/reset password, change password

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const { sendPasswordResetEmail } = require('../utils/email');

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return sendError(res, 'Invalid email or password', 401);
  if (!user.isActive) return sendError(res, 'Account is deactivated. Contact admin.', 403);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return sendError(res, 'Invalid email or password', 401);

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken, lastLoginAt: new Date() },
  });

  const { password: _, refreshToken: __, ...userData } = user;
  return sendSuccess(res, { user: userData, accessToken, refreshToken }, 'Login successful');
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  const { id } = req.user;
  await prisma.user.update({ where: { id }, data: { refreshToken: null } });
  return sendSuccess(res, null, 'Logged out successfully');
};

/**
 * POST /api/auth/refresh
 */
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, 'Refresh token required', 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.refreshToken !== refreshToken) {
    return sendError(res, 'Refresh token mismatch or revoked', 401);
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

  return sendSuccess(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
};

/**
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return sendError(res, 'Current password is incorrect', 400);

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed, refreshToken: null, mustChangePassword: false } });

  return sendSuccess(res, null, 'Password changed successfully. Please login again.');
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return sendError(res, 'Email is required', 400);
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always return generic success message to prevent email enumeration
  if (!user) {
    return sendSuccess(res, null, 'If an account exists for this email, reset instructions have been sent.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpires: expires },
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    console.error('[Auth] Error sending reset email:', err);
  }

  return sendSuccess(res, null, 'If an account exists for this email, reset instructions have been sent.');
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return sendError(res, 'Token and new password are required', 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return sendError(res, 'Invalid or expired password reset link. Please request a new link.', 400);
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  
  // Single-use token: nullify passwordResetToken & passwordResetExpires immediately
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      password: hashed, 
      passwordResetToken: null, 
      passwordResetExpires: null, 
      refreshToken: null 
    },
  });

  return sendSuccess(res, null, 'Password reset successfully. Please login with your new password.');
};

module.exports = { login, logout, refresh, changePassword, forgotPassword, resetPassword };
