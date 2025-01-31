const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { uploadImageToCloudinary } = require('../Controller/cloudinary'); 
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
    type: String,
  },
  profileImage: {
    type: String,
    default: '',
  },
  age: {
    type: Number,
    min: [18, 'You must be at least 18 years old to sign up'],
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function (next) {
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

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.uploadProfileImage = async function (imagePath) {
  try {
    const result = await uploadImageToCloudinary(imagePath);  
    this.profileImage = result; 
    await this.save();
    return this.profileImage;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error); //check cloudinary ke liye used
    throw new Error('Image upload failed');
  }
};

module.exports = mongoose.model('User', UserSchema);
