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

        const courses = await Course.find({ userId: { $ne: currentUserId } });
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

        const courses = await Course.find({ userId: currentUserId });
        res.status(200).json(courses);
      } catch (error) {
        res.status(500).json({ message: "Error fetching courses", error });
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
  
  };
};
