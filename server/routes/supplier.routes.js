const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplierById, getSupplierProducts, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplier.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { supplierSchema } = require('../models/schemas');

router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), getSuppliers);
router.get('/:id', authenticate, authorize('ADMIN', 'MANAGER'), getSupplierById);
router.get('/:id/products', authenticate, getSupplierProducts);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(supplierSchema), createSupplier);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(supplierSchema), updateSupplier);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSupplier);

module.exports = router;
