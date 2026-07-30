const express = require('express');
const router = express.Router();
const { getPublicApplication, getApplication, updateApplication } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public', getPublicApplication);
router.get('/', protect, getApplication);
router.put('/', protect, updateApplication);

module.exports = router;
