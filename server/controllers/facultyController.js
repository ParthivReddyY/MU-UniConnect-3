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

// Create new faculty
const createFaculty = async (req, res) => {
  try {
    // Extract basic information for user account
    const { name, emails, school } = req.body;
    
    // Use the first email as primary email for account
    const primaryEmail = emails[0];
    
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
    
    // Create faculty record
    const faculty = new Faculty({
      ...req.body,
      email: primaryEmail // Set primary email
    });
    
    await faculty.save();
    
    // Generate default password (email username + @MU)
    const emailUsername = primaryEmail.split('@')[0];
    const defaultPassword = `${emailUsername}@MU`;
    
    // Create user account for faculty
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    
    const newUser = new User({
      name,
      email: primaryEmail,
      password: hashedPassword,
      role: 'faculty',
      department: school
    });
    
    await newUser.save();
    
    res.status(201).json({
      _id: faculty._id,
      name: faculty.name,
      email: faculty.email,
      message: 'Faculty created successfully with user account'
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
