const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');

// @desc  Update progress (mark lesson as completed)
// @route POST /api/progress/update
// @access Private
const updateProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const userId = req.user._id;

    // Upsert: create or update progress record
    const progress = await Progress.findOneAndUpdate(
      { userId, courseId, lessonId },
      { status: 'completed', completedAt: Date.now(), lastWatchedAt: Date.now() },
      { new: true, upsert: true }
    );

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get user progress for all courses or a specific course
// @route GET /api/progress/:userId
// @access Private
const getProgress = async (req, res) => {
  try {
    const { courseId } = req.query;
    let filter = { userId: req.params.userId };
    if (courseId) filter.courseId = courseId;

    const progressRecords = await Progress.find(filter).populate('lessonId', 'title order');

    // Calculate percentage per course if courseId is given
    if (courseId) {
      const totalLessons = await Lesson.countDocuments({ courseId });
      const completedLessons = progressRecords.filter((p) => p.status === 'completed').length;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return res.json({
        success: true,
        progressRecords,
        completedLessons,
        totalLessons,
        percentage,
      });
    }

    res.json({ success: true, progressRecords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get last watched lesson for a course
// @route GET /api/progress/last/:courseId
// @access Private
const getLastWatched = async (req, res) => {
  try {
    const lastProgress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
    })
      .sort({ lastWatchedAt: -1 })
      .populate('lessonId');

    res.json({ success: true, lastProgress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get overall stats for authenticated user
// @route GET /api/progress/stats/me
// @access Private
const getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const completed = await Progress.countDocuments({ userId, status: 'completed' });
    const inProgress = await Progress.distinct('courseId', { userId });

    res.json({
      success: true,
      stats: {
        completedLessons: completed,
        coursesInProgress: inProgress.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateProgress, getProgress, getLastWatched, getMyStats };
