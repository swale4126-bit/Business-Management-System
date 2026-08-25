const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employee.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createEmployeeSchema, updateEmployeeSchema } = require('../models/schemas');

router.get('/', authenticate, authorize('ADMIN'), getEmployees);
router.get('/:id', authenticate, authorize('ADMIN'), getEmployeeById);
router.post('/', authenticate, authorize('ADMIN'), validate(createEmployeeSchema), createEmployee);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateEmployeeSchema), updateEmployee);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteEmployee);

module.exports = router;
