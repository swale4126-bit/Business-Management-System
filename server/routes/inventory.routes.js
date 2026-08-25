const express = require('express');
const router = express.Router();
const { getInventory, getLowStockProducts, getStockHistory, stockIn, stockOut, adjustStock } = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { stockMovementSchema, stockAdjustmentSchema } = require('../models/schemas');

router.get('/', authenticate, getInventory);
router.get('/low-stock', authenticate, getLowStockProducts);
router.get('/history', authenticate, authorize('ADMIN', 'MANAGER'), getStockHistory);
router.post('/stock-in', authenticate, authorize('ADMIN', 'MANAGER'), validate(stockMovementSchema), stockIn);
router.post('/stock-out', authenticate, authorize('ADMIN', 'MANAGER'), validate(stockMovementSchema), stockOut);
router.post('/adjust', authenticate, authorize('ADMIN', 'MANAGER'), validate(stockAdjustmentSchema), adjustStock);

module.exports = router;
