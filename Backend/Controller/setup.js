require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const { sendResetEmail } = require('../config/sendMail');
const { generateToken } = require('../config/utils');
const { uploadImageToCloudinary } = require('./cloudinary');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Schema = require('../models/schema');
const crypto = require('crypto');

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await Schema.findOne({ email });
    if (!user || user.resetOTP !== otp || Date.now() > user.resetOTPExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    res
      .cookie('resetToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 10 * 60 * 1000,
      })
      .status(200)
      .json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Schema.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    await sendResetEmail(email, otp);
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const token = req.cookies.resetToken;

  if (!token) {
    return res.status(400).json({ message: 'Reset token missing or expired. Verify OTP again.' });
  }

  try {
    const user = await Schema.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;

    await user.save();

    res.clearCookie('resetToken');
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await Schema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new Schema({ name, email, password });
    await user.save();

    const token = generateToken(user._id, res);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const {
    name,
    email,
    age,
    profileImage,
    description,
    nationality,
    address,
    phone,
    interest,
    profession,
  } = req.body;

  try {
    // Priority: use req.userId from auth middleware, fallback to email
    const query = req.userId ? { _id: req.userId } : { email };

    if (!query._id && !query.email) {
      return res.status(400).json({ message: 'User identifier (email or ID) is required' });
    }

    const user = await Schema.findOne(query);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (age) user.age = age;
    if (description) user.description = description;
    if (nationality) user.nationality = nationality;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    if (interest) user.interest = interest;
    if (profession) user.profession = profession;

    // Only upload to Cloudinary if it's a new image (base64 data URL)
    if (profileImage && profileImage.startsWith('data:image')) {
      try {
        const uploadedImageUrl = await uploadImageToCloudinary(profileImage);
        user.profileImage = uploadedImageUrl;
      } catch (error) {
        console.error('Cloudinary upload error in updateUser:', error);
        return res.status(500).json({ message: 'Image upload failed', error: error.message });
      }
    } else if (profileImage === "") {
      user.profileImage = ""; // Allow clearing the profile image
    }

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        profileImage: user.profileImage,
        description: user.description,
        nationality: user.nationality,
        address: user.address,
        phone: user.phone,
        interest: user.interest,
        profession: user.profession,
      },
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
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
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.googleSignIn = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await Schema.findOne({ email });

    if (!user) {
      user = new Schema({
        googleId,
        email,
        name,
        profileImage: picture,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.profileImage) user.profileImage = picture;
      await user.save();
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(400).json({ error: 'Google sign-in failed', details: error.message });
  }
};

