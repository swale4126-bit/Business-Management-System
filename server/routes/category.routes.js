const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { categorySchema } = require('../models/schemas');

router.get('/', authenticate, getCategories);
router.get('/:id', authenticate, getCategoryById);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(categorySchema), createCategory);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(categorySchema), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);

module.exports = router;
