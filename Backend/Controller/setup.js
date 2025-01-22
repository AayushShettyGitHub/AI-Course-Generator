require('dotenv').config();

const { generateToken } = require('../config/utils');
const { uploadImageToCloudinary } = require('./cloudinary');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Schema = require('../models/schema');
const { OAuth2Client } = require('google-auth-library');

const clientID = process.env.GOOGLE_CLIENT_ID;
const jwtSecret = process.env.JWT_SECRET;
const client = new OAuth2Client(clientID);

exports.registerUser = async (req, res) => {
  const { name, email, password} = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await Schema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let imageUrl = 'https://images.unsplash.com/photo-1563279495-cd1cf39e7a1b';
    if (profileImage) {
      imageUrl = await uploadImageToCloudinary(profileImage);
    }

    // Create a new user instance with the uploaded image
    const user = new Schema({ name, email, password });

    // Save the new user to the database (hashing happens automatically via pre-save middleware)
    await user.save();

    // Generate a JWT token
    const token = generateToken(user._id, res);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err.message });
  }
};
/*
{
  "name": "Janer Doe",
  "email": "janer.doe@example.com",
  "password": "securepassword123",
  "age": 28,
  "profileImage": "https://picsum.photos/200/300" 
}*/
 exports.updateUser = async (req, res) => {
  const { name, email, age, profileImage } = req.body;
  try {
    // Check if the user exists in the database by their email
    const user = await Schema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (age) user.age = age;

    // Handle profile image upload if provided
    if (profileImage) {
      try {
        const uploadedImageUrl = await uploadImageToCloudinary(profileImage);
        user.profileImage = uploadedImageUrl; 
      } catch (error) {
        return res.status(500).json({ message: 'Image upload failed', error: error.message });
      }
    }

    // Save the updated user document to the database
    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        name: user.name,
        email: user.email,
        age: user.age,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
 }  

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

    const token = generateToken(user._id, res);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    res.status(400).json({ error: 'Login failed', details: err.message });
  }
};

exports.logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
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

    
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: 'Failed to authenticate with Google', details: err.message });
  }
};
