// server/controllers/employee.controller.js
// Employee CRUD — create (also creates User), read, update, delete, search

const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { sendSuccess, sendPaginated, sendError } = require('../utils/response');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

/**
 * Generate the next unique employeeId in the format EMP-0001.
 * Uses the highest existing numeric suffix so deletions never cause collisions.
 */
const generateEmployeeId = async () => {
  // Find the employee with the lexicographically highest employeeId
  const last = await prisma.employee.findFirst({
    orderBy: { employeeId: 'desc' },
    select: { employeeId: true },
  });

  let nextNumber = 1;
  if (last?.employeeId) {
    // Extract the numeric part after "EMP-"
    const match = last.employeeId.match(/^EMP-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Retry loop — handles race conditions
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `EMP-${String(nextNumber).padStart(4, '0')}`;
    const exists = await prisma.employee.findUnique({ where: { employeeId: candidate } });
    if (!exists) return candidate;
    nextNumber++;
  }

  throw new Error('Could not generate a unique employee ID after 10 attempts.');
};

/**
 * GET /api/employees
 */
const getEmployees = async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { search, status, role } = req.query;

  const where = {
    ...(status && { status }),
    user: {
      ...(role && { role }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
  };

  const [total, employees] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, lastLoginAt: true, profilePhoto: true } },
      },
    }),
  ]);

  return sendPaginated(res, employees, buildPaginationMeta(total, page, limit));
};

/**
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res) => {
  const paramId = req.params.id;
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: paramId },
        { userId: paramId },
        { employeeId: paramId },
      ],
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, lastLoginAt: true, profilePhoto: true } },
    },
  });
  if (!employee) return sendError(res, 'Employee not found', 404);
  return sendSuccess(res, employee);
};

/**
 * POST /api/employees
 */
const createEmployee = async (req, res) => {
  const { email, password, firstName, lastName, phone, role, department, position, salary, hireDate, address, notes } = req.body;

  // Check email uniqueness before entering the transaction
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return sendError(res, 'An account with this email already exists.', 409);

  const hashed = await bcrypt.hash(password, 12);

  // Generate a collision-safe, sequential employee ID
  const employeeId = await generateEmployeeId();

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashed,
        firstName,
        lastName,
        phone: phone || null,
        role: role || 'STAFF',
        mustChangePassword: true,  // force password change on first login
      },
    });

    const employee = await tx.employee.create({
      data: {
        userId: user.id,
        employeeId,
        department: department || null,
        position: position || null,
        salary: salary ? parseFloat(salary) : null,
        hireDate: hireDate ? new Date(hireDate) : null,
        address: address || null,
        notes: notes || null,
      },
    });

    // Notify all admins about the new employee
    const admins = await tx.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });
    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: 'NEW_EMPLOYEE',
          title: 'New Employee Added',
          message: `${firstName} ${lastName} has joined as ${role || 'STAFF'} (${employeeId})`,
          data: { employeeId: employee.id },
        })),
      });
    }

    return {
      ...employee,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  });

  return sendSuccess(res, result, 'Employee and user account created successfully.', 201);
};

/**
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res) => {
  const { firstName, lastName, phone, role, department, position, salary, hireDate, address, status, notes, isActive } = req.body;

  const employee = await prisma.employee.findUnique({ where: { id: req.params.id } });
  if (!employee) return sendError(res, 'Employee not found', 404);

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: employee.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    const updatedEmployee = await tx.employee.update({
      where: { id: req.params.id },
      data: {
        ...(department !== undefined && { department }),
        ...(position !== undefined && { position }),
        ...(salary !== undefined && { salary: salary ? parseFloat(salary) : null }),
        ...(hireDate !== undefined && { hireDate: hireDate ? new Date(hireDate) : null }),
        ...(address !== undefined && { address }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });
    return { ...updatedEmployee, user: updatedUser };
  });

  return sendSuccess(res, result, 'Employee updated successfully');
};

/**
 * DELETE /api/employees/:id
 * Soft-delete: marks employee as TERMINATED and user as inactive.
 * This avoids FK constraint violations from related sale records.
 */
const deleteEmployee = async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: { id: req.params.id },
    include: { user: true }
  });
  if (!employee) return sendError(res, 'Employee not found', 404);

  // Prevent deleting the currently authenticated admin
  if (employee.userId === req.user.id) {
    return sendError(res, 'You cannot delete your own account.', 400);
  }

  await prisma.$transaction(async (tx) => {
    // Soft-delete: set employee status to TERMINATED
    await tx.employee.update({
      where: { id: req.params.id },
      data: { status: 'TERMINATED' }
    });
    // Deactivate the user account so they can no longer log in
    await tx.user.update({
      where: { id: employee.userId },
      data: { isActive: false, refreshToken: null }
    });
  });

  return sendSuccess(res, null, 'Employee has been terminated and their account deactivated.');
};

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };
