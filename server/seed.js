require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await Course.deleteMany();
  await Lesson.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@lms.com',
    password: 'admin123',
    role: 'admin',
  });

  const instructor1 = await User.create({
    name: 'Sarah Johnson',
    email: 'sarah@lms.com',
    password: 'password123',
    role: 'instructor',
  });

  const instructor2 = await User.create({
    name: 'Michael Chen',
    email: 'michael@lms.com',
    password: 'password123',
    role: 'instructor',
  });

  const student = await User.create({
    name: 'Alex Rodriguez',
    email: 'alex@lms.com',
    password: 'student123',
    role: 'student',
  });

  console.log('👥 Created users');

  // Create courses
  const course1 = await Course.create({
    title: 'Complete JavaScript Masterclass',
    description: 'Learn JavaScript from zero to hero. This comprehensive course covers everything from basics to advanced ES6+ features, async programming, and modern JavaScript patterns used in real-world applications.',
    thumbnail: 'https://img.youtube.com/vi/K5KVEU3aaeQ/maxresdefault.jpg',
    instructor: instructor1._id,
    instructorName: instructor1.name,
    category: 'Programming',
    level: 'Beginner',
    duration: '12h 30m',
    totalLessons: 4,
    enrolledCount: 1250,
    rating: 4.8,
    isPublished: true,
    tags: ['javascript', 'web development', 'programming', 'es6'],
  });

  const course2 = await Course.create({
    title: 'React.js - The Complete Guide',
    description: 'Master React.js with hooks, context API, Redux, and build real-world projects. Learn component architecture, state management, performance optimization, and deployment strategies.',
    thumbnail: 'https://img.youtube.com/vi/hlGoQC332VM/maxresdefault.jpg',
    instructor: instructor2._id,
    instructorName: instructor2.name,
    category: 'Frontend',
    level: 'Intermediate',
    duration: '18h 45m',
    totalLessons: 4,
    enrolledCount: 3420,
    rating: 4.9,
    isPublished: true,
    tags: ['react', 'javascript', 'frontend', 'hooks'],
  });

  const course3 = await Course.create({
    title: 'Node.js & Express Backend Development',
    description: 'Build scalable backend applications with Node.js and Express. Learn REST APIs, authentication with JWT, database integration with MongoDB, and best practices for production deployments.',
    thumbnail: 'https://img.youtube.com/vi/D1eL1EnxXXQ/maxresdefault.jpg',
    instructor: instructor1._id,
    instructorName: instructor1.name,
    category: 'Backend',
    level: 'Intermediate',
    duration: '15h 20m',
    totalLessons: 4,
    enrolledCount: 890,
    rating: 4.7,
    isPublished: true,
    tags: ['nodejs', 'express', 'backend', 'api', 'mongodb'],
  });

  const course4 = await Course.create({
    title: 'Python for Data Science & Machine Learning',
    description: 'Dive into data science with Python. Master NumPy, Pandas, Matplotlib, and Scikit-learn. Build real machine learning models and data visualization dashboards.',
    thumbnail: 'https://img.youtube.com/vi/SyVMma1IkXM/maxresdefault.jpg',
    instructor: instructor2._id,
    instructorName: instructor2.name,
    category: 'Data Science',
    level: 'Advanced',
    duration: '22h 10m',
    totalLessons: 4,
    enrolledCount: 2100,
    rating: 4.6,
    isPublished: true,
    tags: ['python', 'data science', 'machine learning', 'ai'],
  });

  console.log('📚 Created courses');

  // Create lessons for course 1
  await Lesson.insertMany([
    { courseId: course1._id, title: 'JavaScript Introduction & Setup', order: 1, youtubeId: 'K5KVEU3aaeQ', thumbnailUrl: 'https://img.youtube.com/vi/K5KVEU3aaeQ/mqdefault.jpg', isFree: true },
    { courseId: course1._id, title: 'Variables, Data Types & Operators', order: 2, youtubeId: 'hlGoQC332VM', thumbnailUrl: 'https://img.youtube.com/vi/hlGoQC332VM/mqdefault.jpg' },
    { courseId: course1._id, title: 'Functions & Scope in JavaScript', order: 3, youtubeId: 'D1eL1EnxXXQ', thumbnailUrl: 'https://img.youtube.com/vi/D1eL1EnxXXQ/mqdefault.jpg' },
    { courseId: course1._id, title: 'ES6+ Modern JavaScript Features', order: 4, youtubeId: 'SyVMma1IkXM', thumbnailUrl: 'https://img.youtube.com/vi/SyVMma1IkXM/mqdefault.jpg' },
  ]);

  // Create lessons for course 2
  await Lesson.insertMany([
    { courseId: course2._id, title: 'React Fundamentals & JSX', order: 1, youtubeId: 'K5KVEU3aaeQ', thumbnailUrl: 'https://img.youtube.com/vi/K5KVEU3aaeQ/mqdefault.jpg', isFree: true },
    { courseId: course2._id, title: 'Components, Props & State', order: 2, youtubeId: 'hlGoQC332VM', thumbnailUrl: 'https://img.youtube.com/vi/hlGoQC332VM/mqdefault.jpg' },
    { courseId: course2._id, title: 'React Hooks Deep Dive', order: 3, youtubeId: 'D1eL1EnxXXQ', thumbnailUrl: 'https://img.youtube.com/vi/D1eL1EnxXXQ/mqdefault.jpg' },
    { courseId: course2._id, title: 'Context API & State Management', order: 4, youtubeId: 'SyVMma1IkXM', thumbnailUrl: 'https://img.youtube.com/vi/SyVMma1IkXM/mqdefault.jpg' },
  ]);

  // Create lessons for course 3
  await Lesson.insertMany([
    { courseId: course3._id, title: 'Introduction to Node.js', order: 1, youtubeId: 'D1eL1EnxXXQ', thumbnailUrl: 'https://img.youtube.com/vi/D1eL1EnxXXQ/mqdefault.jpg', isFree: true },
    { courseId: course3._id, title: 'Express.js & REST APIs', order: 2, youtubeId: 'SyVMma1IkXM', thumbnailUrl: 'https://img.youtube.com/vi/SyVMma1IkXM/mqdefault.jpg' },
    { courseId: course3._id, title: 'MongoDB & Mongoose ORM', order: 3, youtubeId: 'K5KVEU3aaeQ', thumbnailUrl: 'https://img.youtube.com/vi/K5KVEU3aaeQ/mqdefault.jpg' },
    { courseId: course3._id, title: 'JWT Authentication & Security', order: 4, youtubeId: 'hlGoQC332VM', thumbnailUrl: 'https://img.youtube.com/vi/hlGoQC332VM/mqdefault.jpg' },
  ]);

  // Create lessons for course 4
  await Lesson.insertMany([
    { courseId: course4._id, title: 'Python Basics for Data Science', order: 1, youtubeId: 'SyVMma1IkXM', thumbnailUrl: 'https://img.youtube.com/vi/SyVMma1IkXM/mqdefault.jpg', isFree: true },
    { courseId: course4._id, title: 'NumPy & Pandas Fundamentals', order: 2, youtubeId: 'K5KVEU3aaeQ', thumbnailUrl: 'https://img.youtube.com/vi/K5KVEU3aaeQ/mqdefault.jpg' },
    { courseId: course4._id, title: 'Data Visualization with Matplotlib', order: 3, youtubeId: 'hlGoQC332VM', thumbnailUrl: 'https://img.youtube.com/vi/hlGoQC332VM/mqdefault.jpg' },
    { courseId: course4._id, title: 'Machine Learning with Scikit-learn', order: 4, youtubeId: 'D1eL1EnxXXQ', thumbnailUrl: 'https://img.youtube.com/vi/D1eL1EnxXXQ/mqdefault.jpg' },
  ]);

  // Enroll student in course1 and course2
  student.enrolledCourses.push(course1._id, course2._id);
  await student.save();

  console.log('📖 Created lessons');
  console.log('\n✅ Database seeded successfully!\n');
  console.log('🔐 Test Accounts:');
  console.log('   Admin:      admin@lms.com      / admin123');
  console.log('   Instructor: sarah@lms.com      / password123');
  console.log('   Instructor: michael@lms.com    / password123');
  console.log('   Student:    alex@lms.com       / student123\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
