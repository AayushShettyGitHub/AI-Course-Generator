
const express = require('express');
const { registerUser,updateUser, loginUser, googleSignIn ,logout} = require('../Controller/setup');


const router = express.Router();



router.get("/protected-route", (req, res) => {
  res.status(200).json({ message: "Welcome to the protected route!" });
});


router.post('/register', registerUser);
router.post('/update', updateUser);
router.post('/login', loginUser);
router.post('/google', googleSignIn);


module.exports = router;
