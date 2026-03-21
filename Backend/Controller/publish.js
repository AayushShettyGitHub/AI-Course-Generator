const Course = require("../models/publishSchema");

module.exports = (io) => {
  return {
    deleteCourse: async (req, res) => {
      try {
        const { courseId } = req.params;
    
        if (!courseId) {
          return res.status(400).json({ message: "Course ID is required" });
        }
    
        const deletedCourse = await Course.findByIdAndDelete(courseId);
    
        if (!deletedCourse) {
          return res.status(404).json({ message: "Course not found" });
        }
    
        io.emit("courseDeleted", courseId);
        res.status(200).json({ message: "Course deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error deleting course", error });
      }
    },
    
    getCoursesByOtherUsers: async (req, res) => {
      try {
        const currentUserId = req.query.userId;
        if (!currentUserId) {
          return res.status(400).json({ message: "User ID is required" });
        }

        const courses = await Course.find({ userId: { $ne: currentUserId } }).populate('userId', 'name email');
        res.status(200).json(courses);
      } catch (error) {
        res.status(500).json({ message: "Error fetching courses", error });
      }
    },

    getCoursesByCurrentUser: async (req, res) => {
      try {
        const currentUserId = req.query.userId;
        if (!currentUserId) {
          return res.status(400).json({ message: "User ID is required" });
        }

        const courses = await Course.find({ userId: currentUserId }).populate('userId', 'name email');
        res.status(200).json(courses);
      } catch (error) {
        res.status(500).json({ message: "Error fetching courses", error });
      }
    },

    incrementViews: async (req, res) => {
      try {
        const { courseId } = req.body;
        const course = await Course.findByIdAndUpdate(courseId, { $inc: { views: 1 } }, { new: true });
        res.status(200).json({ views: course.views });
      } catch (error) {
        res.status(500).json({ message: "Error incrementing views", error });
      }
    },

    rateCourse: async (req, res) => {
      try {
        const { courseId, userId, rating } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (course.userId.toString() === userId) {
          return res.status(400).json({ message: "You cannot rate your own course" });
        }

        const existingRatingIndex = course.ratings.findIndex(r => r.userId.toString() === userId);
        if (existingRatingIndex > -1) {
          course.ratings[existingRatingIndex].rating = rating;
        } else {
          course.ratings.push({ userId, rating });
        }

        const totalRating = course.ratings.reduce((acc, r) => acc + r.rating, 0);
        course.averageRating = totalRating / course.ratings.length;

        await course.save();
        res.status(200).json({ averageRating: course.averageRating, ratingsCount: course.ratings.length });
      } catch (error) {
        res.status(500).json({ message: "Error rating course", error });
      }
    },

    publishCourse: async (req, res) => {
      try {
          const {
              userId,
              courseName,
              category,
              description,
              difficulty,
              duration,
              noOfChapters,
              topic,
              chapters,
          } = req.body;
  
          if (!userId || !courseName || !category || !description || !difficulty || !duration || !noOfChapters || !topic) {
              return res.status(400).json({ message: "All fields are required" });
          }
  
          const existingCourse = await Course.findOne({ userId, courseName });
  
          if (existingCourse) {
              return res.status(400).json({ message: "Course already published" });
          }
  
          const newCourse = new Course({
              userId,
              courseName,
              category,
              description,
              difficulty,
              duration,
              noOfChapters,
              topic,
              chapters,
          });
  
          await newCourse.save();
  
          io.emit("newCourse", newCourse);
  
          res.status(201).json({ message: "Course published successfully", course: newCourse });
      } catch (error) {
          res.status(500).json({ message: "Error publishing course", error });
      }
  },
  
    updatePublishedChapter: async (req, res) => {
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

        res.status(200).json({ message: "Published chapter updated successfully", chapter });
      } catch (error) {
        console.error("Error updating published chapter:", error);
        res.status(500).json({ message: "Server error while updating published chapter", error: error.message });
      }
    },
  };
};
