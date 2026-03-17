const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    duration: {
      type: String,
      default: '0h 0m',
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    lessons: [
      {
        title: { type: String, required: true },
        videoId: { type: String, required: true },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
