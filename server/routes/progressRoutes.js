const express = require('express');
const router = express.Router();
const { updateProgress, getProgress, getLastWatched, getMyStats } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.post('/update', protect, updateProgress);
// Specific named routes MUST come before wildcard /:userId
router.get('/stats/me', protect, getMyStats);
router.get('/last/:courseId', protect, getLastWatched);
router.get('/:userId', protect, getProgress);

module.exports = router;
