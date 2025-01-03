const cors = require("cors");
const express = require('express');
const { registerUser, loginUser, googleSignIn } = require('../Controller/setup');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleSignIn);

module.exports = router;
