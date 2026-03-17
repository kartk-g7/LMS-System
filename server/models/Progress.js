const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      // References an _id inside Course.lessons subdocument array
      required: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'completed',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate progress records
progressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
