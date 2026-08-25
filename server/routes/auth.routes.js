const express = require('express');
const router = express.Router();
const { login, logout, refresh, changePassword, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } = require('../models/schemas');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', validate(loginSchema), authLimiter, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), authLimiter, forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

module.exports = router;
