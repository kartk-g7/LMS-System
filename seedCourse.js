require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./server/models/Course');
const User = require('./server/models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Find any user to hold instructor role
    let instructor = await User.findOne({ role: { $in: ['instructor', 'admin'] } });
    if (!instructor) {
      instructor = await User.findOne(); // fallback
    }

    if (!instructor) {
      console.error('No users found in DB to assign as instructor!');
      process.exit(1);
    }

    console.log(`Using instructor: ${instructor.name} (${instructor._id})`);

    const sqlCourse = {
      title: "SQL Full Course",
      description: "Complete SQL learning from basics to advanced queries.",
      thumbnail: "https://img.youtube.com/vi/GQS7wPujL2k/hqdefault.jpg",
      category: "Database",
      level: "Beginner",
      duration: "6 hours",
      tags: ["sql", "database", "mysql"],
      instructor: instructor._id,
      instructorName: instructor.name,
      totalLessons: 3,
      lessons: [
        { title: "Intro to SQL", videoId: "GQS7wPujL2k" },
        { title: "Joins Explained", videoId: "3m0TXas0Vjw" },
        { title: "Advanced Queries", videoId: "t_ispmWmdjY" }
      ]
    };

    const course = await Course.create(sqlCourse);
    console.log('Course seeded successfully:', course.title, course._id);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
