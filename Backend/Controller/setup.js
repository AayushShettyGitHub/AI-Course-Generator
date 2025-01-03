require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Schema = require('../models/schema');
const { OAuth2Client } = require('google-auth-library');

const clientID = process.env.GOOGLE_CLIENT_ID;
const jwtSecret = process.env.JWT_SECRET;
const client = new OAuth2Client(clientID);

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = new Schema({ name, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Schema.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: 'Login failed', details: err.message });
  }
};

exports.googleSignIn = async (req, res) => {
  const { googleToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    // Check if the user already exists
    let user = await Schema.findOne({ email });

    if (!user) {
      // Create a new user for Google Sign-In
      const newUser = new Schema({
        name,
        email,
        googleId: payload.sub,
        profileImage: picture,
      });

      user = await newUser.save(); // Save the new user
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: 'Failed to authenticate with Google', details: err.message });
  }
};
