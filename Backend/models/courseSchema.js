const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  chapterNumber: {
    type: Number,
    required: true,
  },
  chapterName: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const CourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,  // Reference to User model
      ref: 'User',  // Name of the user collection
      required: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: [true, 'Difficulty level is required'],
    },
    duration: {
      type: String, 
      required: [true, 'Course duration is required'],
    },
    noOfChapters: {
      type: Number,
      required: [true, 'Number of chapters is required'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
    },
    chapters: [ChapterSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Courses', CourseSchema);
