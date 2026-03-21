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
  detailedContent: [
    {
      title: String,
      explanation: String,
      code: String,
    },
  ],
  videos: [
    {
      videoTitle: String,
      videoUrl: String,
    },
  ],
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
  views: {
    type: Number,
    default: 0,
  },
  ratings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Course = mongoose.model('CoursePublish', courseSchema);

module.exports = Course;
