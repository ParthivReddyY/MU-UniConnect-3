const Faculty = require('../models/Faculty');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all faculty
const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().select('-__v');
    res.status(200).json(faculty);
  } catch (error) {
    console.error('Error in getAllFaculty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get faculty by ID
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).select('-__v');
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(200).json(faculty);
  } catch (error) {
    console.error('Error in getFacultyById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new faculty - The function is correct, just adding extra logging
const createFaculty = async (req, res) => {
  try {
    // Extract basic information for user account
    const { name, emails, school, password } = req.body;
    
    // Validate that emails array exists and has at least one email
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'At least one email address is required' });
    }
    
    // Use the first email as primary email for account
    const primaryEmail = emails[0];
    
    // Additional validation for email
    if (!primaryEmail) {
      return res.status(400).json({ message: 'Primary email is required' });
    }
    
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(primaryEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if faculty with this email already exists
    const existingFaculty = await Faculty.findOne({ email: primaryEmail });
    if (existingFaculty) {
      return res.status(400).json({ message: 'Faculty with this email already exists' });
    }
    
    // Check if user account with this email already exists
    const existingUser = await User.findOne({ email: primaryEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User account with this email already exists' });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Create faculty record
    const faculty = new Faculty({
      ...req.body,
      email: primaryEmail // Set primary email
    });
    
    await faculty.save();
    
    // Create user account for faculty - DO NOT HASH PASSWORD HERE
    // Let the User model's pre-save middleware handle hashing
    const user = await User.create({
      name,
      email: emails[0], // Primary email
      role: 'faculty',
      department: school,
      password // Pass plaintext password - it will be hashed by the pre-save hook
      // Removed forcePasswordChange flag
    });
    
    console.log(`Creating user account for faculty: ${name}, email: ${primaryEmail}`);
    
    console.log(`Faculty user account created successfully: ${primaryEmail}`);
    
    res.status(201).json({
      _id: faculty._id,
      name: faculty.name,
      email: faculty.email,
      message: 'Faculty created successfully. A user account has been created.'
    });
  } catch (error) {
    console.error('Error in createFaculty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update faculty
const updateFaculty = async (req, res) => {
  try {
    const facultyId = req.params.id;
    
    // Check if faculty exists
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    // Check permissions (admin can edit any, faculty can only edit their own)
    if (req.user.role !== 'admin' && req.user.email !== faculty.email) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    // If primary email is changing, update user account too
    if (req.body.emails && req.body.emails[0] !== faculty.email) {
      const user = await User.findOne({ email: faculty.email });
      if (user) {
        user.email = req.body.emails[0];
        await user.save();
      }
    }
    
    // Update faculty record
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      facultyId,
      { 
        ...req.body,
        email: req.body.emails[0] // Update primary email
      },
      { new: true }
    );
    
    res.status(200).json(updatedFaculty);
  } catch (error) {
    console.error('Error in updateFaculty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete faculty
const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    // Delete faculty record
    await Faculty.findByIdAndDelete(req.params.id);
    
    // Delete associated user account
    await User.findOneAndDelete({ email: faculty.email });
    
    res.status(200).json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Error in deleteFaculty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
};
