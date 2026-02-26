const express = require("express");
const { authenticate } = require("../middleware/protect");
const { registerUser, updateUser, loginUser, googleSignIn, logout } = require("../Controller/setup");
const { getData } = require("../Controller/getData");
const { generateLayout, generateContent } = require("../services/AiModel");
const { generateQuiz } = require("../services/Quiz");
const { saveCourse, getCourse, deleteCourse } = require("../Controller/courseStore");
const { getVideo } = require("../Controller/getVideo");

const router = express.Router();

router.get("/protected-route", (req, res) => {
  res.status(200).json({ message: "Welcome to the protected route!" });
});

router.use(authenticate);

router.get("/getUser", getData);
router.get("/getCourse/:userId", getCourse);
router.post("/update", updateUser);
router.post("/geminiLayout", generateLayout);
router.post("/geminiContent", generateContent);
router.post("/quiz", generateQuiz);
router.post("/saveCourse", saveCourse);
router.post("/getVideo", getVideo);
router.delete("/deleteCourse/:courseId", deleteCourse);

module.exports = router;
