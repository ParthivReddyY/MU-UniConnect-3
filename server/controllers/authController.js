const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Register a new student
const register = async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;
    
    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Check if student ID already exists
    const studentIdExists = await User.findOne({ studentId });
    if (studentIdExists) {
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create user with student role
    const user = await User.create({
      name,
      email,
      password,
      studentId,
      role: 'student',
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Send verification email (implementation depends on your email service)
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message: `Please verify your email by clicking: ${verificationUrl}`
      });
      
      res.status(201).json({
        success: true,
        message: 'User registered! Please check your email to verify your account.'
      });
    } catch (error) {
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();
      
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new user by admin (for faculty and club heads)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, clubManaging } = req.body;
    
    // Validate role
    if (!['faculty', 'clubHead', 'admin'].includes(role)) {
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
    } else if (role === 'clubHead') {
      if (!clubManaging) {
        return res.status(400).json({ message: 'Club name is required for club heads' });
      }
      userData.clubManaging = clubManaging;
    }
    
    const user = await User.create(userData);
    
    // Generate temporary password and send email
    const temporaryPassword = crypto.randomBytes(6).toString('hex');
    user.password = temporaryPassword;
    await user.save();
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'MU-UniConnect Account Created',
        message: `Your account has been created. Your temporary password is: ${temporaryPassword}`
      });
      
      res.status(201).json({
        success: true,
        message: `${role} account created successfully. Temporary password sent to email.`
      });
    } catch (error) {
      return res.status(500).json({ message: 'Email could not be sent, but account was created' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Login attempt for email: ${email}`);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Explicitly select the password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // For users who haven't verified their email (if your system requires verification)
    if (user.isEmailVerified === false) {
      console.log(`User email not verified: ${email}`);
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      console.log(`Invalid password for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = user.createJWT();
    
    console.log(`Login successful for: ${email}, role: ${user.role}`);
    
    // Don't send password in the response
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };

    res.status(200).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully. You can now log in.' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset',
        message: `You requested a password reset. Please go to: ${resetUrl}`
      });
      
      res.status(200).json({ 
        success: true, 
        message: 'Password reset email sent' 
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Hash the token for comparison
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
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

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null,
        department: user.department,
        studentId: user.studentId,
        clubManaging: user.clubManaging,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if email exists (for two-step login)
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }
    
    const user = await User.findOne({ email });
    
    return res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = {
  register,
  createUser,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  checkEmail // Add the new function to the exports
};
