const express = require("express");
const { authenticate } = require("../middleware/protect");
const { registerUser, updateUser, loginUser, googleSignIn, logout } = require("../Controller/setup");
const { getData } = require("../Controller/getData");
const { generateLayout, generateContent } = require("../services/AiModel");
const { saveCourse, getCourse ,deleteCourse} = require("../Controller/courseStore");
const { getVideo } = require("../Controller/getVideo");

const router = express.Router();

console.log("Loaded AI Model Functions:", { generateContent });

router.get("/protected-route", (req, res) => {
  res.status(200).json({ message: "Welcome to the protected route!" });
});


router.use(authenticate);

router.get("/getUser", getData);
router.get("/getCourse/:userId", getCourse);
router.post("/update", updateUser);
router.post("/geminiLayout", generateLayout);
router.post("/geminiContent", generateContent);
router.post("/saveCourse", saveCourse);
router.post("/getVideo", getVideo);
router.delete("/deleteCourse/:courseId", deleteCourse);

module.exports = (io) => {
  const publish = require("../Controller/publish")(io);

  router.get("/courses/others", publish.getCoursesByOtherUsers);
  router.get("/courses/mine", publish.getCoursesByCurrentUser);
  router.post("/courses/add", publish.publishCourse);
  router.delete("/courses/delete/:courseId", publish.deleteCourse);

  return router;
};
