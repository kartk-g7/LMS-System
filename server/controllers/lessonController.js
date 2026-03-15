const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const axios = require('axios');

// Fetch YouTube video details via API
const fetchYouTubeDetails = async (youtubeId) => {
  try {
    const apiKey = process.env.YOUTUBE_KEY;
    if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY') return null;
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${youtubeId}&key=${apiKey}`;
    const response = await axios.get(url);
    if (response.data.items && response.data.items.length > 0) {
      const item = response.data.items[0];
      return {
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || '',
        duration: item.contentDetails.duration,
      };
    }
    return null;
  } catch {
    return null;
  }
};

// @desc  Get lessons for a course
// @route GET /api/lessons/:courseId
// @access Public
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId }).sort({ order: 1 });
    res.json({ success: true, count: lessons.length, lessons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single lesson
// @route GET /api/lessons/single/:id
// @access Public
const getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create lesson
// @route POST /api/lessons
// @access Private (instructor/admin)
const createLesson = async (req, res) => {
  try {
    const { courseId, title, description, order, youtubeId, isFree } = req.body;

    const ytDetails = await fetchYouTubeDetails(youtubeId);

    const lesson = await Lesson.create({
      courseId,
      title: ytDetails?.title || title,
      description: ytDetails?.description || description || '',
      order,
      youtubeId,
      thumbnailUrl: ytDetails?.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
      duration: ytDetails?.duration || '0:00',
      isFree: isFree || false,
    });

    // Update course totalLessons count
    await Course.findByIdAndUpdate(courseId, { $inc: { totalLessons: 1 } });

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update lesson
// @route PUT /api/lessons/:id
// @access Private (instructor/admin)
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete lesson
// @route DELETE /api/lessons/:id
// @access Private (instructor/admin)
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    await Course.findByIdAndUpdate(lesson.courseId, { $inc: { totalLessons: -1 } });
    await lesson.deleteOne();
    res.json({ success: true, message: 'Lesson removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLessons, getLesson, createLesson, updateLesson, deleteLesson };
