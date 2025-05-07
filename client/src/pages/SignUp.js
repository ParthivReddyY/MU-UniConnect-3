import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSchools, getPrograms, getDepartments, getAcademicYears } from '../utils/academicDataUtils';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    yearOfJoining: '',
    school: '',
    program: '',
    department: '',
    studentId: '',
    accommodationType: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const { register, verifyEmail, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  // Update available programs when school changes
  useEffect(() => {
    if (formData.school) {
      const programs = getPrograms(formData.school);
      setAvailablePrograms(programs);
      setFormData(prev => ({
        ...prev,
        program: '',
        department: ''
      }));
    } else {
      setAvailablePrograms([]);
      setAvailableDepartments([]);
    }
  }, [formData.school]);
  
  // Update available departments when program changes
  useEffect(() => {
    if (formData.school && formData.program) {
      const departments = getDepartments(formData.school, formData.program);
      setAvailableDepartments(departments);
      setFormData(prev => ({
        ...prev,
        department: ''
      }));
    } else {
      setAvailableDepartments([]);
    }
  }, [formData.program, formData.school]);
  
  // Function to validate form inputs
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      yearOfJoining: 'Year of joining',
      dateOfBirth: 'Date of birth',
      school: 'School',
      program: 'Program',
      department: 'Department/Specialization',
      studentId: 'Student ID',
      accommodationType: 'Accommodation type'
    };
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@mahindrauniversity\.edu\.in$/.test(formData.email)) {
      newErrors.email = 'Email must be a valid Mahindra University email (@mahindrauniversity.edu.in)';
    }
    
    // Check all required fields
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field]) {
        newErrors[field] = `${label} is required`;
      }
    });
    
    // Add specific validation for yearOfJoining to match server schema validation
    if (formData.yearOfJoining) {
      const year = parseInt(formData.yearOfJoining, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1990 || year > currentYear) {
        newErrors.yearOfJoining = `Year must be between 1990 and ${currentYear}`;
      }
    }
    
    // Enhanced password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      // Check password strength requirements
      const minScore = 3; // Require at least 3 criteria to be met for a valid password
      
      if (passwordStrength.score < minScore) {
        newErrors.password = 'Password is too weak. Please meet at least 3 requirements.';
      }
      
      if (!passwordStrength.hasMinLength) {
        newErrors.password = 'Password must be at least 8 characters long';
      }
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Password strength checker
    if (name === 'password') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear any global messages
    if (signupError || signupSuccess) {
      setSignupError('');
      setSignupSuccess('');
    }
  };
  
  // Function to check password strength
  const checkPasswordStrength = (password) => {
    // Check different requirements
    const hasMinLength = password.length >= 8;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    // Calculate score based on requirements met
    let score = 0;
    if (hasMinLength) score++;
    if (hasLowerCase) score++;
    if (hasUpperCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    
    return {
      score,
      hasMinLength,
      hasLowerCase,
      hasUpperCase,
      hasNumber,
      hasSpecialChar
    };
  };
  
  // Helper function to render the password strength indicator
  const renderPasswordStrengthIndicator = () => {
    if (!formData.password) return null;
    
    // Define indicator styles based on strength score
    const getStrengthLabel = () => {
      if (passwordStrength.score === 0) return { text: 'Very Weak', color: 'red-600' };
      if (passwordStrength.score === 1) return { text: 'Weak', color: 'red-500' };
      if (passwordStrength.score === 2) return { text: 'Fair', color: 'yellow-500' };
      if (passwordStrength.score === 3) return { text: 'Good', color: 'green-500' };
      if (passwordStrength.score === 4) return { text: 'Strong', color: 'green-400' };
      return { text: 'Very Strong', color: 'green-300' };
    };
    
    const { text, color } = getStrengthLabel();
    
    return (
      <div className="mt-2 mb-4 px-2 w-full">
        {/* Strength label */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-300">Password Strength:</span>
          <span className={`text-xs font-medium text-${color}`}>{text}</span>
        </div>
        
        {/* Strength bar */}
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-${color} transition-all duration-300`} 
            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
          ></div>
        </div>
        
        {/* Requirements checklist */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className={`flex items-center text-xs ${passwordStrength.hasMinLength ? 'text-green-400' : 'text-gray-400'}`}>
            <i className={`fas fa-${passwordStrength.hasMinLength ? 'check-circle' : 'circle'} mr-2`}></i>
            At least 8 characters
          </div>
          <div className={`flex items-center text-xs ${passwordStrength.hasLowerCase ? 'text-green-400' : 'text-gray-400'}`}>
            <i className={`fas fa-${passwordStrength.hasLowerCase ? 'check-circle' : 'circle'} mr-2`}></i>
            Lowercase letter (a-z)
          </div>
          <div className={`flex items-center text-xs ${passwordStrength.hasUpperCase ? 'text-green-400' : 'text-gray-400'}`}>
            <i className={`fas fa-${passwordStrength.hasUpperCase ? 'check-circle' : 'circle'} mr-2`}></i>
            Uppercase letter (A-Z)
          </div>
          <div className={`flex items-center text-xs ${passwordStrength.hasNumber ? 'text-green-400' : 'text-gray-400'}`}>
            <i className={`fas fa-${passwordStrength.hasNumber ? 'check-circle' : 'circle'} mr-2`}></i>
            Number (0-9)
          </div>
          <div className={`flex items-center text-xs ${passwordStrength.hasSpecialChar ? 'text-green-400' : 'text-gray-400'}`}>
            <i className={`fas fa-${passwordStrength.hasSpecialChar ? 'check-circle' : 'circle'} mr-2`}></i>
            Special character (!@#$%)
          </div>
        </div>
      </div>
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSignupError(''); // Clear any previous errors
    
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        yearOfJoining: formData.yearOfJoining,
        school: formData.school,
        program: formData.program,
        department: formData.department,
        studentId: formData.studentId,
        accommodationType: formData.accommodationType,
        password: formData.password
      });
      
      if (result.success) {
        setVerificationEmail(result.email || formData.email);
        setIsVerifying(true);
        setSignupSuccess('Verification code sent to your email. Please enter it below to complete registration.');
      } else {
        // Handle specific error message from register function
        setSignupError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setSignupError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // OTP verification handler
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otpCode.trim()) {
      setOtpError('Please enter the verification code');
      return;
    }
    
    if (!verificationEmail || verificationEmail.trim() === '') {
      setOtpError('Email address is missing. Please go back and try registering again.');
      return;
    }
    
    setIsSubmitting(true);
    setOtpError('');
    
    try {
      const result = await verifyEmail(verificationEmail, otpCode);
      
      if (result.success) {
        // Clear form after successful verification
        setFormData({
          name: '',
          email: '',
          dateOfBirth: '',
          yearOfJoining: '',
          school: '',
          program: '',
          department: '',
          studentId: '',
          accommodationType: '',
          password: '',
          confirmPassword: ''
        });
        
        setIsVerifying(false);
        setOtpCode('');
        setSignupSuccess(result.message || 'Registration completed successfully! You can now log in.');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setOtpError(result.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setOtpError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Style classes
  const labelClass = "block mb-2 text-sm font-medium text-gray-300";
  const inputClasses = (fieldName) => `w-full pl-12 pr-4 py-3 h-[50px] border ${
    errors[fieldName] ? 'border-red-500' : 'border-gray-700'
  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-100 bg-gray-800 bg-opacity-70 transition-all duration-200 shadow-sm`;
  
  const selectClasses = (fieldName, disabled = false) => `${inputClasses(fieldName)} appearance-none ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  // Helper function to render form field with icon
  const renderField = (id, label, type, icon, placeholder = "", options = null, disabled = false) => (
    <div className="w-full md:w-1/2 px-2 mb-6">
      <div className="h-full">
        <label htmlFor={id} className={labelClass}>{label}</label>
        <div className="relative group">
          {type === "select" ? (
            <select
              id={id}
              name={id}
              className={selectClasses(id, disabled)}
              value={formData[id]}
              onChange={handleChange}
              disabled={disabled}
            >
              <option value="">{placeholder}</option>
              {options && options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={id}
              name={id}
              type={type === "password" && showPassword ? "text" : type}
              className={inputClasses(id)}
              placeholder={placeholder}
              value={formData[id]}
              onChange={handleChange}
            />
          )}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
            <i className={`fas ${icon}`}></i>
          </div>
          {type === "select" && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <i className="fas fa-chevron-down"></i>
            </div>
          )}
          {type === "password" && (
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          )}
        </div>
        {errors[id] && (
          <div className="mt-1 text-xs text-red-500 flex items-center">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors[id]}
          </div>
        )}
      </div>
    </div>
  );

  // Render OTP verification form
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
           style={{
             backgroundImage: 'url("/img/login and signup background.jpg")',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat',
             backgroundAttachment: 'fixed'
           }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        
        <div className="w-full max-w-md bg-black bg-opacity-85 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 mx-auto backdrop-blur-md">
          <div className="px-8 pt-8 pb-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-3">Verify Your Email</h1>
            <p className="text-gray-300">Enter the verification code sent to <span className="text-red-400 font-medium">{verificationEmail}</span></p>
          </div>
          
          {signupSuccess && (
            <div className="mx-8 mb-6 bg-green-900 bg-opacity-40 text-green-400 p-4 rounded-md text-sm border border-green-800 animate-pulse">
              <i className="fas fa-check-circle mr-2"></i>
              {signupSuccess}
            </div>
          )}
          
          {otpError && (
            <div className="mx-8 mb-6 bg-red-900 bg-opacity-40 text-red-400 p-4 rounded-md text-sm border border-red-800 animate-pulse">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {otpError}
            </div>
          )}
          
          <form className="px-8 pb-8 pt-2" onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <label htmlFor="otpCode" className={labelClass}>Verification Code</label>
              <div className="relative group">
                <input
                  id="otpCode"
                  type="text"
                  className={inputClasses('otpCode')}
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    setOtpError('');
                  }}
                  maxLength={6}
                  autoFocus
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors">
                  <i className="fas fa-key"></i>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-4 rounded-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Verify & Complete Registration
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsVerifying(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-arrow-left mr-1"></i>
                Back to Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main signup form
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 relative"
         style={{
           backgroundImage: 'url("/img/login and signup background.jpg")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat',
           backgroundAttachment: 'fixed'
         }}>
      <div className="fixed inset-0 bg-black bg-opacity-60 pointer-events-none"></div>
      
      <Link 
        to="/" 
        className="fixed top-6 left-6 bg-black bg-opacity-70 text-white font-medium py-2 px-4 rounded-md hover:bg-opacity-90 transition-all duration-200 flex items-center group z-20"
      >
        <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
        Back to Home
      </Link>
      
      <div className="w-full max-w-4xl bg-black bg-opacity-85 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 my-8 backdrop-blur-md">
        <div className="px-8 pt-8 pb-6 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-white mb-3">Create Account</h1>
          <p className="text-gray-300">Join the Mahindra University community</p>
        </div>
        
        {signupError && (
          <div className="mx-8 mb-6 bg-red-900 bg-opacity-40 text-red-400 p-4 rounded-md text-sm border border-red-800 animate-pulse">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {signupError}
          </div>
        )}
        
        {signupSuccess && (
          <div className="mx-8 mb-6 bg-green-900 bg-opacity-40 text-green-400 p-4 rounded-md text-sm border border-green-800 animate-pulse">
            <i className="fas fa-check-circle mr-2"></i>
            {signupSuccess}
          </div>
        )}
        
        <form className="px-8 pb-8 pt-2" onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="mb-8 pb-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-5 flex items-center">
              <span className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-id-card text-white text-sm"></i>
              </span>
              Personal Information
            </h3>
            <div className="flex flex-wrap -mx-2">
              {renderField("name", "Full Name", "text", "fa-user", "John Doe")}
              {renderField("email", "College Email Address", "email", "fa-envelope", "yourname@mahindrauniversity.edu.in")}
              {renderField("dateOfBirth", "Date of Birth", "date", "fa-calendar-alt")}
              {renderField("studentId", "Student ID", "text", "fa-id-card", "SE22UCSE000")}
            </div>
          </div>
          
          {/* Academic Information Section */}
          <div className="mb-8 pb-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-5 flex items-center">
              <span className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-university text-white text-sm"></i>
              </span>
              Academic Information
            </h3>
            <div className="flex flex-wrap -mx-2">
              {renderField("yearOfJoining", "Academic Year of Joining", "select", "fa-calendar-check", "Select Year", getAcademicYears())}
              {renderField("school", "School", "select", "fa-university", "Select your school", getSchools())}
              {renderField("program", "Program", "select", "fa-book", "Select your program", availablePrograms, !formData.school)}
              {renderField("department", "Department/Specialization", "select", "fa-flask", "Select your department/specialization", availableDepartments, !formData.program)}
              {renderField("accommodationType", "Accommodation Type", "select", "fa-home", "Select accommodation type", ["dayScholar", "hosteller"])}
            </div>
          </div>
          
          {/* Account Security Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-5 flex items-center">
              <span className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-fingerprint text-white text-sm"></i>
              </span>
              Account Security
            </h3>
            <div className="flex flex-wrap -mx-2">
              {renderField("password", "Password", "password", "fa-lock", "Minimum 8 characters")}
              {renderField("confirmPassword", "Confirm Password", "password", "fa-lock", "Confirm your password")}
            </div>
            {renderPasswordStrengthIndicator()}
          </div>
          
          <div className="mb-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-4 rounded-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2"></i>
                  Create Account
                </>
              )}
            </button>
          </div>
          
          <div className="text-center mt-8">
            <p className="mb-3 text-gray-300">Already have an account?</p>
            <Link to="/login" className="w-full inline-block border border-gray-600 text-gray-300 font-medium py-4 px-4 rounded-md hover:bg-gray-800 transition-all duration-200 text-center text-lg bg-gray-900 hover:text-white">
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign in instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
