const express = require('express');
const router = express.Router();
const { getSales, getSaleById, createSale } = require('../controllers/sale.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createSaleSchema } = require('../models/schemas');

router.get('/', authenticate, getSales);
router.get('/:id', authenticate, getSaleById);
router.post('/', authenticate, validate(createSaleSchema), createSale);

module.exports = router;
