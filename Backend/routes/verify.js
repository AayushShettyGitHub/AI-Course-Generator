const { authenticate } = require("../middleware/protect");
const express = require('express');
const { registerUser,updateUser, loginUser, googleSignIn ,logout} = require('../Controller/setup');
const{getData} = require('../Controller/getData')
const { generateLayout,generateContent} = require("../services/AiModel");
const{saveCourse,getCourse} = require('../Controller/courseStore')
const {getVideo} = require('../Controller/getVideo')

const router = express.Router();



router.get("/protected-route", authenticate, (req, res) => {
  res.status(200).json({ message: "Welcome to the protected route!" });
});

router.get("/getUser",getData)
router.get("/getCourse/:userId",getCourse)
router.post('/register', registerUser);
router.post('/update', updateUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.post('/google', googleSignIn);
router.post('/geminiLayout', generateLayout);
router.post('/geminiContent', generateContent);
router.post("/saveCourse",saveCourse)
router.post('/getVideo', getVideo);

module.exports = router;
