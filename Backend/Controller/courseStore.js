const Course= require('../models/courseSchema');

exports.saveCourse = async (req, res) => {
    try {
        const { courseName, category, chapters, description, difficulty, duration, noOfChapters, topic } = req.body;
        if (!Array.isArray(chapters)) {
          return res.status(400).json({ message: 'Chapters must be an array' });
        }
 
        for (let i = 0; i < chapters.length; i++) {
          if (!chapters[i].chapterNumber || !chapters[i].chapterName) {
            return res.status(400).json({ message: `Chapter ${i + 1} is missing chapterNumber or chapterName` });
          }
        }
  
        const course = new Course({
          courseName,
          category,
          chapters,
          description,
          difficulty,
          duration,
          noOfChapters,
          topic,
        });

        await course.save();

        res.status(201).json({
          message: 'Course created successfully!',
          course,
        });
      } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
          message: 'Server error while creating course',
          error: error.message,
        });
      }
    };