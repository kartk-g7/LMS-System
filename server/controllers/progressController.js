const Progress = require('../models/Progress');
const Course = require('../models/Course'); // changed from Lesson

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

    const progressRecords = await Progress.find(filter);

    // Manual populate for lesson details from Course.lessons array
    const populatedRecords = await Promise.all(progressRecords.map(async (record) => {
      const course = await Course.findById(record.courseId);
      if (!course) return { ...record.toObject(), lessonId: { title: 'Unknown', order: 1 } };

      const lesson = course.lessons.id(record.lessonId);
      const order = course.lessons.findIndex(l => l._id.toString() === record.lessonId.toString()) + 1;

      return {
        ...record.toObject(),
        lessonId: {
          _id: record.lessonId,
          title: lesson ? lesson.title : "Lesson",
          order: order || 1
        }
      };
    }));

    // Calculate percentage per course if courseId is given
    if (courseId) {
      const course = await Course.findById(courseId);
      const totalLessons = course ? course.totalLessons : 0;
      const completedLessons = progressRecords.filter((p) => p.status === 'completed').length;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return res.json({
        success: true,
        progressRecords: populatedRecords,
        completedLessons,
        totalLessons,
        percentage,
      });
    }

    res.json({ success: true, progressRecords: populatedRecords });
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
    }).sort({ lastWatchedAt: -1 });

    if (!lastProgress) return res.json({ success: true, lastProgress: null });

    const course = await Course.findById(req.params.courseId);
    let lessonInfo = { _id: lastProgress.lessonId, title: "Lesson", order: 1 };

    if (course) {
      const lesson = course.lessons.id(lastProgress.lessonId);
      const order = course.lessons.findIndex(l => l._id.toString() === lastProgress.lessonId.toString()) + 1;
      if (lesson) {
        lessonInfo = { _id: lastProgress.lessonId, title: lesson.title, order: order || 1 };
      }
    }

    res.json({
      success: true,
      lastProgress: {
        ...lastProgress.toObject(),
        lessonId: lessonInfo
      }
    });
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
