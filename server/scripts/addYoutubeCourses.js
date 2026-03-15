require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

const YOUTUBE_VIDEOS = ['GQS7wPujL2k', 'e_dv7GBHka8'];

async function addYoutubeCourses() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set in .env');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // Finding an instructor to associate the courses with (schema requires it)
    let instructor = await User.findOne({ role: 'admin' });
    if (!instructor) instructor = await User.findOne();

    if (!instructor) {
      throw new Error('No users found in the database. Run seed script first.');
    }

    for (const videoId of YOUTUBE_VIDEOS) {
      const existingCourse = await Course.findOne({ youtubeVideoId: videoId });
      if (existingCourse) {
        console.log(`Course already exists for video ID: ${videoId}`);
        continue;
      }

      const title = "YouTube Programming Course";
      const description = "Programming tutorial imported from YouTube";
      const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      // Insert course
      const course = await Course.create({
        title: title,
        description: description,
        thumbnail: thumbnail,
        category: "Programming",
        level: "Beginner",
        tags: ["youtube", "Programming"],
        youtubeVideoId: videoId,
        isPublished: true,
        instructor: instructor._id,
        instructorName: instructor.name,
        totalLessons: 1
      });

      // Insert matching lesson so the course is playable
      await Lesson.create({
        courseId: course._id,
        title: title,
        description: description,
        youtubeId: videoId,
        thumbnailUrl: thumbnail,
        order: 1,
        isFree: true
      });

      console.log(`Course added successfully: ${course.title} (${videoId})`);
    }

    await mongoose.disconnect();
    console.log('✅ Import complete.');
  } catch (error) {
    console.error('❌ Error adding YouTube courses:', error.message);
    mongoose.disconnect();
    process.exit(1);
  }
}

addYoutubeCourses();
