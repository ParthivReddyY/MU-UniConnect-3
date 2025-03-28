const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Won't be returned in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'clubHead', 'admin'],
    default: 'student'
  },
  department: {
    type: String,
    required: function() { 
      return this.role === 'faculty'; 
    }
  },
  studentId: {
    type: String,
    required: function() { 
      return this.role === 'student'; 
    },
    unique: function() { 
      return this.role === 'student'; 
    }
  },
  clubManaging: {
    type: String,
    required: function() {
      return this.role === 'clubHead';
    }
  },
  profileImage: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords - Adding logging for debugging
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    console.error('User has no password set, cannot compare');
    return false;
  }
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`Password comparison result: ${isMatch ? 'Match' : 'No match'}`);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Method to generate JWT
UserSchema.methods.createJWT = function() {
  // Log the user data being used for the token
  console.log('Creating JWT with user data:', {
    userId: this._id,
    name: this.name,
    role: this.role,
    email: this.email
  });
  
  return jwt.sign(
    { userId: this._id, name: this.name, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

module.exports = mongoose.model('User', UserSchema);
