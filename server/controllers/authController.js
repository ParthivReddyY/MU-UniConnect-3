const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail, TEMPLATES } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Temporary storage for registration data (in production, use Redis or a temporary DB collection)
const pendingRegistrations = new Map();

// Register a new student - first step
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
      return res.status(400).json({ message: 'Student ID already exists' });
    }
    
    // Generate verification OTP (6 digits)
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store user data temporarily with OTP
    pendingRegistrations.set(email, {
      userData: req.body,
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
    const user = await User.create({
      ...userData,
      role: 'student',
      isVerified: true // User is now pre-verified since they completed OTP verification
    });
    
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
        templateId: TEMPLATES.WELCOME,
        params: {
          name: user.name,
          role: user.role,
          password: temporaryPassword,
          loginLink: `${req.protocol}://${req.get('host')}/login`
        }
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
    
    // Detailed logging for debugging
    console.log('==== LOGIN ATTEMPT DETAILS ====');
    console.log(`Email: ${email}`);
    console.log(`Password provided: ${password ? 'Yes' : 'No'}`);
    console.log('Request headers:', req.headers);
    console.log('Request origin:', req.get('origin'));
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    console.log('Request IP:', req.ip);
    console.log('==============================');
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password',
        errorType: 'MISSING_FIELDS' 
      });
    }

    // Make sure we're selecting all the fields we need including role
    // Note: We need to explicitly include fields that are not automatically returned
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'No account found with this email address',
        errorType: 'EMAIL_NOT_FOUND' 
      });
    }
    
    // Log the complete user object to debug the issue
    console.log('Found user details:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // For users who haven't verified their email (if your system requires verification)
    if (user.isEmailVerified === false) {
      console.log(`User email not verified: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Please verify your email before logging in',
        errorType: 'EMAIL_NOT_VERIFIED' 
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    console.log(`Password check result: ${isPasswordCorrect ? 'correct' : 'incorrect'}`);
    
    if (!isPasswordCorrect) {
      console.log(`Invalid password for email: ${email}`);
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
    console.error("Login error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
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
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    console.error(error);
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
// Removing the duplicate declaration that was here

// Check if email exists
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
  changePassword
};
