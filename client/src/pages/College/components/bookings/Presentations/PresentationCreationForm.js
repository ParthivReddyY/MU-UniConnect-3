import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../contexts/AuthContext';
import api from '../../../../../utils/axiosConfig';

const PresentationCreationForm = ({ onPresentationCreated, onCancel, initialData = null }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: {
      year: [],
      school: [],
      department: []
    },
    participationType: 'individual',
    teamSizeMin: 1,
    teamSizeMax: 1,
    venue: '',
    hostName: currentUser.name, // Add host name from current user
    hostDepartment: currentUser.department || '', // Add host department from current user
    registrationPeriod: {
      start: '',
      end: ''
    },
    presentationPeriod: {
      start: '',
      end: ''
    },
    slotConfig: {
      duration: 15,
      buffer: 5,
      startTime: '09:00',
      endTime: '17:00',
      customDays: false,
      days: []
    },
    customGradingCriteria: false,
    gradingCriteria: [
      { name: 'Content', weight: 30 },
      { name: 'Delivery', weight: 30 },
      { name: 'Visual Aids', weight: 20 },
      { name: 'Q&A', weight: 20 }
    ]
  });

  // School and department options from SignUp.js structure
  const schoolOptions = [
    { value: 'École Centrale School of Engineering(ECSE)', label: 'École Centrale School of Engineering' },
    { value: 'School Of Law(SOL)', label: 'School of Law' },
    { value: 'School of Management(SOM)', label: 'School of Management' },
    { value: 'Indira Mahindra School of Education(IMSOE)', label: 'Indira Mahindra School of Education' },
    { value: 'School of Digital Media and Communication(SDMC)', label: 'School of Digital Media & Communication' },
    { value: 'School of Design Innovation(SODI)', label: 'School of Design Innovation' },
    { value: 'School of Hospitality Management(SOHM)', label: 'School of Hospitality Management' }
  ];

  // Department options - restructured to match SignUp.js
  const academicData = {
    "École Centrale School of Engineering(ECSE)": [
      { value: 'AI (Artificial Intelligence)', label: 'AI (Artificial Intelligence)' },
      { value: 'Biotechnology', label: 'Biotechnology' },
      { value: 'Computational Biology', label: 'Computational Biology' },
      { value: 'CSE (Computer Science and Engineering)', label: 'CSE (Computer Science and Engineering)' },
      { value: 'Civil Engineering', label: 'Civil Engineering' },
      { value: 'CM (Computation and Mathematics)', label: 'CM (Computation and Mathematics)' },
      { value: 'ECM (Electronics and Computer Engineering)', label: 'ECM (Electronics and Computer Engineering)' },
      { value: 'Mechanical Engineering (ME)', label: 'Mechanical Engineering (ME)' },
      { value: 'Mechatronics (MT)', label: 'Mechatronics (MT)' },
      { value: 'Nanotechnology', label: 'Nanotechnology' },
      { value: 'ECE (Electronics and Communication Engineering)', label: 'ECE (Electronics and Communication Engineering)' },
      { value: 'Aerospace Engineering', label: 'Aerospace Engineering' },
      { value: 'Electronic and Computer Engineering', label: 'Electronic and Computer Engineering' },
      { value: 'VLSI Design and Technology', label: 'VLSI Design and Technology' }
    ],
    "School of Management(SOM)": [
      { value: 'Applied Economics and Finance', label: 'Applied Economics and Finance' },
      { value: 'Digital Technologies', label: 'Digital Technologies' },
      { value: 'Computational Business Analytics', label: 'Computational Business Analytics' }
    ],
    "School Of Law(SOL)": [
      { value: 'Corporate Law', label: 'Corporate Law' },
      { value: 'Business Laws', label: 'Business Laws' },
      { value: 'Criminal Law', label: 'Criminal Law' },
      { value: 'International Law', label: 'International Law' },
      { value: 'Intellectual Property Law', label: 'Intellectual Property Law' }
    ],
    "Indira Mahindra School of Education(IMSOE)": [
      { value: 'School Education', label: 'School Education' },
      { value: 'Education', label: 'Education' }
    ],
    "School of Digital Media and Communication(SDMC)": [
      { value: 'Computation and Media', label: 'Computation and Media' },
      { value: 'Journalism and Mass Communication', label: 'Journalism and Mass Communication' }
    ],
    "School of Design Innovation(SODI)": [
      { value: 'Design Innovation', label: 'Design Innovation' }
    ],
    "School of Hospitality Management(SOHM)": [
      { value: 'Culinary and Hospitality Management', label: 'Culinary and Hospitality Management' }
    ]
  };

  const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
    { value: '5', label: '5th Year' }
  ];

  // Search functionality for departments dropdown
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const departmentDropdownRef = useRef(null);
  
  // State for storing generated slots
  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [showSlotPreview, setShowSlotPreview] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [departmentDropdownRef]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    
    // Initialize with host data if available
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        hostName: currentUser.name,
        hostDepartment: currentUser.department || ''
      }));
    }
  }, [initialData, currentUser]);

  // Handle input change for regular fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle change for nested fields
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    
    // Clear error for this field if it exists
    const errorKey = `${parent}.${field}`;
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({
        ...prev,
        [errorKey]: undefined
      }));
    }
  };

  // Handle checkbox change for multiple select options
  const handleCheckboxChange = (parent, field, value, checked) => {
    setFormData(prev => {
      let updatedValues = [...prev[parent][field]];
      
      if (checked) {
        updatedValues.push(value);
      } else {
        updatedValues = updatedValues.filter(item => item !== value);
      }
      
      return {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: updatedValues
        }
      };
    });
    
    // Clear error for this field if it exists
    const errorKey = `${parent}.${field}`;
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({
        ...prev,
        [errorKey]: undefined
      }));
    }
  };

  // Handle grading criteria change
  const handleCriteriaChange = (index, field, value) => {
    setFormData(prev => {
      const updatedCriteria = [...prev.gradingCriteria];
      updatedCriteria[index] = {
        ...updatedCriteria[index],
        [field]: field === 'weight' ? parseInt(value, 10) || 0 : value
      };
      return {
        ...prev,
        gradingCriteria: updatedCriteria
      };
    });
  };

  // Add new grading criterion
  const addGradingCriterion = () => {
    setFormData(prev => ({
      ...prev,
      gradingCriteria: [...prev.gradingCriteria, { name: '', weight: 0 }]
    }));
  };

  // Remove grading criterion
  const removeGradingCriterion = (index) => {
    setFormData(prev => ({
      ...prev,
      gradingCriteria: prev.gradingCriteria.filter((_, i) => i !== index)
    }));
  };

  // Generate slots based on configuration - now connected to UI
  const generateSlots = () => {
    const { duration, buffer, startTime, endTime } = formData.slotConfig;
    const totalDuration = duration + buffer;
    const slots = [];
    
    const startTimeMinutes = parseInt(startTime.split(':')[0], 10) * 60 + parseInt(startTime.split(':')[1], 10);
    const endTimeMinutes = parseInt(endTime.split(':')[0], 10) * 60 + parseInt(endTime.split(':')[1], 10);
    
    for (let time = startTimeMinutes; time + duration <= endTimeMinutes; time += totalDuration) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    
    setGeneratedSlots(slots);
    setShowSlotPreview(true);
    return slots;
  };

  // Preview slots
  const handlePreviewSlots = () => {
    generateSlots();
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    // Basic information validation
    if (!formData.title) {
      errors.title = "Title is required";
    }
    
    if (!formData.venue) {
      errors.venue = "Venue is required";
    }
    
    // Dates validation
    if (!formData.registrationPeriod.start) {
      errors["registrationPeriod.start"] = "Registration start date is required";
    }
    
    if (!formData.registrationPeriod.end) {
      errors["registrationPeriod.end"] = "Registration end date is required";
    }
    
    if (!formData.presentationPeriod.start) {
      errors["presentationPeriod.start"] = "Presentation start date is required";
    }
    
    if (!formData.presentationPeriod.end) {
      errors["presentationPeriod.end"] = "Presentation end date is required";
    }
    
    // Date order validation
    if (formData.registrationPeriod.start && formData.registrationPeriod.end) {
      if (new Date(formData.registrationPeriod.start) > new Date(formData.registrationPeriod.end)) {
        errors["registrationPeriod.end"] = "Registration end date must be after start date";
      }
    }
    
    if (formData.presentationPeriod.start && formData.presentationPeriod.end) {
      if (new Date(formData.presentationPeriod.start) > new Date(formData.presentationPeriod.end)) {
        errors["presentationPeriod.end"] = "Presentation end date must be after start date";
      }
    }
    
    // Team size validation
    if (formData.participationType === 'team') {
      if (formData.teamSizeMin <= 0) {
        errors.teamSizeMin = "Minimum team size must be positive";
      }
      
      if (formData.teamSizeMax < formData.teamSizeMin) {
        errors.teamSizeMax = "Maximum team size must be greater than or equal to minimum";
      }
    }
    
    // Target audience validation
    if (formData.targetAudience.year.length === 0) {
      errors["targetAudience.year"] = "Please select at least one academic year";
    }
    
    if (formData.targetAudience.school.length === 0) {
      errors["targetAudience.school"] = "Please select at least one school";
    }
    
    // Validate grading criteria
    if (formData.customGradingCriteria) {
      const totalWeight = formData.gradingCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
      if (totalWeight !== 100) {
        errors.gradingCriteria = `Grading criteria weights must sum to 100%. Current total: ${totalWeight}%`;
      }
      
      const emptyCriterion = formData.gradingCriteria.find(c => !c.name.trim());
      if (emptyCriterion) {
        errors.gradingCriteriaNames = "All grading criteria must have names";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      
      // Scroll to the first error
      const firstErrorKey = Object.keys(formErrors)[0];
      if (firstErrorKey) {
        const element = document.querySelector(`[name="${firstErrorKey}"], [data-error="${firstErrorKey}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate slots for the presentation
      const slots = generateSlots();
      
      // Create data to submit
      const dataToSubmit = {
        ...formData,
        slots
      };
      
      const response = await api.post('/api/presentations', dataToSubmit);
      
      if (response.data.success) {
        toast.success('Presentation event created successfully!');
        onPresentationCreated(response.data.presentation);
      } else {
        toast.error(response.data.message || 'Failed to create presentation event');
      }
    } catch (error) {
      console.error('Error creating presentation:', error);
      toast.error(error.response?.data?.message || 'Failed to create presentation event');
    } finally {
      setIsLoading(false);
    }
  };

  // Get available departments based on selected schools
  const getAvailableDepartments = () => {
    if (formData.targetAudience.school.length === 0) {
      return [];
    }
    
    let availableDepts = [];
    formData.targetAudience.school.forEach(school => {
      const depts = academicData[school] || [];
      availableDepts = [...availableDepts, ...depts];
    });
    
    return availableDepts;
  };

  // Handle adding a department
  const handleAddDepartment = (value) => {
    // Check if department's school is selected
    const deptSchool = Object.entries(academicData).find(([school, depts]) => 
      depts.some(dept => dept.value === value)
    )?.[0];
    
    if (deptSchool && !formData.targetAudience.school.includes(deptSchool)) {
      setFormData(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          school: [...prev.targetAudience.school, deptSchool]
        }
      }));
    }
    
    if (!formData.targetAudience.department.includes(value)) {
      setFormData(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          department: [...prev.targetAudience.department, value]
        }
      }));
    }
    
    // Close dropdown after selection
    setShowDepartmentDropdown(false);
  };

  // Handle removing a department
  const handleRemoveDepartment = (value) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        department: prev.targetAudience.department.filter(dept => dept !== value)
      }
    }));
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Create Presentation Event</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter presentation title"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${formErrors.venue ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter venue"
                  />
                  {formErrors.venue && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.venue}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    placeholder="Enter presentation description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Host Name</label>
                  <input
                    type="text"
                    name="hostName"
                    value={formData.hostName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Host Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Host Department</label>
                  <input
                    type="text"
                    name="hostDepartment"
                    value={formData.hostDepartment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Host Department"
                  />
                </div>
              </div>
            </div>
            
            {/* Date and Time Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Date and Time
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Registration Period *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                      <input
                        type="datetime-local"
                        name="registrationPeriod.start"
                        value={formData.registrationPeriod.start}
                        onChange={(e) => handleNestedChange('registrationPeriod', 'start', e.target.value)}
                        className={`w-full px-4 py-2 border ${formErrors['registrationPeriod.start'] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formErrors['registrationPeriod.start'] && (
                        <p className="mt-1 text-sm text-red-600">{formErrors['registrationPeriod.start']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                      <input
                        type="datetime-local"
                        name="registrationPeriod.end"
                        value={formData.registrationPeriod.end}
                        onChange={(e) => handleNestedChange('registrationPeriod', 'end', e.target.value)}
                        className={`w-full px-4 py-2 border ${formErrors['registrationPeriod.end'] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formErrors['registrationPeriod.end'] && (
                        <p className="mt-1 text-sm text-red-600">{formErrors['registrationPeriod.end']}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Presentation Period *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                      <input
                        type="datetime-local"
                        name="presentationPeriod.start"
                        value={formData.presentationPeriod.start}
                        onChange={(e) => handleNestedChange('presentationPeriod', 'start', e.target.value)}
                        className={`w-full px-4 py-2 border ${formErrors['presentationPeriod.start'] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formErrors['presentationPeriod.start'] && (
                        <p className="mt-1 text-sm text-red-600">{formErrors['presentationPeriod.start']}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                      <input
                        type="datetime-local"
                        name="presentationPeriod.end"
                        value={formData.presentationPeriod.end}
                        onChange={(e) => handleNestedChange('presentationPeriod', 'end', e.target.value)}
                        className={`w-full px-4 py-2 border ${formErrors['presentationPeriod.end'] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formErrors['presentationPeriod.end'] && (
                        <p className="mt-1 text-sm text-red-600">{formErrors['presentationPeriod.end']}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Slot Configuration</label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Duration (min)</label>
                      <input
                        type="number"
                        value={formData.slotConfig.duration}
                        onChange={(e) => handleNestedChange('slotConfig', 'duration', parseInt(e.target.value, 10) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="5"
                        max="120"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Buffer (min)</label>
                      <input
                        type="number"
                        value={formData.slotConfig.buffer}
                        onChange={(e) => handleNestedChange('slotConfig', 'buffer', parseInt(e.target.value, 10) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="60"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                      <input
                        type="time"
                        value={formData.slotConfig.startTime}
                        onChange={(e) => handleNestedChange('slotConfig', 'startTime', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                      <input
                        type="time"
                        value={formData.slotConfig.endTime}
                        onChange={(e) => handleNestedChange('slotConfig', 'endTime', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handlePreviewSlots}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <i className="fas fa-eye mr-2"></i>
                    Preview Slots
                  </button>
                  
                  {showSlotPreview && generatedSlots.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="text-sm text-gray-700 mb-2">
                        {generatedSlots.length} slots will be generated
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {generatedSlots.map((slot, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Participation Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Participation Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Participation Type</label>
                  <div className="flex space-x-4 mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="participationType"
                        value="individual"
                        checked={formData.participationType === 'individual'}
                        onChange={handleInputChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Individual</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="participationType"
                        value="team"
                        checked={formData.participationType === 'team'}
                        onChange={handleInputChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Team</span>
                    </label>
                  </div>
                </div>
                
                {formData.participationType === 'team' && (
                  <div className="flex space-x-6">
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Team Size</label>
                      <input
                        type="number"
                        name="teamSizeMin"
                        value={formData.teamSizeMin}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border ${formErrors.teamSizeMin ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        min="1"
                        max="10"
                      />
                      {formErrors.teamSizeMin && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.teamSizeMin}</p>
                      )}
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
                      <input
                        type="number"
                        name="teamSizeMax"
                        value={formData.teamSizeMax}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border ${formErrors.teamSizeMax ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        min="1"
                        max="10"
                      />
                      {formErrors.teamSizeMax && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.teamSizeMax}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Target Audience */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Target Audience *
              </h3>
              
              <div className="space-y-6">
                {/* Academic Year Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" data-error="targetAudience.year">
                    {yearOptions.map(option => (
                      <div 
                        key={option.value}
                        className={`
                          relative flex items-center p-3 border rounded-md cursor-pointer
                          ${formData.targetAudience.year.includes(option.value) 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-300 hover:bg-gray-50'}
                        `}
                        onClick={() => handleCheckboxChange('targetAudience', 'year', option.value, !formData.targetAudience.year.includes(option.value))}
                      >
                        <input 
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData.targetAudience.year.includes(option.value)}
                          onChange={(e) => handleCheckboxChange('targetAudience', 'year', option.value, e.target.checked)}
                        />
                        <span className="ml-2 text-sm">{option.label}</span>
                        {formData.targetAudience.year.includes(option.value) && (
                          <span className="absolute top-1 right-1 text-blue-500">
                            <i className="fas fa-check-circle text-xs"></i>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {formErrors['targetAudience.year'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['targetAudience.year']}</p>
                  )}
                </div>
                
                {/* School Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-error="targetAudience.school">
                    {schoolOptions.map(option => (
                      <div 
                        key={option.value}
                        className={`
                          relative flex items-center p-3 border rounded-md cursor-pointer
                          ${formData.targetAudience.school.includes(option.value) 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-300 hover:bg-gray-50'}
                        `}
                        onClick={() => handleCheckboxChange('targetAudience', 'school', option.value, !formData.targetAudience.school.includes(option.value))}
                      >
                        <input 
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData.targetAudience.school.includes(option.value)}
                          onChange={(e) => handleCheckboxChange('targetAudience', 'school', option.value, e.target.checked)}
                        />
                        <span className="ml-2 text-sm">{option.label}</span>
                        {formData.targetAudience.school.includes(option.value) && (
                          <span className="absolute top-1 right-1 text-blue-500">
                            <i className="fas fa-check-circle text-xs"></i>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {formErrors['targetAudience.school'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['targetAudience.school']}</p>
                  )}
                </div>
                
                {/* Department Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                  {formData.targetAudience.school.length > 0 ? (
                    <div className="space-y-3">
                      {formData.targetAudience.department.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.targetAudience.department.map(deptValue => {
                            const deptObj = getAvailableDepartments().find(d => d.value === deptValue);
                            return (
                              <div 
                                key={deptValue}
                                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                              >
                                <span>{deptObj ? deptObj.label : deptValue}</span>
                                <button 
                                  type="button"
                                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                                  onClick={() => handleRemoveDepartment(deptValue)}
                                >
                                  <i className="fas fa-times-circle"></i>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="relative" ref={departmentDropdownRef}>
                        <input
                          type="text"
                          value={departmentSearchQuery}
                          onChange={(e) => setDepartmentSearchQuery(e.target.value)}
                          onFocus={() => setShowDepartmentDropdown(true)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search and select departments"
                        />
                        
                        {showDepartmentDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {getAvailableDepartments().filter(dept => 
                              dept.label.toLowerCase().includes(departmentSearchQuery.toLowerCase())
                            ).map(dept => (
                              <div 
                                key={dept.value}
                                className={`
                                  p-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between
                                  ${formData.targetAudience.department.includes(dept.value) ? 'bg-blue-50' : ''}
                                `}
                                onClick={() => handleAddDepartment(dept.value)}
                              >
                                <span className="text-sm">{dept.label}</span>
                                {formData.targetAudience.department.includes(dept.value) && (
                                  <i className="fas fa-check text-blue-500"></i>
                                )}
                              </div>
                            ))}
                            {getAvailableDepartments().filter(dept => 
                              dept.label.toLowerCase().includes(departmentSearchQuery.toLowerCase())
                            ).length === 0 && (
                              <div className="p-2 text-gray-500 text-sm">No departments found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      Please select at least one school to view available departments
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Grading Criteria */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Grading Criteria
              </h3>
              
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.customGradingCriteria}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      customGradingCriteria: !prev.customGradingCriteria
                    }))}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">Use custom grading criteria</span>
                </label>
              </div>
              
              {formErrors.gradingCriteria && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {formErrors.gradingCriteria}
                </div>
              )}
              
              {formErrors.gradingCriteriaNames && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {formErrors.gradingCriteriaNames}
                </div>
              )}
              
              <div className={`space-y-3 ${formData.customGradingCriteria ? '' : 'opacity-50 pointer-events-none'}`}>
                {formData.gradingCriteria.map((criterion, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={criterion.name}
                        onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                        placeholder="Criterion name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.customGradingCriteria}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={criterion.weight}
                          onChange={(e) => handleCriteriaChange(index, 'weight', e.target.value)}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          disabled={!formData.customGradingCriteria}
                        />
                        <span className="ml-3 w-10 text-center text-gray-700">{criterion.weight}%</span>
                      </div>
                    </div>
                    {formData.gradingCriteria.length > 1 && formData.customGradingCriteria && (
                      <button
                        type="button"
                        onClick={() => removeGradingCriterion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
                
                {formData.customGradingCriteria && (
                  <button
                    type="button"
                    onClick={addGradingCriterion}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Criterion
                  </button>
                )}
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="pt-6 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </div>
                ) : (
                  <>Create Presentation</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PresentationCreationForm;
