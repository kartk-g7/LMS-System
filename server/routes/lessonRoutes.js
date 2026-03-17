const express = require('express');
const router = express.Router();
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/single/:id', getLesson);   // ← must be before /:courseId (specific before wildcard)
router.get('/:courseId', getLessons);
router.post('/', protect, authorize('instructor', 'admin'), createLesson);
router.put('/:id', protect, authorize('instructor', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteLesson);

module.exports = router;
