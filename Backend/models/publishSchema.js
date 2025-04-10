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

const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  duration: {
    type: Number, 
    required: true,
  },
  noOfChapters: {
    type: Number,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  chapters: [ChapterSchema], 
}, {
  timestamps: true,
});

const Course = mongoose.model('CoursePublish', courseSchema);

module.exports = Course;
