const mongoose = require('mongoose');

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
  chapters: [
    {
      title: String,
      content: String,
    },
  ],
}, {
  timestamps: true,
});

const Course = mongoose.model('CoursePublish', courseSchema);

module.exports = Course;
