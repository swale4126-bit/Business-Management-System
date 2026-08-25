// server/controllers/profile.controller.js
// User profile management — view/update profile, upload/delete photo

const path = require('path');
const fs = require('fs');
const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/profile
 */
const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, profilePhoto: true, role: true, isActive: true,
      lastLoginAt: true, createdAt: true, updatedAt: true,
      employee: { select: { employeeId: true, department: true, position: true, hireDate: true, updatedAt: true } },
    },
  });
  return sendSuccess(res, user, 'Profile fetched');
};

/**
 * PUT /api/profile
 */
const updateProfile = async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, phone },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, profilePhoto: true, role: true, isActive: true,
      lastLoginAt: true, createdAt: true, updatedAt: true,
      employee: { select: { employeeId: true, department: true, position: true, hireDate: true, updatedAt: true } },
    },
  });
  return sendSuccess(res, user, 'Profile updated');
};

/**
 * POST /api/profile/photo
 */
const uploadProfilePhoto = async (req, res) => {
  if (!req.file) return sendError(res, 'No file uploaded', 400);

  // Delete old photo if exists
  const existing = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { profilePhoto: true },
  });
  if (existing?.profilePhoto) {
    const oldPath = path.join(process.cwd(), existing.profilePhoto);
    if (fs.existsSync(oldPath)) {
      try { fs.unlinkSync(oldPath); } catch (e) { console.error('[Profile] Failed to unlink old photo:', e); }
    }
  }

  const photoUrl = `/uploads/profiles/${req.file.filename}`;
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { profilePhoto: photoUrl },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, profilePhoto: true, role: true, isActive: true,
      lastLoginAt: true, createdAt: true, updatedAt: true,
      employee: { select: { employeeId: true, department: true, position: true, hireDate: true, updatedAt: true } },
    },
  });

  return sendSuccess(res, updatedUser, 'Profile photo uploaded');
};

/**
 * DELETE /api/profile/photo
 */
const removeProfilePhoto = async (req, res) => {
  const existing = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { profilePhoto: true },
  });

  if (existing?.profilePhoto) {
    const oldPath = path.join(process.cwd(), existing.profilePhoto);
    if (fs.existsSync(oldPath)) {
      try { fs.unlinkSync(oldPath); } catch (e) { console.error('[Profile] Failed to unlink photo:', e); }
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { profilePhoto: null },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, profilePhoto: true, role: true, isActive: true,
      lastLoginAt: true, createdAt: true, updatedAt: true,
      employee: { select: { employeeId: true, department: true, position: true, hireDate: true, updatedAt: true } },
    },
  });

  return sendSuccess(res, updatedUser, 'Profile photo removed');
};

module.exports = { getProfile, updateProfile, uploadProfilePhoto, removeProfilePhoto };
