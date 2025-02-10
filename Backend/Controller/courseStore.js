const Course = require('../models/courseSchema');

exports.saveCourse = async (req, res) => {
    try {
        const { userId, courseName, category, chapters, description, difficulty, duration, noOfChapters, topic } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (!Array.isArray(chapters)) {
            return res.status(400).json({ message: 'Chapters must be an array' });
        }

        for (let i = 0; i < chapters.length; i++) {
            if (!chapters[i].chapterNumber || !chapters[i].chapterName) {
                return res.status(400).json({ message: `Chapter ${i + 1} is missing chapterNumber or chapterName` });
            }
        }

        const course = new Course({
            userId, 
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


exports.getCourse = async (req, res) => {
  try {
      const { userId } = req.params;

      if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
      }

      const courses = await Course.find({ userId }).populate('userId', 'name email');

      if (courses.length === 0) {
          return res.status(404).json({ message: "No courses found for this user" });
      }

      res.status(200).json(courses);
  } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Server error while fetching courses", error: error.message });
  }
};

