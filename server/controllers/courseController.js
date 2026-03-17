const Course = require('../models/Course');
const User = require('../models/User');

// @desc  Get all published courses
// @route GET /api/courses
// @access Public
const getCourses = async (req, res) => {
  try {
    const { search, category, level } = req.query;

    // Debug log — visible in your server terminal
    console.log('Search query:', req.query);

    // Include courses that are explicitly published OR have no isPublished field at all
    // (covers seed data inserted without the field)
    let filter = {
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }],
    };

    // Keyword search across title, description, category, and tags
    if (search) {
      filter.$and = [
        {
          $or: [
            { title:       { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { category:    { $regex: search, $options: 'i' } },
            { tags:        { $in: [new RegExp(search, 'i')] } },
          ],
        },
      ];
    }

    // Exact-match filters
    if (category) filter.category = category;
    if (level)    filter.level    = level;

    // Debug log — shows the final MongoDB filter being used
    console.log('Mongo filter:', JSON.stringify(filter, null, 2));

    const courses = await Course.find(filter)
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error('getCourses error:', error.message);
    res.status(500).json({ message: error.message });
  }
};


// @desc  Get single course by ID
// @route GET /api/courses/:id
// @access Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name avatar');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a new course
// @route POST /api/courses
// @access Private (instructor/admin)
const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, category, level, tags, lessons } = req.body;
    const course = await Course.create({
      title,
      description,
      thumbnail,
      category,
      level,
      tags,
      lessons: lessons || [],
      totalLessons: (lessons || []).length,
      instructor: req.user._id,
      instructorName: req.user.name,
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update a course
// @route PUT /api/courses/:id
// @access Private (instructor/admin)
const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    if (req.body.lessons) {
      req.body.totalLessons = req.body.lessons.length;
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a course
// @route DELETE /api/courses/:id
// @access Private (instructor/admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await course.deleteOne();
    res.json({ success: true, message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Enroll in a course
// @route POST /api/courses/:id/enroll
// @access Private
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // enrolledCourses contains ObjectIds — must convert to string for comparison
    const alreadyEnrolled = (user.enrolledCourses || []).some(
      (id) => id.toString() === req.params.id
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Use $addToSet to atomically add and prevent duplicates;
    // avoids triggering the bcrypt pre-save hook that runs on user.save()
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { enrolledCourses: req.params.id } },
      { new: true, select: 'enrolledCourses' }
    );

    course.enrolledCount += 1;
    await course.save();

    res.json({
      success: true,
      message: 'Enrolled successfully',
      enrolledCourses: updatedUser.enrolledCourses,
    });
  } catch (error) {
    console.error('enrollCourse error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse };
