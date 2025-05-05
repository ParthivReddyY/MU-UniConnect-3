import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../contexts/AuthContext';
import api from '../../../../../utils/axiosConfig';
import { academicStructure } from '../../../../../utils/academicDataUtils';

const PresentationCreationForm = ({ onPresentationCreated, onCancel, initialData = null, defaultTargetAudience = null, isEditMode = false }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const departmentDropdownRef = useRef(null);
  
  // Form state with default values
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: { year: [], school: [], department: [] },
    participationType: 'individual',
    teamSizeMin: 1,
    teamSizeMax: 1,
    venue: '',
    hostName: currentUser?.name || '', 
    hostDepartment: currentUser?.department || '', 
    registrationPeriod: { start: '', end: '' },
    presentationPeriod: { start: '', end: '' },
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

  // Department search functionality state
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showSlotPreview, setShowSlotPreview] = useState(false);
  const [generatedSlots, setGeneratedSlots] = useState([]);
  
  // School options
  const schoolOptions = [
    { value: 'École Centrale School of Engineering(ECSE)', label: 'École Centrale School of Engineering' },
    { value: 'School Of Law(SOL)', label: 'School of Law' },
    { value: 'School of Management(SOM)', label: 'School of Management' },
    { value: 'Indira Mahindra School of Education(IMSOE)', label: 'Indira Mahindra School of Education' },
    { value: 'School of Digital Media and Communication(SDMC)', label: 'School of Digital Media & Communication' },
    { value: 'School of Design Innovation(SODI)', label: 'School of Design Innovation' },
    { value: 'School of Hospitality Management(SOHM)', label: 'School of Hospitality Management' }
  ];

  const yearOptions = [
    { value: 1, label: '1st Year' },
    { value: 2, label: '2nd Year' },
    { value: 3, label: '3rd Year' },
    { value: 4, label: '4th Year' },
    { value: 5, label: '5th Year' }
  ];

  // Initialize form with data if provided
  useEffect(() => {
    // Handle initialization from props
    if (initialData) {
      setFormData(prevData => ({ ...prevData, ...initialData }));
    } else if (defaultTargetAudience) {
      setFormData(prev => ({
        ...prev,
        targetAudience: {
          year: [...defaultTargetAudience.year],
          school: [...defaultTargetAudience.school],
          department: [...defaultTargetAudience.department]
        }
      }));
    }
    
    // Always ensure host info is set from currentUser if available
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        hostName: prev.hostName || currentUser.name || '',
        hostDepartment: prev.hostDepartment || currentUser.department || ''
      }));
    }
  }, [initialData, defaultTargetAudience, currentUser]);

  // Handle clicks outside the department dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Unified form field change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle nested object changes (e.g., registrationPeriod.start)
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      if (!updated[parent]) {
        updated[parent] = {};
      }
      
      updated[parent] = {
        ...updated[parent],
        [field]: value
      };
      
      return updated;
    });
    
    // Clear error for this field
    const errorKey = `${parent}.${field}`;
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  // Handle checkbox changes for arrays (e.g., targetAudience.year)
  const handleCheckboxChange = (parent, field, value, checked) => {
    setFormData(prev => {
      let updatedValues = [...prev[parent][field]];
      
      // Convert year values to numbers if the field is 'year'
      const processedValue = field === 'year' ? Number(value) : value;
      
      if (checked) {
        updatedValues.push(processedValue);
      } else {
        updatedValues = updatedValues.filter(item => {
          // For year comparisons, ensure they're both numbers
          if (field === 'year') {
            return Number(item) !== Number(processedValue);
          }
          return item !== processedValue;
        });
      }
      
      return {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: updatedValues
        }
      };
    });
    
    // Clear error
    const errorKey = `${parent}.${field}`;
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  // Grading criteria management
  const handleCriteriaChange = (index, field, value) => {
    setFormData(prev => {
      const updatedCriteria = [...prev.gradingCriteria];
      
      // If changing weight, ensure it's a valid number between 0-100
      if (field === 'weight') {
        let numValue = parseInt(value, 10);
        // Ensure it's a number and within valid range
        numValue = !isNaN(numValue) ? Math.min(Math.max(numValue, 0), 100) : 0;
        updatedCriteria[index][field] = numValue;
      } else {
        updatedCriteria[index][field] = value;
      }
      
      return {
        ...prev,
        gradingCriteria: updatedCriteria
      };
    });
  };

  // Add a new grading criterion with auto weight calculation
  const addGradingCriterion = () => {
    setFormData(prev => {
      const existingCriteria = [...prev.gradingCriteria];
      const currentTotal = existingCriteria.reduce((sum, c) => sum + (parseInt(c.weight, 10) || 0), 0);
      
      // Calculate weight for new criterion to reach 100%
      let newWeight = 0;
      if (existingCriteria.length === 0) {
        newWeight = 100; // First criterion gets 100%
      } else if (currentTotal < 100) {
        newWeight = 100 - currentTotal; // Add remaining percentage
      } else {
        // Redistribute weights
        const reduction = Math.ceil(10 / Math.max(1, existingCriteria.length));
        existingCriteria.forEach((c, i) => {
          existingCriteria[i].weight = Math.max(5, (parseInt(c.weight, 10) || 0) - reduction);
        });
        
        const newTotal = existingCriteria.reduce((sum, c) => sum + (parseInt(c.weight, 10) || 0), 0);
        newWeight = 100 - newTotal;
      }
      
      return {
        ...prev,
        gradingCriteria: [
          ...existingCriteria,
          { name: '', weight: newWeight }
        ]
      };
    });
  };

  // Remove a grading criterion
  const removeGradingCriterion = (index) => {
    setFormData(prev => ({
      ...prev,
      gradingCriteria: prev.gradingCriteria.filter((_, i) => i !== index)
    }));
  };

  // Department management helpers
  const formatDepartments = (school) => {
    if (!school || !academicStructure[school]) return [];
    
    // Flatten all departments from all programs in this school
    const departments = [];
    
    Object.values(academicStructure[school]).forEach(depts => {
      depts.forEach(dept => {
        // Only add if not already in the array
        if (!departments.some(d => d.value === dept)) {
          departments.push({ value: dept, label: dept });
        }
      });
    });
    
    return departments;
  };

  // Map academicStructure to the format expected by this component
  const academicData = Object.keys(academicStructure).reduce((acc, school) => {
    acc[school] = formatDepartments(school);
    return acc;
  }, {});

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
    
    setShowDepartmentDropdown(false);
  };

  const handleRemoveDepartment = (value) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        department: prev.targetAudience.department.filter(dept => dept !== value)
      }
    }));
  };

  // Slot generation preview
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

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    const requiredFields = [
      { field: 'title', message: "Title is required" },
      { field: 'venue', message: "Venue is required" },
      { field: 'registrationPeriod.start', message: "Registration start date is required" },
      { field: 'registrationPeriod.end', message: "Registration end date is required" },
      { field: 'presentationPeriod.start', message: "Presentation start date is required" },
      { field: 'presentationPeriod.end', message: "Presentation end date is required" }
    ];
    
    requiredFields.forEach(({ field, message }) => {
      const fieldParts = field.split('.');
      let value = fieldParts.length === 1 ? formData[field] : formData[fieldParts[0]][fieldParts[1]];
      if (!value) errors[field] = message;
    });
    
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
    
    // Team size validation for team presentations
    if (formData.participationType === 'team') {
      const minTeamSize = parseInt(formData.teamSizeMin, 10);
      const maxTeamSize = parseInt(formData.teamSizeMax, 10);
      
      if (isNaN(minTeamSize) || minTeamSize < 1) {
        errors.teamSizeMin = "Minimum team size must be at least 1";
      }
      
      if (isNaN(maxTeamSize) || maxTeamSize < 1) {
        errors.teamSizeMax = "Maximum team size must be at least 1";
      }
      
      if (minTeamSize > maxTeamSize) {
        errors.teamSizeMax = "Maximum team size cannot be less than minimum";
      }
    }
    
    // Target audience validation
    if (formData.targetAudience.year.length === 0) {
      errors["targetAudience.year"] = "Please select at least one academic year";
    }
    
    if (formData.targetAudience.school.length === 0) {
      errors["targetAudience.school"] = "Please select at least one school";
    }
    
    // Grading criteria validation
    if (formData.customGradingCriteria) {
      // Calculate total weight
      const totalWeight = formData.gradingCriteria.reduce(
        (sum, criterion) => sum + (parseInt(criterion.weight, 10) || 0), 0
      );
      
      if (totalWeight !== 100) {
        errors.gradingCriteria = `Total grading criteria weight must equal 100% (currently ${totalWeight}%)`;
      }
      
      // Check for empty criterion names
      if (formData.gradingCriteria.some(c => !c.name.trim())) {
        errors.gradingCriteriaNames = "All grading criteria must have names";
      }
    }
    
    // Slot configuration validation
    if (!formData.slotConfig.startTime || !formData.slotConfig.endTime) {
      errors.slotConfig = "Please specify slot start and end times";
    } else {
      // Validate start time is before end time
      const [startHour, startMinute] = formData.slotConfig.startTime.split(':').map(Number);
      const [endHour, endMinute] = formData.slotConfig.endTime.split(':').map(Number);
      
      if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
        errors.slotConfig = "Slot start time must be before end time";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast.error("Please fix the form errors before submitting");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format dates properly for backend
      const formatDateForBackend = (dateString) => {
        if (!dateString) return null;
        
        // Log the input date string
        console.log(`Formatting date: ${dateString}`);
        
        // Create a proper date object
        const date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.error(`Invalid date: ${dateString}`);
          return null;
        }
        
        // Return as ISO string
        const isoString = date.toISOString();
        console.log(`Formatted to ISO: ${isoString}`);
        return isoString;
      };
      
      // Log the original registration period data
      console.log('Original registration period data:', {
        start: formData.registrationPeriod.start,
        end: formData.registrationPeriod.end
      });
      
      // Convert year values to numbers
      const processedTargetAudience = {
        year: formData.targetAudience.year.map(y => Number(y)),
        school: formData.targetAudience.school,
        department: formData.targetAudience.department
      };
      
      // Prepare data with formatted dates and validated fields
      const formattedData = {
        title: formData.title,
        description: formData.description || '',
        venue: formData.venue,
        registrationStart: formatDateForBackend(formData.registrationPeriod.start),
        registrationEnd: formatDateForBackend(formData.registrationPeriod.end),
        presentationStart: formatDateForBackend(formData.presentationPeriod.start),
        presentationEnd: formatDateForBackend(formData.presentationPeriod.end),
        participationType: formData.participationType,
        teamSizeMin: parseInt(formData.teamSizeMin, 10) || 1,
        teamSizeMax: parseInt(formData.teamSizeMax, 10) || 1,
        slotConfig: {
          startTime: formData.slotConfig.startTime,
          endTime: formData.slotConfig.endTime,
          duration: parseInt(formData.slotConfig.duration, 10),
          buffer: parseInt(formData.slotConfig.buffer, 10)
        },
        targetAudience: processedTargetAudience,
        customGradingCriteria: formData.customGradingCriteria,
        gradingCriteria: formData.customGradingCriteria ? 
          formData.gradingCriteria.map(criterion => ({
            name: criterion.name.trim(),
            weight: parseInt(criterion.weight, 10)
          })) : undefined
      };
      
      // Log formatted data for debugging
      console.log('Formatted data being sent to server:', {
        registrationStart: formattedData.registrationStart,
        registrationEnd: formattedData.registrationEnd
      });
      
      // Submit data
      let response;
      if (isEditMode) {
        response = await api.put(`/api/presentations/${formData._id}`, formattedData);
      } else {
        response = await api.post('/api/presentations/create', formattedData);
      }
      
      if (response.data) {
        toast.success(isEditMode ? 'Presentation updated successfully!' : 'Presentation created successfully!');
        onPresentationCreated(response.data.presentation || response.data);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} presentation`);
    } finally {
      setIsLoading(false);
    }
  };

  // Error summary display
  const renderFormErrorSummary = () => {
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length === 0) return null;
    
    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-circle text-red-500"></i>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Please fix the following errors:
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc pl-5 space-y-1">
                {errorKeys.map(key => (
                  <li key={key}>{formErrors[key]}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{isEditMode || initialData ? 'Edit' : 'Create'} Presentation Event</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {Object.keys(formErrors).length > 0 && renderFormErrorSummary()}
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
                    className={`w-full px-4 py-2 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]`}
                    placeholder="Enter presentation description"
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
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
                        type="date"
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
                        type="date"
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
                  {formErrors.slotConfig && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.slotConfig}</p>
                  )}
                  <button 
                    type="button"
                    onClick={generateSlots}
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
                          ${formData.targetAudience.year.includes(option.value) || 
                            formData.targetAudience.year.includes(Number(option.value)) || 
                            formData.targetAudience.year.includes(String(option.value)) 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-300 hover:bg-gray-50'}
                        `}
                        onClick={() => handleCheckboxChange('targetAudience', 'year', option.value, 
                          !formData.targetAudience.year.some(y => Number(y) === Number(option.value)))}
                      >
                        <input 
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData.targetAudience.year.some(y => Number(y) === Number(option.value))}
                          onChange={(e) => handleCheckboxChange('targetAudience', 'year', option.value, e.target.checked)}
                        />
                        <span className="ml-2 text-sm">{option.label}</span>
                        {formData.targetAudience.year.some(y => Number(y) === Number(option.value)) && (
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
                        <div className="ml-3 flex items-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={criterion.weight}
                            onChange={(e) => handleCriteriaChange(index, 'weight', e.target.value)}
                            className="w-12 px-1 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={!formData.customGradingCriteria}
                          />
                          <span className="ml-1 text-gray-700">%</span>
                        </div>
                      </div>
                    </div>
                    {formData.gradingCriteria.length > 1 && formData.customGradingCriteria && (
                      <button
                        type="button"
                        onClick={() => removeGradingCriterion(index)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Remove criterion"
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
                    {isEditMode || initialData ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <>{isEditMode || initialData ? 'Update' : 'Create'} Presentation</>
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
