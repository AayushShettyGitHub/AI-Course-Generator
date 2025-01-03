const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+@.+\..+/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  googleId: {
    type: String, // Used for Google-authenticated users
  },
  profileImage: {
    type: String, // Stores the Google profile image or custom avatar
    default: 'https://example.com/default-avatar.png',
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [13, 'You must be at least 13 years old to sign up'],
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Pre-save middleware for hashing passwords
UserSchema.pre('save', async function (next) {
  // Only hash the password if it is new or modified
  if (this.password && this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare password for login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
const User = mongoose.model('User', UserSchema);
module.exports = User;
