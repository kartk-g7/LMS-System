require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

const youtubeLinks = [
  "https://youtu.be/D1eL1EnxXXQ",
  "https://youtu.be/xFpOkk2Tm4E",
  "https://youtu.be/RGOj5yH7evk",
  "https://youtu.be/G3e-cpL7ofc",
  "https://youtu.be/ztHopE5Wnpc",
  "https://youtu.be/SSKVgrwhzus",
  "https://youtu.be/mEsleV16qdo",
  "https://youtu.be/GQS7wPujL2k",
  "https://youtu.be/e_dv7GBHka8"
];

function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('?')[0];
    }
    if (u.searchParams.get('v')) {
      return u.searchParams.get('v');
    }
  } catch {
    const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
}

async function importYoutubeCourses() {
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

    for (const url of youtubeLinks) {
      const videoId = extractVideoId(url);
      
      if (!videoId) {
        console.error(`❌ Could not extract video ID from URL: ${url}`);
        continue;
      }

      const existingCourse = await Course.findOne({ youtubeVideoId: videoId });
      if (existingCourse) {
        console.log(`Course already exists: ${videoId}`);
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
        tags: ["youtube", "programming"],
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

      console.log(`Course added: ${videoId}`);
    }

    await mongoose.disconnect();
    console.log('✅ Import complete.');
  } catch (error) {
    console.error('❌ Error adding YouTube courses:', error.message);
    mongoose.disconnect();
    process.exit(1);
  }
}

importYoutubeCourses();
