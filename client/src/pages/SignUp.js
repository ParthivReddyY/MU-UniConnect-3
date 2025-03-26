import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    accommodationType: '', // Add new field for day scholar/hosteller
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
  
  // Academic data structure containing the hierarchy of schools, programs, and departments
  const academicData = useMemo(() => ({
    "École Centrale School of Engineering(ECSE)": {
      "B.Tech": [
        "AI (Artificial Intelligence)",
        "Biotechnology",
        "Computational Biology",
        "CSE (Computer Science and Engineering)",
        "Civil Engineering",
        "CM (Computation and Mathematics)",
        "ECM (Electronics and Computer Engineering)",
        "Mechanical Engineering (ME)",
        "Mechatronics (MT)",
        "Nanotechnology",
        "ECE (Electronics and Communication Engineering)",
        "Aerospace Engineering",
        "Electronic and Computer Engineering",
        "VLSI Design and Technology"
      ],
      "5 Year Integrated M.Tech": [
        "Computer Science and Engineering",
        "Biotechnology"
      ],
      "M.Tech": [
        "Autonomous Electric Vehicles (A-EV's)",
        "Computer-Aided Structural Engineering",
        "AI and Data Science",
        "Systems Engineering",
        "VLSI Design and Embedded Systems",
        "Smart Grid and Energy Storage Technologies",
        "Robotics",
        "Transportation Engineering",
        "Computational Mechanics",
        "Biomedical Data Science"
      ],
      "Ph.D.": [
        "Physics",
        "Civil Engineering",
        "Electrical and Computer Engineering",
        "Mathematics",
        "Mechanical and Aerospace Engineering",
        "Humanities and Social Sciences",
        "Life Sciences"
      ]
    },
    "School of Management(SOM)": {
      "BBA": [
        "BBA Applied Economics and Finance",
        "BBA Digital Technologies",
        "BBA Computational Business Analytics"
      ],
      "MBA": ["MBA"],
      "Ph.D.": [
        "Ph.D. in Economics",
        "Ph.D. in Finance",
        "Ph.D. in Decision Sciences",
        "Ph.D. in Marketing",
        "Ph.D. in Management (Strategy & Entrepreneurship, Organisational Behaviour & HRM)",
        "Ph.D. in Information Science and Technology"
      ]
    },
    "School Of Law(SOL)": {
      "BA.LL.B.": [
        "Corporate Law",
        "Business Laws",
        "Criminal Law",
        "International Law",
        "Intellectual Property Law",
        "Civil and Private Law",
        "Public Law"
      ],
      "B.B.A.LL.B.": [
        "Corporate Law",
        "Business Laws",
        "Criminal Law",
        "International Law",
        "Intellectual Property Law",
        "Civil and Private Law",
        "Public Law"
      ],
      "3-Years LL.B.(Hons.)": [
        "Corporate Law",
        "Business Laws",
        "Criminal Law",
        "International Law",
        "Intellectual Property Law",
        "Civil and Private Law",
        "Public Law"
      ],
      "B.Tech.-LL.B.(Hons.)": ["Integrated Dual-Degree"],
      "Ph.D.": [
        "Constitutional Law and Administrative Law",
        "Corporate Law and Business Law",
        "International Law",
        "Technology Law",
        "Air and Space Law",
        "Maritime and Defence Law"
      ]
    },
    "Indira Mahindra School of Education(IMSOE)": {
      "Master of Arts (M.A.) in Education": ["M.A. in Education"],
      "Ph.D.": [
        "School Education",
        "Higher Education",
        "Sociology of Education",
        "Educational Leadership and Management",
        "Psychology of Education",
        "Educational Innovations",
        "History of Education",
        "Economics of Education",
        "Teacher Education",
        "Educational Policy Studies",
        "Political Contexts of Education",
        "Curriculum and Pedagogical Studies",
        "Technology and Education"
      ]
    },
    "School of Digital Media and Communication(SDMC)": {
      "B.Tech (Computation and Media)": ["Computation and Media"],
      "Bachelor of Journalism and Mass Communication": ["Journalism and Mass Communication"],
      "MA in Journalism and Mass Communication": ["Journalism and Mass Communication"],
      "Ph.D.": [
        "Journalism Studies",
        "Media Studies",
        "Mass Communication",
        "Film and Television Studies",
        "Strategic Communication",
        "Media and Communication Management",
        "History, Technology and Systems of Media and Communication",
        "Ethics, Policies and Laws of Mediated Communication",
        "Human and Machine-Interface Communication"
      ]
    },
    "School of Design Innovation(SODI)": {
      "B.Des in Design Innovation": ["Design Innovation"],
      "M.Des in Design Innovation": ["Design Innovation"],
      "Ph.D.": [
        "Design Thinking",
        "Online and Scalable Design Education",
        "Design for Sustainability",
        "Design for Empathy in HCI"
      ]
    },
    "School of Hospitality Management(SOHM)": {
      "4-Yr B.Sc.(Hons.) Culinary and Hospitality Management": ["Culinary and Hospitality Management"]
    }
  }), []);

  // Get current year for the academic year dropdown - updating to include up to current year
  const currentYear = new Date().getFullYear();
  const startYear = 2015; // Starting year for options
  const academicYears = Array.from(
    { length: currentYear - startYear + 1 }, 
    (_, i) => `${startYear + i}`
  ).reverse(); // Reverse so most recent years appear first
  
  const { register, currentUser } = useAuth();
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
      const programs = Object.keys(academicData[formData.school] || {});
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
  }, [formData.school, academicData]);
  
  // Update available departments when program changes
  useEffect(() => {
    if (formData.school && formData.program) {
      const departments = academicData[formData.school][formData.program] || [];
      setAvailableDepartments(departments);
      setFormData(prev => ({
        ...prev,
        department: ''
      }));
    } else {
      setAvailableDepartments([]);
    }
  }, [formData.program, formData.school, academicData]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@mahindrauniversity\.edu\.in$/.test(formData.email)) {
      newErrors.email = 'Email must be a valid Mahindra University email (@mahindrauniversity.edu.in)';
    }
    
    // Simplified validation checks - combining similar patterns
    const requiredFields = {
      dateOfBirth: 'Date of birth',
      yearOfJoining: 'Year of joining',
      school: 'School',
      program: 'Program',
      department: 'Department/Specialization',
      studentId: 'Student ID',
      accommodationType: 'Accommodation type' // Add validation for new field
    };
    
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field]) {
        newErrors[field] = `${label} is required`;
      }
    });
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Simplify - use single if statement instead of two separate ones
    if (signupError || signupSuccess) {
      setSignupError('');
      setSignupSuccess('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
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
        accommodationType: formData.accommodationType, // Include new field in submission
        password: formData.password
      });
      
      if (result.success) {
        setSignupSuccess(result.message || 'Registration successful! Please check your email to verify your account.');
        // Clear form after successful signup
        setFormData({
          name: '',
          email: '',
          dateOfBirth: '',
          yearOfJoining: '',
          school: '',
          program: '',
          department: '',
          studentId: '',
          accommodationType: '', // Reset new field
          password: '',
          confirmPassword: ''
        });
      } else {
        setSignupError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setSignupError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Updated common label class for consistent styling
  const labelClass = "block mb-2 text-sm font-medium text-gray-300 h-5";

  // Updated input classes with consistent height
  const inputClasses = (fieldName) => `w-full pl-12 pr-4 py-3 h-[50px] border ${
    errors[fieldName] ? 'border-red-500' : 'border-gray-700'
  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-100 bg-gray-800 bg-opacity-70 transition-all duration-200 shadow-sm`;
  
  const selectClasses = (fieldName, disabled = false) => `${inputClasses(fieldName)} appearance-none ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-20 bg-gradient-to-r from-red-500 to-indigo-500 relative">
      {/* Background gradient overlay */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.15),transparent_70%)] mix-blend-multiply"></div>
      
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 bg-black bg-opacity-70 text-white font-medium py-2 px-4 rounded-md hover:bg-opacity-90 transition-all duration-200 flex items-center group"
      >
        <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
        Back to Home
      </Link>
      
      {/* Form container */}
      <div className="w-full max-w-4xl bg-black bg-opacity-80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 my-12 backdrop-blur-sm">
        <div className="px-10 pt-10 pb-6 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-white mb-3">Create Account</h1>
          <p className="text-gray-400">Join the Mahindra University community</p>
        </div>
        
        {signupError && (
          <div className="mx-10 mb-6 bg-red-900 bg-opacity-30 text-red-400 p-4 rounded-md text-sm border border-red-800 animate-pulse">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {signupError}
          </div>
        )}
        
        {signupSuccess && (
          <div className="mx-10 mb-6 bg-green-900 bg-opacity-30 text-green-400 p-4 rounded-md text-sm border border-green-800 animate-pulse">
            <i className="fas fa-check-circle mr-2"></i>
            {signupSuccess}
          </div>
        )}
        
        <form className="px-10 pb-10 pt-2" onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="mb-8 pb-6 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center">
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-3 w-12 h-12 mr-3 shadow-md group-hover:shadow-lg transition-all duration-300 relative overflow-hidden flex items-center justify-center rounded-lg">
                <i className="fas fa-id-card text-white text-lg relative z-10"></i>
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-white opacity-10 transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              </div>
              Personal Information
            </h3>
            <div className="flex flex-wrap -mx-2">
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="name" className={labelClass}>Full Name</label>
                  <div className="relative group">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={inputClasses('name')}
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-user"></i>
                    </div>
                  </div>
                  {errors.name && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.name}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Email field */}
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="email" className={labelClass}>College Email Address</label>
                  <div className="relative group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={inputClasses('email')}
                      placeholder="yourname@mahindrauniversity.edu.in"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-envelope"></i>
                    </div>
                  </div>
                  {errors.email && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Date of Birth field */}
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="dateOfBirth" className={labelClass}>Date of Birth</label>
                  <div className="relative group">
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      className={inputClasses('dateOfBirth')}
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                  </div>
                  {errors.dateOfBirth && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.dateOfBirth}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Student ID field */}
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="studentId" className={labelClass}>Student ID</label>
                  <div className="relative group">
                    <input
                      id="studentId"
                      name="studentId"
                      type="text"
                      className={inputClasses('studentId')}
                      placeholder="SE22UCSE000"
                      value={formData.studentId}
                      onChange={handleChange}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-id-card"></i>
                    </div>
                  </div>
                  {errors.studentId && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.studentId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Academic Information Section */}
          <div className="mb-8 pb-6 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center">
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-3 w-12 h-12 mr-3 shadow-md group-hover:shadow-lg transition-all duration-300 relative overflow-hidden flex items-center justify-center rounded-lg">
                <i className="fas fa-university text-white text-lg relative z-10"></i>
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-white opacity-10 transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              </div>
              Academic Information
            </h3>
            <div className="flex flex-wrap -mx-2">
              {/* Apply the same structure to all other form fields */}
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="yearOfJoining" className={labelClass}>Academic Year of Joining</label>
                  <div className="relative group">
                    <select
                      id="yearOfJoining"
                      name="yearOfJoining"
                      className={selectClasses('yearOfJoining')}
                      value={formData.yearOfJoining}
                      onChange={handleChange}
                    >
                      <option value="">Select year of Joining</option>
                      {academicYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                  {errors.yearOfJoining && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.yearOfJoining}
                    </div>
                  )}
                </div>
              </div>
              
              {/* School select */}
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="school" className={labelClass}>School</label>
                  <div className="relative group">
                    <select
                      id="school"
                      name="school"
                      className={selectClasses('school')}
                      value={formData.school}
                      onChange={handleChange}
                    >
                      <option value="">Select your school</option>
                      {Object.keys(academicData).map((school) => (
                        <option key={school} value={school}>{school}</option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-university"></i>
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                  {errors.school && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.school}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Program select */}
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="program" className={labelClass}>Program</label>
                  <div className="relative group">
                    <select
                      id="program"
                      name="program"
                      className={selectClasses('program', !formData.school)}
                      value={formData.program}
                      onChange={handleChange}
                      disabled={!formData.school}
                    >
                      <option value="">Select your program</option>
                      {availablePrograms.map((program) => (
                        <option key={program} value={program}>{program}</option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-book"></i>
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                  {errors.program && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.program}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Department select */}
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="department" className={labelClass}>Department/Specialization</label>
                  <div className="relative group">
                    <select
                      id="department"
                      name="department"
                      className={selectClasses('department', !formData.program)}
                      value={formData.department}
                      onChange={handleChange}
                      disabled={!formData.program}
                    >
                      <option value="">Select your department/specialization</option>
                      {availableDepartments.map((department) => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-flask"></i>
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                  {errors.department && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.department}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Accommodation Type field after Department field */}
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="accommodationType" className={labelClass}>Accommodation Type</label>
                  <div className="relative group">
                    <select
                      id="accommodationType"
                      name="accommodationType"
                      className={selectClasses('accommodationType')}
                      value={formData.accommodationType}
                      onChange={handleChange}
                    >
                      <option value="">Select accommodation type</option>
                      <option value="dayScholar">Day Scholar</option>
                      <option value="hosteller">Hosteller</option>
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-home"></i>
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                  {errors.accommodationType && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.accommodationType}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Other academic fields continue... */}
            </div>
          </div>
          
          {/* Account Security Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center">
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-3 w-12 h-12 mr-3 shadow-md group-hover:shadow-lg transition-all duration-300 relative overflow-hidden flex items-center justify-center rounded-lg">
                <i className="fas fa-fingerprint text-white text-lg relative z-10"></i>
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-white opacity-10 transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              </div>
              Account Security
            </h3>
            <div className="flex flex-wrap -mx-2">
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="password" className={labelClass}>Password</label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={inputClasses('password')}
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-lock"></i>
                    </div>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.password}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-1/2 px-2 mb-6">
                <div className="h-full">
                  <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
                  <div className="relative group">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      className={inputClasses('confirmPassword')}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-lock"></i>
                    </div>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="mt-1 text-xs text-red-500 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
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
            <p className="mb-3 text-gray-400">Already have an account?</p>
            <Link to="/login" className="w-full inline-block border border-gray-600 text-gray-300 font-medium py-4 px-4 rounded-md hover:bg-gray-700 transition-all duration-200 text-center text-lg bg-gray-900 hover:text-white">
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
