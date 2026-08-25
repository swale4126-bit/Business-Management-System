const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, getCustomerPurchases, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { customerSchema } = require('../models/schemas');

router.get('/', authenticate, getCustomers);
router.get('/:id', authenticate, getCustomerById);
router.get('/:id/purchases', authenticate, getCustomerPurchases);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(customerSchema), createCustomer);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(customerSchema), updateCustomer);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCustomer);

module.exports = router;
