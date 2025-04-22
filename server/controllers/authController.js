const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail, TEMPLATES } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Temporary storage for registration data (in production, use Redis or a temporary DB collection)
const pendingRegistrations = new Map();

// Register a new student - first step
const register = async (req, res) => {
  try {
    // Extract all necessary fields
    const { 
      name, email, password, studentId, yearOfJoining,
      dateOfBirth, school, program, department, accommodationType 
    } = req.body;
    
    console.log("Registration request received:", {
      email,
      hasPassword: !!password,
      studentId: studentId || 'Not provided',
      yearOfJoining: yearOfJoining || 'Not provided',
      school: school || 'Not provided',
      program: program || 'Not provided',
      department: department || 'Not provided',
      hasDateOfBirth: !!dateOfBirth,
      accommodationType: accommodationType || 'Not provided'
    });
    
    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Check if student ID already exists
    const studentIdExists = await User.findOne({ studentId });
    if (studentIdExists) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }
    
    // Generate verification OTP (6 digits)
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store user data temporarily with OTP
    pendingRegistrations.set(email, {
      userData: req.body, // This will include all form fields
      verificationOTP,
      otpExpires
    });
    
    // Send verification email with OTP using Brevo template
    try {
      await sendEmail({
        email: email,
        templateId: TEMPLATES.OTP_VERIFICATION,
        params: {
          name: name || email.split('@')[0], // Use name or extract from email
          otp: verificationOTP,
          expiryTime: '10 minutes'
        }
      });
      
      res.status(200).json({
        success: true,
        message: 'Verification code sent to your email. Please verify to complete registration.',
        email: email // Return email for the frontend to use in verification
      });
    } catch (error) {
      console.error('Email sending error:', error);
      // Clean up pending registration on email failure
      pendingRegistrations.delete(email);
      return res.status(500).json({ message: 'Email could not be sent. Please try again.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify OTP and complete registration
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    // Get pending registration data
    const registration = pendingRegistrations.get(email);
    
    if (!registration) {
      return res.status(400).json({ message: 'No pending registration found or session expired' });
    }
    
    // Check if OTP is expired
    if (Date.now() > registration.otpExpires) {
      pendingRegistrations.delete(email);
      return res.status(400).json({ message: 'Verification code has expired' });
    }
    
    // Verify OTP
    if (registration.verificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Create user with verified status
    const userData = registration.userData;
    
    // Simplified log - only log essential information
    console.log(`Creating verified user: ${userData.email}, studentId: ${userData.studentId || 'Not provided'}, role: student`);
    
    const user = await User.create({
      ...userData,
      role: 'student',
      isVerified: true // User is now pre-verified since they completed OTP verification
    });
    
    console.log(`User created with ID: ${user._id}`);
    
    // Send welcome email using Brevo template
    try {
      await sendEmail({
        email: user.email,
        templateId: TEMPLATES.WELCOME,
        params: {
          name: user.name,
          studentId: user.studentId,
          loginLink: `${req.protocol}://${req.get('host')}/login`
        }
      });
    } catch (emailError) {
      // If welcome email fails, log but don't block registration completion
      console.error('Welcome email error:', emailError);
    }
    
    // Clean up pending registration
    pendingRegistrations.delete(email);
    
    res.status(201).json({ 
      success: true, 
      message: 'Email verified and registration completed successfully. You can now log in.' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new user by admin (for faculty and club heads)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, clubManaging } = req.body;
    
    // Validate role - Updated to include 'clubs' role
    if (!['faculty', 'clubHead', 'clubs', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Create user with specified role
    const userData = {
      name,
      email,
      password,
      role,
      isVerified: true // Admin-created accounts are pre-verified
    };
    
    // Add role-specific fields
    if (role === 'faculty') {
      if (!department) {
        return res.status(400).json({ message: 'Department is required for faculty members' });
      }
      userData.department = department;
    } else if (role === 'clubHead' || role === 'clubs') {
      // Updated to handle both clubHead and clubs roles
      if (clubManaging) {
        userData.clubManaging = clubManaging;
      }
      // Note: clubManaging may be updated after club creation, so not requiring it here
    }
    
    console.log('Creating user with data:', {
      name,
      email,
      role,
      department: userData.department || 'N/A',
      clubManaging: userData.clubManaging || 'N/A'
    });
    
    const user = await User.create(userData);
    
    // Return the created user without sending email
    // This allows the frontend to use the user ID for further operations
    res.status(201).json({
      success: true,
      message: `${role} account created successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simplified logging for login attempts
    console.log(`Login attempt for email: ${email}`);
    
    if (!email || !password) {
      console.log(`Login failed: Missing email or password`);
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password',
        errorType: 'MISSING_FIELDS' 
      });
    }

    // Make sure we're selecting all the fields we need including role
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`Login failed: No account found for ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'No account found with this email address',
        errorType: 'EMAIL_NOT_FOUND' 
      });
    }
    
    // Simplified user details log
    console.log('Found user details:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // For users who haven't verified their email
    if (user.isEmailVerified === false) {
      console.log(`Login failed: Email not verified for ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Please verify your email before logging in',
        errorType: 'EMAIL_NOT_VERIFIED' 
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    console.log(`Password comparison result: ${isPasswordCorrect ? 'Match' : 'Mismatch'}`);
    console.log(`Password check result: ${isPasswordCorrect ? 'correct' : 'incorrect'}`);
    
    if (!isPasswordCorrect) {
      console.log(`Login failed: Incorrect password for ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password',
        errorType: 'INVALID_PASSWORD' 
      });
    }

    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    console.log('Creating JWT with user data:', {
      userId: user._id,
      name: user.name,
      role: user.role,
      email: user.email
    });
    const token = user.createJWT();
    
    console.log(`Login successful for: ${email}, role: ${user.role || 'undefined'}`);
    
    // Don't send password in the response
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      department: user.department,
      lastLogin: user.lastLogin
    };

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error("Login error:", error.message);
    
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong during login',
      errorType: 'SERVER_ERROR',
      errorMessage: error.message
    });
  }
};

// Forgot password - sends OTP instead of reset link
const forgotPassword = async (req, res) => {
  try {
    console.log('Forgot password request received:', req.body);
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Generate reset OTP (6 digits)
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetOTP)
      .digest('hex');
    
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    try {
      await sendEmail({
        email: user.email,
        templateId: TEMPLATES.PASSWORD_RESET_OTP,
        params: {
          name: user.name,
          otp: resetOTP,
          expiryTime: '10 minutes'
        }
      });
      
      res.status(200).json({ 
        success: true, 
        message: 'Password reset code sent to your email',
        email: user.email // Return email for OTP verification step
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      
      // Reset the token since email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({ 
        success: false, 
        message: 'Could not send reset email. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your request',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// Verify OTP before password reset
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    // Hash the provided OTP for comparison
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    
    const user = await User.findOne({ 
      email,
      resetPasswordToken: hashedOTP,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // OTP is valid, return success
    res.status(200).json({ 
      success: true, 
      message: 'Code verified successfully. You can now set a new password.',
      email: user.email
    });
  } catch (error) {
    // Add timestamp to error log
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Error verifying reset OTP:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password with OTP verification
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    
    if (!email || !password || !otp) {
      return res.status(400).json({ 
        message: 'Email, password, and verification code are required' 
      });
    }
    
    // Hash the OTP for comparison
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedOTP,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset successful' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user with improved debugging and explicit studentId handling
const getCurrentUser = async (req, res) => {
  try {
    // Simplified logging
    console.log(`Getting user data for ID: ${req.user.userId}`);
    
    // Make sure we select all fields including studentId
    const user = await User.findById(req.user.userId).select('+password +studentId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create the response object explicitly including studentId 
    const responseUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || null,
      department: user.department || '',
      studentId: user.studentId || '', // Ensure we always send a value even if empty
      yearOfJoining: user.yearOfJoining || '',
      clubManaging: user.clubManaging || '',
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      bio: user.bio || '',
      socialLinks: user.socialLinks || {}
    };
    
    res.status(200).json({
      success: true,
      user: responseUser
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Check if email exists (for two-step login)
// Check if email exists (for two-step login)
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }
    
    const user = await User.findOne({ email });
    
    return res.status(200).json({
      exists: !!user,
      email
    });
  } catch (error) {
    console.error('Error in checkEmail:', error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
};
// Request OTP for password change (for logged-in users)
const requestPasswordChangeOTP = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate OTP (6 digits)
    const changePasswordOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store hashed OTP in user document
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(changePasswordOTP)
      .digest('hex');
    
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    try {
      await sendEmail({
        email: user.email,
        templateId: TEMPLATES.PASSWORD_RESET_OTP,
        params: {
          name: user.name,
          otp: changePasswordOTP,
          expiryTime: '10 minutes'
        }
      });
      
      res.status(200).json({ 
        success: true, 
        message: 'Verification code sent to your email',
        email: user.email
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({ 
        success: false,
        message: 'Email could not be sent' 
      });
    }
  } catch (error) {
    console.error('Error sending password change OTP:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending verification code'
    });
  }
};

// Change password with OTP verification
const changePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const userId = req.user.userId;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Hash the OTP for comparison
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    
    // Verify OTP
    if (user.resetPasswordToken !== hashedOTP || user.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }
    
    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing password'
    });
  }
};
// Add this function to handle user search - replaces the route in users.js
const searchUsers = async (req, res) => {
  try {
    console.log(`Search request from user: ${req.user.userId}`);
    const { query, limit = 10 } = req.query;
    
    // Use the static method we added to the User model
    const users = await User.searchStudents(query, limit, req.user.userId); 
    
    if (users.length > 0) {
      const sampleUser = { ...users[0] };
      // Remove sensitive fields before logging
      delete sampleUser.password;
      console.log('Sample search result:', sampleUser);
    }
    
    // Mapped version that explicitly includes studentId
    const mappedUsers = users.map(user => ({
      _id: user._id,
      name: user.name || '',
      email: user.email || '',
      studentId: user.studentId || '',
      department: user.department || ''
    }));
    
    res.json(mappedUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Add a new function to update user profile including studentId
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Fields that can be updated
    const updateableFields = [
      'name',
      'studentId',
      'yearOfJoining',
      'department',
      'bio',
      'mobileNumber',
      'socialLinks',
      'profileImage'
    ];
    
    // Update allowed fields
    updateableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Only log important field changes
        if (['studentId', 'yearOfJoining'].includes(field)) {
          console.log(`Updating ${field} for user ${userId}: '${user[field] || 'none'}' -> '${req.body[field]}'`);
        }
        
        // Handle nested fields like socialLinks
        if (field === 'socialLinks' && typeof req.body[field] === 'object') {
          user.socialLinks = {
            ...user.socialLinks,
            ...req.body[field]
          };
        } else {
          user[field] = req.body[field];
        }
      }
    });
    
    // Save the updated user
    await user.save();
    
    // Create a sanitized user object for response
    const responseUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      department: user.department,
      studentId: user.studentId,
      yearOfJoining: user.yearOfJoining,
      bio: user.bio,
      mobileNumber: user.mobileNumber,
      socialLinks: user.socialLinks,
      clubManaging: user.clubManaging,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: responseUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating your profile',
      error: error.message
    });
  }
};

// Add a function to update club head/club account with club ID
const updateClubHead = async (req, res) => {
  try {
    const { userId, clubManaging } = req.body;
    
    if (!userId || !clubManaging) {
      return res.status(400).json({
        success: false,
        message: 'User ID and club ID are required'
      });
    }
    
    // Find the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Make sure user role is appropriate for club management
    if (user.role !== 'clubs' && user.role !== 'clubHead') {
      return res.status(400).json({
        success: false,
        message: 'User role must be clubs or clubHead to manage clubs'
      });
    }
    
    // Update the clubManaging field
    user.clubManaging = clubManaging;
    await user.save();
    
    console.log(`Updated user ${userId} with clubManaging: ${clubManaging}`);
    
    res.status(200).json({
      success: true,
      message: 'Club association updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubManaging: user.clubManaging
      }
    });
  } catch (error) {
    console.error('Error updating club association:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating club association',
      error: error.message
    });
  }
};

module.exports = {
  register,
  createUser,
  login,
  verifyEmail,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getCurrentUser,
  checkEmail,
  requestPasswordChangeOTP,
  changePassword,
  searchUsers,
  updateProfile,
  updateClubHead  // Add the new function to exports
};
