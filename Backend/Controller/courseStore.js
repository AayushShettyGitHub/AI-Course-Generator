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

exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required" });
        }

        const deletedCourse = await Course.findByIdAndDelete(courseId);

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Course deleted successfully!" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Server error while deleting course", error: error.message });
    }
}

exports.updateChapter = async (req, res) => {
    try {
        const { courseId, chapterId, detailedContent, videos } = req.body;

        if (!courseId || !chapterId) {
            return res.status(400).json({ message: "Course ID and Chapter ID are required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const chapter = course.chapters.id(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        if (detailedContent) chapter.detailedContent = detailedContent;
        if (videos) chapter.videos = videos;

        await course.save();

        res.status(200).json({ message: "Chapter updated successfully", chapter });
    } catch (error) {
        console.error("Error updating chapter:", error);
        res.status(500).json({ message: "Server error while updating chapter", error: error.message });
    }
};
