const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');
const { productSchema } = require('../models/schemas');

router.get('/', authenticate, getProducts);
router.get('/:id', authenticate, getProductById);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), upload.single('image'), validate(productSchema), createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), upload.single('image'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

module.exports = router;
