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
  lastLogin: Date,
  dateOfBirth: {
    type: Date,
    // Not required but useful for students
  },
  school: {
    type: String,
    // Optional field for academic information
  },
  program: {
    type: String,
    // Optional field for academic information
  },
  accommodationType: {
    type: String,
    enum: ['dayScholar', 'hosteller', ''],
    default: ''
  },
  yearOfJoining: {
    type: String,
    // Store as String to make comparisons easier
    // Not required but recommended for students
    validate: {
      validator: function(val) {
        // If empty, that's fine
        if (!val) return true;
        
        // Otherwise it should be a valid year
        const year = parseInt(val, 10);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && 
               year >= 1990 && 
               year <= currentYear;
      },
      message: props => `${props.value} is not a valid year!`
    }
  }
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

// Add an enhanced search method to properly return studentId
UserSchema.statics.searchStudents = async function(query, limit = 10, currentUserId) {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    console.log(`Searching students with query: ${query}, limit: ${limit}`);
    
    // Only return student users for team formation
    const users = await this.find({
      role: 'student',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { studentId: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name email studentId department')
    .limit(parseInt(limit))
    .lean();
    
    console.log('Search found users:', users.length);
    
    // Log the fields to verify studentId is included
    if (users.length > 0) {
      console.log('Sample user fields:', Object.keys(users[0]));
    }
    
    // Don't include the current user in results if provided
    const filteredUsers = currentUserId 
      ? users.filter(user => user._id.toString() !== currentUserId.toString())
      : users;
    
    return filteredUsers;
  } catch (err) {
    console.error('Error in user search:', err);
    return [];
  }
};

module.exports = mongoose.model('User', UserSchema);
