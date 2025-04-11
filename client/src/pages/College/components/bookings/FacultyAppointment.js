import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext'; // Import auth context
import api from '../../../../utils/axiosConfig'; // Import API utility

// Constants
const MIN_REASON_CHARS = 20;
const MAX_REASON_CHARS = 200;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
  'text/plain', 
  'image/jpeg', 
  'image/png'
];

const FacultyAppointmentComponent = () => {
  // Navigation
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get auth context for user information
  const { currentUser, isStudent, isAdmin } = useAuth();
  
  // Student information state
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    department: '',
    year: '',
    rollNumber: '',
    email: ''
  });
  
  // Form state
  const [formData, setFormData] = useState({
    faculty: '',
    course: '',
    appointment_date: '',
    appointment_time: '',
    duration: '',
    custom_duration: '',
    meeting_mode: '',
    priority: '',
    phone: '',
    reason: '',
    alt_date_1: '',
    alt_time_1: '',
    alt_date_2: '',
    alt_time_2: ''
  });
  
  // Faculty search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [facultyList, setFacultyList] = useState([]); // State to store faculty from API
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState(0);
  const [isFileValid, setIsFileValid] = useState(true);
  const [fileInfo, setFileInfo] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // UI state
  const [showTips, setShowTips] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '', visible: false });
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch faculty from the database
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await api.get('/api/faculty');
        if (response.status === 200) {
          setFacultyList(response.data);
        } else {
          console.error('Failed to fetch faculty data');
          // Use fallback data if API fails
          setFacultyList([
            { id: 1, name: "Dr. Yajulu Medury", department: "ECSE", email: "vc@mahindrauniversity.edu.in", designation: "Vice-Chancellor" },
            { id: 2, name: "Dr. Sriman Kumar Bhattacharyya", department: "ECSE", email: "sk.bhattacharyya@mahindrauniversity.edu.in", designation: "Professor" },
            { id: 3, name: "Dr. Bishwajit Bhattacharjee", department: "CEI", email: "bishwajit.b@mahindrauniversity.edu.in", designation: "Professor" },
            { id: 4, name: "Dr. Arya Kumar Bhattacharya", department: "ECSE", email: "arya.bhattacharya@mahindrauniversity.edu.in", designation: "Professor" },
            { id: 5, name: "Dr. Babita Gupta", department: "SOM", email: "babita.gupta@mahindrauniversity.edu.in", designation: "Professor" },
            { id: 6, name: "Dr. Revathi Venkataraman", department: "SOL", email: "revathi.v@mahindrauniversity.edu.in", designation: "Professor" },
            { id: 7, name: "Dr. Vishal Talwar", department: "SOM", email: "vishal.talwar@mahindrauniversity.edu.in", designation: "Dean" },
            { id: 8, name: "Dr. Padmaja Rani", department: "ECSE", email: "padmaja.rani@mahindrauniversity.edu.in", designation: "Associate Professor" },
            { id: 9, name: "Dr. Jayashree Bangali", department: "SOHM", email: "jayashree.bangali@mahindrauniversity.edu.in", designation: "Associate Professor" },
            { id: 10, name: "Dr. Krishna Lyengar", department: "ECSE", email: "krishna.lyengar@mahindrauniversity.edu.in", designation: "Associate Professor" },
            { id: 11, name: "Dr. Shubhamoy Dey", department: "SOM", email: "shubhamoy.dey@mahindrauniversity.edu.in", designation: "Associate Professor" },
            { id: 12, name: "Dr. NS Murty", department: "ECSE", email: "ns.murty@mahindrauniversity.edu.in", designation: "Assistant Professor" }
          ]);
        }
      } catch (error) {
        console.error('Error fetching faculty:', error);
        // Fallback data
        setFacultyList([
          { id: 1, name: "Dr. Yajulu Medury", department: "ECSE", email: "vc@mahindrauniversity.edu.in", designation: "Vice-Chancellor" },
          { id: 2, name: "Dr. Sriman Kumar Bhattacharyya", department: "ECSE", email: "sk.bhattacharyya@mahindrauniversity.edu.in", designation: "Professor" },
          { id: 3, name: "Dr. Bishwajit Bhattacharjee", department: "CEI", email: "bishwajit.b@mahindrauniversity.edu.in", designation: "Professor" },
          { id: 4, name: "Dr. Arya Kumar Bhattacharya", department: "ECSE", email: "arya.bhattacharya@mahindrauniversity.edu.in", designation: "Professor" },
          { id: 5, name: "Dr. Babita Gupta", department: "SOM", email: "babita.gupta@mahindrauniversity.edu.in", designation: "Professor" },
          { id: 6, name: "Dr. Revathi Venkataraman", department: "SOL", email: "revathi.v@mahindrauniversity.edu.in", designation: "Professor" },
          { id: 7, name: "Dr. Vishal Talwar", department: "SOM", email: "vishal.talwar@mahindrauniversity.edu.in", designation: "Dean" },
          { id: 8, name: "Dr. Padmaja Rani", department: "ECSE", email: "padmaja.rani@mahindrauniversity.edu.in", designation: "Associate Professor" },
          { id: 9, name: "Dr. Jayashree Bangali", department: "SOHM", email: "jayashree.bangali@mahindrauniversity.edu.in", designation: "Associate Professor" },
          { id: 10, name: "Dr. Krishna Lyengar", department: "ECSE", email: "krishna.lyengar@mahindrauniversity.edu.in", designation: "Associate Professor" },
          { id: 11, name: "Dr. Shubhamoy Dey", department: "SOM", email: "shubhamoy.dey@mahindrauniversity.edu.in", designation: "Associate Professor" },
          { id: 12, name: "Dr. NS Murty", department: "ECSE", email: "ns.murty@mahindrauniversity.edu.in", designation: "Assistant Professor" }
        ]);
      }
    };
    
    fetchFaculty();
  }, []);

  // Handle click outside search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  // Search faculty in real-time - Updated to use facultyList from API
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Simulate API call with setTimeout
    const timer = setTimeout(() => {
      const filteredResults = facultyList.filter(faculty => 
        faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (faculty.designation && faculty.designation.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setSearchResults(filteredResults);
      setIsSearching(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, facultyList]);

  // Handle faculty selection
  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
    setFormData(prev => ({ ...prev, faculty: faculty.name }));
    setSearchQuery(faculty.name);
    setShowDropdown(false);
    setErrors(prev => ({ ...prev, faculty: '' }));
  };

  // Validate faculty selection
  const validateFaculty = () => {
    if (!selectedFaculty) {
      setErrors(prev => ({ ...prev, faculty: 'Faculty selection is required.' }));
      return false;
    }
    return true;
  };

  // Set minimum date for date inputs to today
  useEffect(() => {
    setMinDate();
  }, []);

  const setMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if user is authorized (student or admin)
  useEffect(() => {
    if (!currentUser) {
      // Redirect to login if not logged in
      navigate('/login', { state: { from: '/college/bookings/faculty-appointment' } });
      return;
    }
    
    // Use the role checking functions from auth context
    if (!isStudent() && !isAdmin()) {
      // Redirect to unauthorized page
      navigate('/unauthorized');
      return;
    }
    
    // Fetch student information if user is a student or admin
    if (currentUser) {
      // In a real app, this would be an API call
      // Simulating API call with setTimeout
      setIsLoading(true);
      setTimeout(() => {
        // Sample data - in production this would come from your API
        const studentData = {
          name: currentUser.name || 'Student Name',
          department: currentUser.department || 'Computer Science',
          year: '3rd Year', // This would come from your API
          rollNumber: currentUser.studentId || 'CS2023001',
          email: currentUser.email || 'student@example.com'
        };
        
        setStudentInfo(studentData);
        setIsLoading(false);
      }, 1000);
    }
  }, [currentUser, isStudent, isAdmin, navigate]);

  // Check for pre-selected faculty from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const facultyParam = searchParams.get('faculty');
    
    if (facultyParam) {
      try {
        const preSelectedFaculty = JSON.parse(decodeURIComponent(facultyParam));
        
        // Validate the faculty object has required fields
        if (preSelectedFaculty && preSelectedFaculty.name && preSelectedFaculty.department) {
          setSelectedFaculty(preSelectedFaculty);
          setFormData(prev => ({ ...prev, faculty: preSelectedFaculty.name }));
          setSearchQuery(preSelectedFaculty.name);
          
          // Clear any faculty-related errors
          setErrors(prev => ({ ...prev, faculty: '' }));
          
          // Scroll to the form
          setTimeout(() => {
            const formElement = document.getElementById('appointment-form');
            if (formElement) {
              formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error parsing faculty data from URL:", error);
      }
    }
  }, [location.search]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (name === 'faculty') {
      setSearchQuery(value);
      setShowDropdown(true);
      // If typing changes, clear the selected faculty
      if (selectedFaculty && selectedFaculty.name !== value) {
        setSelectedFaculty(null);
      }
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (type === 'file' && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      validateFile(file);
    } else if (name === 'reason') {
      setCharCount(value.length);
      setFormData(prev => ({ ...prev, [name]: value }));
      validateReason(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    validateField(name, type === 'file' ? files[0] : value);
  };

  // Handle radio button change
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Clear all error messages
  const clearAllErrors = () => {
    setErrors({});
    setIsFileValid(true);
    setFileInfo('');
  };

  // Validate a required select field
  const validateRequiredSelect = (name, value, label) => {
    if (!value) {
      setErrors(prev => ({ ...prev, [name]: `${label} is required.` }));
      return false;
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
    return true;
  };

  // Validate a date field
  const validateDate = (name, value, label, isRequired = true) => {
    if (!value) {
      if (isRequired) {
        setErrors(prev => ({ ...prev, [name]: `${label} is required.` }));
        return false;
      }
      return true;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(value + 'T00:00:00');
    
    if (selected < today) {
      setErrors(prev => ({ ...prev, [name]: `${label} cannot be in the past.` }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
    return true;
  };

  // Validate a time field
  const validateTime = (name, value, label, isRequired = true) => {
    if (!value) {
      if (isRequired) {
        setErrors(prev => ({ ...prev, [name]: `${label} is required.` }));
        return false;
      }
      return true;
    }
    
    // Business hours validation (9am-5pm)
    const timeValue = value.split(':').map(Number);
    const hours = timeValue[0];
    
    if (hours < 9 || hours >= 17) {
      setErrors(prev => ({ ...prev, [name]: `Time must be between 9:00 and 17:00.` }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
    return true;
  };

  // Validate the reason textarea
  const validateReason = (value = formData.reason) => {
    const length = value.length;
    let isValid = true;
    
    if (length === 0) {
      setErrors(prev => ({ ...prev, reason: 'Reason is required.' }));
      isValid = false;
    } else if (length < MIN_REASON_CHARS) {
      setErrors(prev => ({ ...prev, reason: `Reason must be at least ${MIN_REASON_CHARS} characters.` }));
      isValid = false;
    } else if (length > MAX_REASON_CHARS) {
      setErrors(prev => ({ ...prev, reason: `Reason cannot exceed ${MAX_REASON_CHARS} characters.` }));
      isValid = false;
    } else {
      setErrors(prev => ({ ...prev, reason: '' }));
    }
    
    return isValid;
  };

  // Validate the file input
  const validateFile = (file) => {
    if (!file) {
      setIsFileValid(true);
      setFileInfo('');
      return true;
    }
    
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    setFileInfo(`Selected: ${file.name} (${fileSizeMB} MB)`);
    
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors(prev => ({ ...prev, file: `File is too large (Max ${MAX_FILE_SIZE_MB} MB).` }));
      setIsFileValid(false);
      return false;
    } else if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        file: `Invalid file type. Allowed: PDF, DOC(X), TXT, JPG, PNG. Type detected: ${file.type || 'unknown'}` 
      }));
      setIsFileValid(false);
      return false;
    }
    
    setErrors(prev => ({ ...prev, file: '' }));
    setIsFileValid(true);
    return true;
  };

  // Validate alternative slots
  const validateAlternativeSlots = () => {
    let isValid = true;
    const date1 = formData.alt_date_1;
    const time1 = formData.alt_time_1;
    const date2 = formData.alt_date_2;
    const time2 = formData.alt_time_2;
    
    // Reset specific alt slot errors
    setErrors(prev => ({
      ...prev,
      alt_date_1: '',
      alt_time_1: '',
      alt_date_2: '',
      alt_time_2: '',
      alt_slots: ''
    }));
    
    // Slot 1 validation (date and time must both be present or both empty)
    if (date1 || time1) {
      if (!validateDate('alt_date_1', date1, 'Alt. Date 1', !!time1)) isValid = false;
      if (!validateTime('alt_time_1', time1, 'Alt. Time 1', !!date1)) isValid = false;
      
      if (time1 && !date1) {
        setErrors(prev => ({ ...prev, alt_date_1: 'Date required if time is set.' }));
        isValid = false;
      }
      if (date1 && !time1) {
        setErrors(prev => ({ ...prev, alt_time_1: 'Time required if date is set.' }));
        isValid = false;
      }
    }
    
    // Slot 2 validation (date and time must both be present or both empty)
    if (date2 || time2) {
      if (!validateDate('alt_date_2', date2, 'Alt. Date 2', !!time2)) isValid = false;
      if (!validateTime('alt_time_2', time2, 'Alt. Time 2', !!date2)) isValid = false;
      
      if (time2 && !date2) {
        setErrors(prev => ({ ...prev, alt_date_2: 'Date required if time is set.' }));
        isValid = false;
      }
      if (date2 && !time2) {
        setErrors(prev => ({ ...prev, alt_time_2: 'Time required if date is set.' }));
        isValid = false;
      }
    }
    
    // Check if Alt 2 is same as Alt 1 (only if both are fully entered)
    if (date1 && time1 && date2 && time2 && date1 === date2 && time1 === time2) {
      setErrors(prev => ({ ...prev, alt_slots: 'Alternative slots cannot be identical.' }));
      isValid = false;
    }
    
    return isValid;
  };

  // Validate a specific field
  const validateField = (name, value) => {
    switch (name) {
      case 'faculty':
        return selectedFaculty ? true : false;
      case 'course':
        return validateRequiredSelect(name, value, 'Course');
      case 'appointment_date':
        return validateDate(name, value, 'Preferred Date');
      case 'appointment_time':
        return validateTime(name, value, 'Preferred Time');
      case 'duration':
        return validateRequiredSelect(name, value, 'Duration');
      case 'custom_duration':
        if (formData.duration === 'custom') {
          if (!value) {
            setErrors(prev => ({ ...prev, custom_duration: 'Custom duration is required.' }));
            return false;
          } else if (isNaN(value) || value <= 0 || value > 120) {
            setErrors(prev => ({ ...prev, custom_duration: 'Duration must be between 1-120 minutes.' }));
            return false;
          } else {
            setErrors(prev => ({ ...prev, custom_duration: '' }));
            return true;
          }
        }
        return true;
      case 'priority':
        return validateRequiredSelect(name, value, 'Priority');
      case 'meeting_mode':
        return validateRequiredSelect(name, value, 'Meeting Mode');
      case 'reason':
        return validateReason(value);
      case 'attachment':
        return validateFile(value);
      default:
        return true;
    }
  };

  // Validate the entire form
  const validateForm = () => {
    let isValid = true;
    
    // Validate faculty selection
    if (!validateFaculty()) isValid = false;
    
    // Validate required fields
    if (!validateRequiredSelect('course', formData.course, 'Course')) isValid = false;
    if (!validateDate('appointment_date', formData.appointment_date, 'Preferred Date')) isValid = false;
    if (!validateTime('appointment_time', formData.appointment_time, 'Preferred Time')) isValid = false;
    if (!validateRequiredSelect('duration', formData.duration, 'Duration')) isValid = false;
    
    // Validate custom duration if that option is selected
    if (formData.duration === 'custom' && !validateField('custom_duration', formData.custom_duration)) isValid = false;
    
    if (!validateRequiredSelect('priority', formData.priority, 'Priority')) isValid = false;
    
    // Validate meeting mode
    if (!formData.meeting_mode) {
      setErrors(prev => ({ ...prev, meeting_mode: 'Meeting Mode is required.' }));
      isValid = false;
    }
    
    // Validate reason
    if (!validateReason()) isValid = false;
    
    // Validate file if one is selected
    if (selectedFile && !isFileValid) isValid = false;
    
    // Validate alternative slots
    if (!validateAlternativeSlots()) isValid = false;
    
    return isValid;
  };

  // Display a message/notification
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type, visible: true });
    
    // Auto hide message after 5 seconds except for error messages
    if (type !== 'error') {
      setTimeout(() => {
        setMessage(prev => ({ ...prev, visible: false }));
      }, 5000);
    }
  };

  // Reset the form to initial state
  const resetForm = () => {
    setFormData({
      faculty: '',
      course: '',
      appointment_date: '',
      appointment_time: '',
      duration: '',
      custom_duration: '',
      meeting_mode: '',
      priority: '',
      phone: '',
      reason: '',
      alt_date_1: '',
      alt_time_1: '',
      alt_date_2: '',
      alt_time_2: ''
    });
    
    setSelectedFaculty(null);
    setSearchQuery('');
    setSearchResults([]);
    
    setSelectedFile(null);
    setCharCount(0);
    clearAllErrors();
    
    // Also reset the file input element
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset form if using a ref
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  // Handle review button click
  const handleReviewClick = () => {
    clearAllErrors();
    
    if (validateForm()) {
      // Add this code to forcefully hide the navbar
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      // Delay showing the modal slightly to ensure CSS classes are applied first
      setTimeout(() => {
        setShowModal(true);
      }, 50);
    } else {
      showMessage('Please fix the errors in the form before reviewing.', 'warning');
      
      // Scroll to first error if any
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      }
    }
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    
    // Delay removing classes to avoid visual jumps
    setTimeout(() => {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('modal-open');
    }, 300);
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Create submission data with student info and faculty info
    const submissionData = {
      ...formData,
      studentInfo: {
        ...studentInfo,
        userId: currentUser._id
      },
      facultyInfo: selectedFaculty
    };
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', submissionData);
      console.log('File:', selectedFile);
      
      handleCloseModal(); // Use the new close modal function
      setIsSubmitting(false);
      showMessage('Your appointment request has been submitted successfully!', 'success');
      resetForm();
    }, 1500);
  };

  // Format a date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Modal animation variants
  const modalOverlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const modalContentVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };
  
  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Add a cleanup function to restore scrolling if component unmounts with modal open
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('modal-open');
    };
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50 py-8 w-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 pb-20"> {/* Added pb-20 for extra bottom padding */}
        {/* Loading Indicator */}
        {isLoading && (
          <div className="w-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Message/Notification Area */}
        <AnimatePresence>
          {message.visible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
                message.type === 'warning' ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' :
                message.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
                'bg-blue-100 border border-blue-300 text-blue-800'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden w-full border border-blue-100 mb-10" /* Added mb-10 for margin bottom */
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Header */}
          <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h1 className="text-3xl font-bold text-white">Faculty Appointment Booking</h1>
            <p className="text-blue-50 mt-2">Schedule a meeting with university faculty members</p>
          </div>

          {/* Student Information Section */}
          {!isLoading && (
            <div className="bg-indigo-50 p-6 border-b border-indigo-100">
              <h2 className="text-xl font-semibold text-indigo-900 mb-4">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="font-medium">{studentInfo.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Department</span>
                  <span className="font-medium">{studentInfo.department}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Year</span>
                  <span className="font-medium">{studentInfo.year}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Roll Number</span>
                  <span className="font-medium">{studentInfo.rollNumber}</span>
                </div>
                <div className="flex flex-col md:col-span-2">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="font-medium">{studentInfo.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="p-8">
            <form ref={formRef} className="space-y-6" id="appointment-form">
              {/* Faculty Search Input - NEW */}
              <div ref={searchRef} className="relative">
                <label htmlFor="faculty" className="block text-gray-700 text-md font-semibold mb-2">
                  Faculty Name: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="faculty"
                    name="faculty"
                    value={searchQuery}
                    onChange={handleChange}
                    onFocus={() => setShowDropdown(true)}
                    className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                      errors.faculty ? 'border-red-500' : ''
                    }`}
                    placeholder="Search for faculty by name or department"
                    autoComplete="off"
                    required
                  />
                  {selectedFaculty && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium py-1 px-2 rounded-full">Selected</span>
                    </div>
                  )}
                </div>
                {errors.faculty && (
                  <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>
                )}
                
                {/* Faculty Search Results Dropdown */}
                {showDropdown && (searchResults.length > 0 || isSearching) && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-300 max-h-60 overflow-y-auto invisible-scrollbar">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                        Searching...
                      </div>
                    ) : (
                      <ul className="py-1">
                        {searchResults.map((faculty) => (
                          <li 
                            key={faculty.id}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                            onClick={() => handleFacultySelect(faculty)}
                          >
                            <div className="font-medium">{faculty.name}</div>
                            <div className="text-sm text-gray-600 flex justify-between">
                              <span>{faculty.department}</span>
                              <span className="text-blue-600">{faculty.designation}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                {/* Selected Faculty Info Card */}
                {selectedFaculty && (
                  <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{selectedFaculty.name}</h4>
                        <p className="text-sm text-gray-600">{selectedFaculty.department}</p>
                        <p className="text-sm text-gray-600">{selectedFaculty.email}</p>
                      </div>
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium py-1 px-2 rounded">
                        {selectedFaculty.designation}
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="mt-2 text-sm text-red-500 hover:text-red-700"
                      onClick={() => {
                        setSelectedFaculty(null);
                        setSearchQuery('');
                        setFormData(prev => ({ ...prev, faculty: '' }));
                      }}
                    >
                      Change faculty
                    </button>
                  </div>
                )}
              </div>

              {/* Course Input */}
              <div>
                <label htmlFor="course" className="block text-gray-700 text-md font-semibold mb-2">
                  Course / Subject: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                    errors.course ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter course or subject name"
                  required
                />
                {errors.course && (
                  <p className="text-red-500 text-xs mt-1">{errors.course}</p>
                )}
              </div>

              {/* Date, Time and Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="appointment_date" className="block text-gray-700 text-md font-semibold mb-2">
                    Preferred Date: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="appointment_date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    min={setMinDate()}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                      errors.appointment_date ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  {errors.appointment_date && (
                    <p className="text-red-500 text-xs mt-1">{errors.appointment_date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="appointment_time" className="block text-gray-700 text-md font-semibold mb-2">
                    Preferred Time: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="appointment_time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    min="09:00"
                    max="17:00"
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                      errors.appointment_time ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Hours: 9am-5pm</p>
                  {errors.appointment_time && (
                    <p className="text-red-500 text-xs mt-1">{errors.appointment_time}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-gray-700 text-md font-semibold mb-2">
                    Duration: <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                        errors.duration ? 'border-red-500' : ''
                      }`}
                      required
                    >
                      <option value="" disabled>Select duration</option>
                      <option value="default">Default (20 minutes)</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="20">20 minutes</option>
                      <option value="25">25 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="35">35 minutes</option>
                      <option value="40">40 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="50">50 minutes</option>
                      <option value="55">55 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="custom">Custom time</option>
                    </select>
                    {formData.duration === 'custom' && (
                      <div className="mt-2">
                        <input
                          type="number"
                          id="custom_duration"
                          name="custom_duration"
                          value={formData.custom_duration}
                          onChange={handleChange}
                          min="1"
                          max="120"
                          placeholder="Enter minutes (1-120)"
                          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                            errors.custom_duration ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {errors.custom_duration && (
                          <p className="text-red-500 text-xs mt-1">{errors.custom_duration}</p>
                        )}
                      </div>
                    )}
                    {errors.duration && (
                      <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Meeting Mode and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                <div>
                  <label className="block text-gray-700 text-md font-semibold mb-2">
                    Meeting Mode: <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col space-y-2 mt-1">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="in-person"
                        name="meeting_mode"
                        value="in-person"
                        checked={formData.meeting_mode === 'in-person'}
                        onChange={handleRadioChange}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <label htmlFor="in-person" className="text-gray-700 text-sm">
                        In-Person (Office Hours)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="virtual"
                        name="meeting_mode"
                        value="virtual"
                        checked={formData.meeting_mode === 'virtual'}
                        onChange={handleRadioChange}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <label htmlFor="virtual" className="text-gray-700 text-sm">
                        Virtual (Google Meet)
                      </label>
                    </div>
                  </div>
                  {errors.meeting_mode && (
                    <p className="text-red-500 text-xs mt-1">{errors.meeting_mode}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-gray-700 text-md font-semibold mb-2">
                    Priority: <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                      errors.priority ? 'border-red-500' : ''
                    }`}
                    required
                  >
                    <option value="" disabled>Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  {errors.priority && (
                    <p className="text-red-500 text-xs mt-1">{errors.priority}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-gray-700 text-md font-semibold mb-2">
                    Phone (Optional):
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    placeholder="e.g., 555-123-4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Reason for Appointment */}
              <div>
                <label htmlFor="reason" className="block text-gray-700 text-md font-semibold mb-2">
                  Reason for Appointment: <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows="4"
                  value={formData.reason}
                  onChange={handleChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                    errors.reason ? 'border-red-500' : ''
                  }`}
                  placeholder={`Please provide details (${MIN_REASON_CHARS}-${MAX_REASON_CHARS} characters)`}
                  required
                ></textarea>
                <div className={`text-xs text-right mt-1 ${
                  charCount < MIN_REASON_CHARS || charCount > MAX_REASON_CHARS 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`}>
                  {charCount} / {MAX_REASON_CHARS} characters
                </div>
                {errors.reason && (
                  <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                )}
              </div>

              {/* File Attachment */}
              <div>
                <label htmlFor="attachment" className="block text-gray-700 text-md font-semibold mb-2">
                  Attachment (Optional):
                </label>
                <input
                  type="file"
                  id="attachment"
                  name="attachment"
                  ref={fileInputRef}
                  onChange={handleChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border rounded p-2 focus:outline-none focus:shadow-outline focus:border-blue-500"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                {fileInfo && (
                  <div className="text-sm text-gray-600 mt-1">{fileInfo}</div>
                )}
                <div className={`text-xs mt-1 ${errors.file ? 'text-red-500' : 'text-gray-500'}`}>
                  {errors.file || `Max ${MAX_FILE_SIZE_MB}MB. Allowed types: PDF, DOC, DOCX, TXT, JPG, PNG`}
                </div>
              </div>

              {/* Alternative Time Slots */}
              <fieldset className="border border-gray-300 p-4 rounded">
                <legend className="text-md font-semibold text-gray-700 px-2">Alternative Time Slots (Optional)</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-2">
                  <div>
                    <label htmlFor="alt_date_1" className="block text-gray-700 text-sm font-semibold mb-1">
                      Alt. Date 1:
                    </label>
                    <input
                      type="date"
                      id="alt_date_1"
                      name="alt_date_1"
                      value={formData.alt_date_1}
                      onChange={handleChange}
                      min={setMinDate()}
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                        errors.alt_date_1 ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.alt_date_1 && (
                      <p className="text-red-500 text-xs mt-1">{errors.alt_date_1}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="alt_time_1" className="block text-gray-700 text-sm font-semibold mb-1">
                      Alt. Time 1:
                    </label>
                    <input
                      type="time"
                      id="alt_time_1"
                      name="alt_time_1"
                      value={formData.alt_time_1}
                      onChange={handleChange}
                      min="09:00"
                      max="17:00"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                        errors.alt_time_1 ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.alt_time_1 && (
                      <p className="text-red-500 text-xs mt-1">{errors.alt_time_1}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="alt_date_2" className="block text-gray-700 text-sm font-semibold mb-1">
                      Alt. Date 2:
                    </label>
                    <input
                      type="date"
                      id="alt_date_2"
                      name="alt_date_2"
                      value={formData.alt_date_2}
                      onChange={handleChange}
                      min={setMinDate()}
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                        errors.alt_date_2 ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.alt_date_2 && (
                      <p className="text-red-500 text-xs mt-1">{errors.alt_date_2}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="alt_time_2" className="block text-gray-700 text-sm font-semibold mb-1">
                      Alt. Time 2:
                    </label>
                    <input
                      type="time"
                      id="alt_time_2"
                      name="alt_time_2"
                      value={formData.alt_time_2}
                      onChange={handleChange}
                      min="09:00"
                      max="17:00"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                        errors.alt_time_2 ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.alt_time_2 && (
                      <p className="text-red-500 text-xs mt-1">{errors.alt_time_2}</p>
                    )}
                  </div>
                </div>
                {errors.alt_slots && (
                  <p className="text-red-500 text-xs mt-2">{errors.alt_slots}</p>
                )}
              </fieldset>

              {/* Tips Section */}
              {showTips && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded relative" role="alert">
                  <strong className="font-bold">Tips:</strong>
                  <span className="block sm:inline ml-1">
                    Provide specific details about your questions and consider adding alternative times for faster scheduling.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTips(false)}
                    className="absolute top-1.5 right-1.5 text-blue-500 hover:text-blue-700 focus:outline-none p-1 rounded-full hover:bg-blue-200"
                    aria-label="Dismiss tips"
                  >
                    <svg className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M10 8.586L14.95 3.636a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 11-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 11-1.414-1.414L8.586 10 3.636 5.05A1 1 0 115.05 3.636L10 8.586z"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-gray-200 pb-5"> {/* Added pb-4 for better spacing */}
                <motion.button
                  type="button"
                  onClick={handleReviewClick}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  Review Request
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 pt-0 z-[9999] overflow-y-auto modal-fullscreen-wrapper"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto invisible-scrollbar mx-auto my-4"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 border-b border-gray-200 z-10">
                <h2 className="text-2xl font-bold text-white text-center">Confirm Your Appointment Request</h2>
              </div>
              
              <div className="p-6 md:p-8 space-y-6 text-base modal-content">
                {/* Faculty Information in Modal - NEW */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Faculty Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <dt className="text-blue-700 text-sm font-medium mb-1">Name:</dt>
                      <dd className="text-gray-900 font-semibold">{selectedFaculty?.name || 'Not selected'}</dd>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <dt className="text-blue-700 text-sm font-medium mb-1">Department:</dt>
                      <dd className="text-gray-900 font-semibold">{selectedFaculty?.department || 'Not specified'}</dd>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <dt className="text-blue-700 text-sm font-medium mb-1">Email:</dt>
                      <dd className="text-gray-900 font-semibold">{selectedFaculty?.email || 'Not available'}</dd>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <dt className="text-blue-700 text-sm font-medium mb-1">Designation:</dt>
                      <dd className="text-gray-900 font-semibold">{selectedFaculty?.designation || 'Not specified'}</dd>
                    </div>
                  </div>
                </div>
                
                {/* Student Information in Modal */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <dt className="text-gray-500 text-sm font-medium mb-1">Name:</dt>
                      <dd className="text-gray-900 font-semibold">{studentInfo.name}</dd>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <dt className="text-gray-500 text-sm font-medium mb-1">Department:</dt>
                      <dd className="text-gray-900 font-semibold">{studentInfo.department}</dd>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <dt className="text-gray-500 text-sm font-medium mb-1">Roll Number:</dt>
                      <dd className="text-gray-900 font-semibold">{studentInfo.rollNumber}</dd>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Appointment Details</h3>
                    <dl className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <dt className="text-blue-700 font-semibold mb-1">Course:</dt>
                        <dd className="text-gray-900">{formData.course || 'Not entered'}</dd>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <dt className="text-blue-700 font-semibold mb-1">Date:</dt>
                        <dd className="text-gray-900">{formatDate(formData.appointment_date)}</dd>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <dt className="text-blue-700 font-semibold mb-1">Time:</dt>
                        <dd className="text-gray-900">
                          {formData.appointment_time 
                            ? new Date(`2000-01-01T${formData.appointment_time}`).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not selected'
                          }
                        </dd>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <dt className="text-blue-700 font-semibold mb-1">Duration:</dt>
                        <dd className="text-gray-900">
                          {formData.duration ? 
                            formData.duration === 'default' ? 'Default (20 minutes)' :
                            formData.duration === 'custom' ? `${formData.custom_duration} minutes (Custom)` :
                            `${formData.duration} minutes` 
                            : 'Not selected'}
                        </dd>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <dt className="text-blue-700 font-semibold mb-1">Meeting Mode:</dt>
                        <dd className="text-gray-900">
                          {formData.meeting_mode === 'in-person' 
                            ? 'In-Person (Office Hours)' 
                            : formData.meeting_mode === 'virtual' 
                              ? 'Virtual (Google Meet)' 
                              : 'Not selected'
                          }
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h3>
                    <dl className="space-y-4">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <dt className="text-indigo-700 font-semibold mb-1">Priority:</dt>
                        <dd className="text-gray-900">{formData.priority || 'Not selected'}</dd>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <dt className="text-indigo-700 font-semibold mb-1">Phone:</dt>
                        <dd className="text-gray-900">{formData.phone || 'Not provided'}</dd>
                      </div>
                      
                      {/* Improved reason display container */}
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <dt className="text-indigo-700 font-semibold mb-2">Reason:</dt>
                        <div className="overflow-auto max-h-32 md:max-h-48 bg-white p-3 rounded border border-indigo-100 invisible-scrollbar">
                          <p className="text-gray-900 whitespace-pre-wrap break-words">{formData.reason || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <dt className="text-indigo-700 font-semibold mb-1">Attachment:</dt>
                        <dd className="text-gray-900 truncate">
                          {selectedFile 
                            ? <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">{`${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`}</span>
                              </span>
                            : 'None'
                          }
                        </dd>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-gray-800 font-semibold mb-3">Alternative Time Slots:</h4>
                        <div className="space-y-3 pl-2">
                          <p className="flex flex-wrap items-start">
                            <span className="w-20 inline-block font-medium text-gray-700 mr-2">Alt. Slot 1:</span>
                            <span className="text-gray-900 flex-1">{formData.alt_date_1 && formData.alt_time_1 
                              ? `${formatDate(formData.alt_date_1)} at ${
                                  new Date(`2000-01-01T${formData.alt_time_1}`).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                }`
                              : 'Not provided'
                            }</span>
                          </p>
                          <p className="flex flex-wrap items-start">
                            <span className="w-20 inline-block font-medium text-gray-700 mr-2">Alt. Slot 2:</span>
                            <span className="text-gray-900 flex-1">{formData.alt_date_2 && formData.alt_time_2 
                              ? `${formatDate(formData.alt_date_2)} at ${
                                  new Date(`2000-01-01T${formData.alt_time_2}`).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                }`
                              : 'Not provided'
                            }</span>
                          </p>
                        </div>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-gray-50 p-5 border-t border-gray-200 flex justify-center space-x-6 z-10">
                <motion.button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  Edit Request
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l-4.95-4.95a1 1 0 11-1.414-1.414L8 12.586z" clipRule="evenodd" />
                      </svg>
                      Confirm & Submit
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FacultyAppointmentComponent;
