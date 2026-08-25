const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePhoto, removeProfilePhoto } = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');
const { updateProfileSchema } = require('../models/schemas');

router.get('/', authenticate, getProfile);
router.put('/', authenticate, validate(updateProfileSchema), updateProfile);
router.post('/photo', authenticate, upload.single('profilePhoto'), uploadProfilePhoto);
router.delete('/photo', authenticate, removeProfilePhoto);

module.exports = router;
