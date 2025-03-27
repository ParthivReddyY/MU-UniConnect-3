const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [
      /^\S+@\S+\.\S+$/,
      'Please provide a valid email'
    ]
  },
  emails: {
    type: [String],
    default: []
  },
  designation: {
    type: String,
    required: [true, 'Designation is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  cabinLocation: {
    type: String
  },
  freeTimings: {
    type: String
  },
  overview: {
    type: String
  },
  image: {
    type: String
  },
  // Simple string for education
  education: {
    type: String
  },
  // Simple string for work experience
  workExperience: {
    type: String
  },
  // Updated to simple string for publications
  publications: {
    type: String
  },
  projects: [{
    title: String,
    description: String,
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'On Hold', 'Planning'],
      default: 'In Progress'
    },
    timeline: String
  }],
  research: {
    type: String
  },
  mobileNumber: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
