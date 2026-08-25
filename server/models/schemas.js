// server/models/schemas.js
// Zod validation schemas for all API endpoints

const { z } = require('zod');

// ── Auth ──────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ── Users / Profile ───────────────────────────
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional().nullable(),
});

// ── Employee ──────────────────────────────────
const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(12, 'Password must be at most 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().max(20).optional(),
  role: z.enum(['MANAGER', 'STAFF']).default('STAFF'),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  salary: z.number().positive().optional(),
  hireDate: z.string().optional(),
  address: z.string().max(255).optional(),
  notes: z.string().optional(),
});

const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional().nullable(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
  department: z.string().max(100).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  salary: z.number().positive().optional().nullable(),
  hireDate: z.string().optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// ── Customer ──────────────────────────────────
const customerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ── Supplier ──────────────────────────────────
const supplierSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  contactPerson: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ── Category ──────────────────────────────────
const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
});

// ── Product ───────────────────────────────────
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  sku: z.string().min(1, 'SKU is required').max(50),
  barcode: z.preprocess((val) => (!val || val === '' ? null : val), z.string().max(100).optional().nullable()),
  description: z.preprocess((val) => (!val || val === '' ? null : val), z.string().optional().nullable()),
  buyingPrice: z.preprocess((val) => (val !== undefined && val !== '' ? Number(val) : val), z.number({ invalid_type_error: 'Buying price must be a number' }).min(0, 'Buying price must be at least 0')),
  sellingPrice: z.preprocess((val) => (val !== undefined && val !== '' ? Number(val) : val), z.number({ invalid_type_error: 'Selling price must be a number' }).min(0, 'Selling price must be at least 0')),
  quantity: z.preprocess((val) => (val !== undefined && val !== '' ? parseInt(val, 10) : 0), z.number().int().min(0).default(0)),
  minStock: z.preprocess((val) => (val !== undefined && val !== '' ? parseInt(val, 10) : 5), z.number().int().min(0).default(5)),
  categoryId: z.string().min(1, 'Category is required'),
  supplierId: z.preprocess((val) => (!val || val === '' ? null : val), z.string().optional().nullable()),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('ACTIVE'),
});

// ── Inventory ─────────────────────────────────
const stockMovementSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive(),
  supplierId: z.string().cuid().optional().nullable(),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

const stockAdjustmentSchema = z.object({
  productId: z.string().cuid(),
  newQuantity: z.number().int().min(0),
  reason: z.string().min(1),
});

// ── Sale ──────────────────────────────────────
const saleItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  discount: z.number().min(0).default(0),
});

const createSaleSchema = z.object({
  customerId: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100).default(0),
  discountAmount: z.number().min(0).default(0),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY', 'OTHER']).default('CASH'),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIAL']).default('PAID'),
  amountPaid: z.number().min(0).optional(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  customerSchema,
  supplierSchema,
  categorySchema,
  productSchema,
  stockMovementSchema,
  stockAdjustmentSchema,
  createSaleSchema,
};
