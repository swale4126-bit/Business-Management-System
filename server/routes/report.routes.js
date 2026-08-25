const express = require('express');
const router = express.Router();
const { getSalesReport, getProductReport, getCustomerReport, getEmployeeReport, getInventoryReport } = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/sales', authenticate, authorize('ADMIN', 'MANAGER'), getSalesReport);
router.get('/products', authenticate, authorize('ADMIN', 'MANAGER'), getProductReport);
router.get('/customers', authenticate, authorize('ADMIN', 'MANAGER'), getCustomerReport);
router.get('/employees', authenticate, authorize('ADMIN'), getEmployeeReport);
router.get('/inventory', authenticate, authorize('ADMIN', 'MANAGER'), getInventoryReport);

module.exports = router;
