const { authenticate } = require("../middleware/protect");
const express = require('express');
const { registerUser,updateUser, loginUser, googleSignIn ,logout} = require('../Controller/setup');
const{getData} = require('../Controller/getData')
const router = express.Router();



router.get("/protected-route", authenticate, (req, res) => {
  res.status(200).json({ message: "Welcome to the protected route!" });
});

router.get("/getUser",getData)
router.post('/register', registerUser);
router.post('/update', updateUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.post('/google', googleSignIn);

module.exports = router;
