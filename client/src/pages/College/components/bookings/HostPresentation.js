import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HostPresentation = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetYear: '',
    targetSchool: '',  // Added school field
    targetDepartment: '',
    presentationType: 'single', // Added presentation type field
    minTeamMembers: 2, // Add min team members with default 2
    maxTeamMembers: 5, // Add max team members with default 5
    date: '',
    startTime: '',
    duration: 30, // default 30 minutes
    bufferTime: 5, // default 5 minutes buffer
    venue: ''
  });
  
  // Batch mode additional form fields
  const [batchData, setBatchData] = useState({
    dates: [],
    dateRange: {
      startDate: '',
      endDate: '',
      daysOfWeek: [] // e.g. [1, 3, 5] for Mon, Wed, Fri
    },
    timeSlots: [{ startTime: '', endTime: '', computed: false }]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Academic data structure containing the hierarchy of schools and departments
  const academicData = useMemo(() => ({
    "École Centrale School of Engineering(ECSE)": [
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
    "School of Management(SOM)": [
      "Applied Economics and Finance",
      "Digital Technologies",
      "Computational Business Analytics",
      "MBA",
      "Economics",
      "Finance",
      "Decision Sciences",
      "Marketing",
      "Management",
      "Information Science and Technology"
    ],
    "School Of Law(SOL)": [
      "Corporate Law",
      "Business Laws",
      "Criminal Law",
      "International Law",
      "Intellectual Property Law",
      "Civil and Private Law",
      "Public Law"
    ],
    "Indira Mahindra School of Education(IMSOE)": [
      "School Education",
      "Higher Education",
      "Sociology of Education",
      "Educational Leadership and Management",
      "Psychology of Education",
      "Educational Innovations"
    ],
    "School of Digital Media and Communication(SDMC)": [
      "Journalism and Mass Communication",
      "Media Studies",
      "Film and Television Studies",
      "Strategic Communication"
    ],
    "School of Design Innovation(SODI)": [
      "Design Innovation",
      "Design Thinking",
      "Design for Sustainability"
    ],
    "School of Hospitality Management(SOHM)": [
      "Culinary and Hospitality Management"
    ],
    "All Schools": ["All Departments"]
  }), []);
  
  const [availableDepartments, setAvailableDepartments] = useState([]);
  
  const years = [
    'First Year', 'Second Year', 'Third Year', 'Fourth Year', 'All Years'
  ];
  
  const daysOfWeek = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  // Time suggestions by day of week
  const timeSlotSuggestions = useMemo(() => ({
    0: ['10:00', '11:30', '13:00', '14:30', '16:00'], // Sunday
    1: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'], // Monday
    2: ['09:30', '11:00', '13:30', '15:00', '16:30'], // Tuesday
    3: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'], // Wednesday
    4: ['09:30', '11:00', '13:30', '15:00', '16:30'], // Thursday
    5: ['09:00', '10:30', '12:00', '14:00', '15:30'], // Friday
    6: ['10:00', '11:30', '13:00', '14:30'] // Saturday
  }), []);
  
  // Add missing calculateEndTime function
  const calculateEndTime = (startTime, durationMinutes, bufferTime = 0) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + parseInt(durationMinutes) + parseInt(bufferTime || 0);
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  // Define functions before they're used in useEffect dependencies
  const generateDatesFromRange = useCallback(() => {
    if (!batchData.dateRange.startDate || !batchData.dateRange.endDate || batchData.dateRange.daysOfWeek.length === 0) {
      return [];
    }
    
    const startDate = new Date(batchData.dateRange.startDate);
    const endDate = new Date(batchData.dateRange.endDate);
    const selectedDays = batchData.dateRange.daysOfWeek;
    const dates = [];
    
    // Clone startDate to avoid modifying the original
    const currentDate = new Date(startDate);
    
    // Iterate through all dates in the range
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
      
      // If this day of the week is selected, add it to our dates
      if (selectedDays.includes(dayOfWeek)) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }, [batchData.dateRange]);
  
  const autoPopulateTimeSlots = useCallback(() => {
    const dates = generateDatesFromRange();
    if (dates.length === 0) return;
    
    // Get unique days of week from selected dates
    const uniqueDaysOfWeek = [...new Set(dates.map(date => new Date(date).getDay()))];
    
    // Find common time slots across all selected days
    let commonTimeSlots = [];
    
    uniqueDaysOfWeek.forEach(dayOfWeek => {
      const daySlots = timeSlotSuggestions[dayOfWeek] || [];
      if (commonTimeSlots.length === 0) {
        commonTimeSlots = [...daySlots];
      } else {
        commonTimeSlots = commonTimeSlots.filter(slot => daySlots.includes(slot));
      }
    });
    
    // If no common slots, use the first day's slots
    const slotsToUse = commonTimeSlots.length > 0 ? 
      commonTimeSlots : 
      timeSlotSuggestions[uniqueDaysOfWeek[0]] || [];
    
    // Use first 2-3 slots to avoid overwhelming the user
    const suggestedSlots = slotsToUse.slice(0, 3);
    
    // Update batch data with suggested time slots
    setBatchData(prev => ({
      ...prev,
      timeSlots: suggestedSlots.map(startTime => {
        const endTime = calculateEndTime(startTime, formData.duration, formData.bufferTime);
        return {
          startTime,
          endTime,
          computed: true
        };
      })
    }));
  }, [formData.duration, formData.bufferTime, generateDatesFromRange, timeSlotSuggestions, setBatchData]);

  useEffect(() => {
    fetchPresentationSlots();
  }, []);

  // Update available departments when school changes
  useEffect(() => {
    if (formData.targetSchool) {
      const departments = academicData[formData.targetSchool] || [];
      setAvailableDepartments(departments);
      setFormData(prev => ({
        ...prev,
        targetDepartment: ''
      }));
    } else {
      setAvailableDepartments([]);
    }
  }, [formData.targetSchool, academicData]);

  // Add useEffect to update time slots when dates change
  useEffect(() => {
    if (batchMode) {
      const dates = generateDatesFromRange();
      if (dates.length > 0 && batchData.timeSlots.length === 1 && !batchData.timeSlots[0].startTime) {
        autoPopulateTimeSlots();
      }
    }
  }, [batchData.dateRange, formData.duration, formData.bufferTime, batchMode, generateDatesFromRange, batchData.timeSlots, autoPopulateTimeSlots]);

  const fetchPresentationSlots = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would be an API call
      // For now we'll simulate a delay and use mock data
      setTimeout(() => {
        const mockSlots = [
          {
            _id: '1',
            title: 'Project Defense Session',
            description: 'Present your final year projects for evaluation',
            targetYear: 'Fourth Year',
            targetSchool: 'École Centrale School of Engineering(ECSE)',
            targetDepartment: 'CSE (Computer Science and Engineering)',
            presentationType: 'team',
            date: '2023-11-15',
            startTime: '10:00',
            endTime: '11:00',
            venue: 'Conference Room A',
            duration: 60,
            bufferTime: 10,
            status: 'available'
          },
          {
            _id: '2',
            title: 'Thesis Presentation',
            description: 'Present your thesis work and research findings',
            targetYear: 'All Years',
            targetSchool: 'All Schools',
            targetDepartment: 'All Departments',
            presentationType: 'single',
            date: '2023-11-20',
            startTime: '14:00',
            endTime: '15:30',
            venue: 'Auditorium',
            duration: 90,
            bufferTime: 15,
            status: 'booked',
            bookedBy: {
              name: 'John Doe',
              rollNumber: 'CS2021015'
            }
          }
        ];
        setSlots(mockSlots);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching presentation slots:', error);
      toast.error('Failed to fetch presentation slots');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Removed unused function handleBatchInputChange
  
  // This is a duplicate function, we now use the useCallback version defined above
  /* const generateDatesFromRange = () => {
    // Function body moved to useCallback version above
  }; */
  
  const removeTimeSlot = (index) => {
    setBatchData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };
  
  const handleTimeSlotChange = (index, field, value) => {
    setBatchData(prev => {
      const updatedTimeSlots = [...prev.timeSlots];
      updatedTimeSlots[index] = {
        ...updatedTimeSlots[index],
        [field]: value
      };
      
      // If startTime changed and duration is set, calculate endTime
      if (field === 'startTime' && formData.duration) {
        updatedTimeSlots[index].endTime = calculateEndTime(value, formData.duration);
        updatedTimeSlots[index].computed = true;
      } else if (field === 'endTime') {
        updatedTimeSlots[index].computed = false;
      }
      
      return {
        ...prev,
        timeSlots: updatedTimeSlots
      };
    });
  };

  const suggestTimeSlots = (date) => {
    if (!date) return [];
    
    const dayOfWeek = new Date(date).getDay();
    return timeSlotSuggestions[dayOfWeek] || [];
  };

  const initializeEditMode = (slot) => {
    setFormData({
      title: slot.title,
      description: slot.description,
      targetYear: slot.targetYear,
      targetSchool: slot.targetSchool || '',
      targetDepartment: slot.targetDepartment,
      presentationType: slot.presentationType || 'single',
      minTeamMembers: slot.minTeamMembers || 2,
      maxTeamMembers: slot.maxTeamMembers || 5,
      date: slot.date,
      startTime: slot.startTime,
      duration: slot.duration,
      bufferTime: slot.bufferTime,
      venue: slot.venue
    });
    setEditingSlot(slot._id);
    setBatchMode(false);
    setShowForm(true);
    
    // Scroll to the form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const cancelEdit = () => {
    setEditingSlot(null);
    setShowForm(false);
    resetForm();
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetYear: '',
      targetSchool: '',
      targetDepartment: '',
      presentationType: 'single',
      minTeamMembers: 2,
      maxTeamMembers: 5,
      date: '',
      startTime: '',
      duration: 30,
      bufferTime: 5,
      venue: ''
    });
    
    setBatchData({
      dates: [],
      dateRange: {
        startDate: '',
        endDate: '',
        daysOfWeek: []
      },
      timeSlots: [{ startTime: '', endTime: '', computed: false }]
    });
  };
  
  const handleConfirmDelete = (slotId) => {
    setSlotToDelete(slotId);
    setShowDeleteConfirm(true);
  };
  
  const executeDelete = () => {
    handleDeleteSlot(slotToDelete);
    setShowDeleteConfirm(false);
    setSlotToDelete(null);
  };
  
  const createMultipleSlots = () => {
    // Generate all combinations of dates and times
    let dates = [];
    
    // Either use the manually added dates or generate from date range
    if (batchData.dates.length > 0) {
      dates = batchData.dates;
    } else {
      dates = generateDatesFromRange();
    }
    
    if (dates.length === 0) {
      toast.error('Please select at least one date for your slots');
      return [];
    }
    
    if (batchData.timeSlots.some(slot => !slot.startTime)) {
      toast.error('Please provide start times for all time slots');
      return [];
    }
    
    // Create slot objects for all combinations
    const newSlots = [];
    
    dates.forEach(date => {
      batchData.timeSlots.forEach(timeSlot => {
        // Calculate endTime with buffer time included
        let endTime = timeSlot.endTime;
        if (!endTime) {
          endTime = calculateEndTime(timeSlot.startTime, formData.duration, formData.bufferTime);
        }
        
        newSlots.push({
          _id: Date.now().toString() + Math.random().toString().substring(2, 8),
          ...formData,
          date,
          startTime: timeSlot.startTime,
          endTime,
          displayEndTime: calculateEndTime(timeSlot.startTime, formData.duration), // End time without buffer for display
          actualEndTime: endTime, // End time with buffer for scheduling
          host: {
            userId: currentUser?.userId || '',
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            department: currentUser?.department || ''
          },
          status: 'available'
        });
      });
    });
    
    return newSlots;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingSlot) {
        // Editing an existing slot
        const endTime = calculateEndTime(formData.startTime, formData.duration);
        
        // In a real application, this would be an API call to update
        console.log('Updating presentation slot with ID:', editingSlot);
        
        // Update the slot in the list
        const updatedSlots = slots.map(slot => {
          if (slot._id === editingSlot) {
            return {
              ...slot,
              ...formData,
              endTime
            };
          }
          return slot;
        });
        
        setSlots(updatedSlots);
        toast.success('Presentation slot updated successfully!');
        setEditingSlot(null);
      } else if (batchMode) {
        // Batch creation mode
        const newSlots = createMultipleSlots();
        
        if (newSlots.length === 0) {
          setIsSubmitting(false);
          return;
        }
        
        // In a real application, this would be an API call to create multiple slots
        console.log('Creating multiple presentation slots:', newSlots);
        
        // Add the new slots to the list
        setSlots(prev => [...newSlots, ...prev]);
        toast.success(`Created ${newSlots.length} presentation slots successfully!`);
      } else {
        // Single slot creation
        const endTime = calculateEndTime(formData.startTime, formData.duration);
        
        // Prepare data for submission
        const presentationData = {
          ...formData,
          endTime,
          host: {
            userId: currentUser?.userId || '',
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            department: currentUser?.department || ''
          },
          status: 'available'
        };
        
        // In a real application, this would be an API call
        console.log('Creating presentation slot with data:', presentationData);
        
        // Add the new slot to the list
        const newSlot = {
          _id: Date.now().toString(), 
          ...presentationData
        };
        setSlots(prev => [newSlot, ...prev]);
        toast.success('Presentation slot created successfully!');
      }
      
      // Reset form and state
      resetForm();
      setShowForm(false);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error handling presentation slot:', error);
      toast.error(editingSlot ? 'Failed to update slot' : 'Failed to create slot');
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      setIsLoading(true);
      // In a real application, this would be an API call
      console.log('Deleting slot with ID:', slotId);
      
      // Filter out the deleted slot
      setSlots(prev => prev.filter(slot => slot._id !== slotId));
      toast.success('Slot deleted successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete slot');
      setIsLoading(false);
    }
  };

  // Helper function to format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Add missing handleDayOfWeekToggle function
  const handleDayOfWeekToggle = (dayValue) => {
    setBatchData(prev => {
      const daysOfWeek = [...prev.dateRange.daysOfWeek];
      
      if (daysOfWeek.includes(dayValue)) {
        return {
          ...prev,
          dateRange: {
            ...prev.dateRange,
            daysOfWeek: daysOfWeek.filter(day => day !== dayValue)
          }
        };
      } else {
        return {
          ...prev,
          dateRange: {
            ...prev.dateRange,
            daysOfWeek: [...daysOfWeek, dayValue].sort()
          }
        };
      }
    });
  };
  
  // Add missing addTimeSlot function
  const addTimeSlot = () => {
    setBatchData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: '', endTime: '', computed: false }]
    }));
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-8 w-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      {/* Toast Container */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this presentation slot? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={executeDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Loading Indicator */}
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden w-full border border-amber-100 mb-10"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Header */}
            <div className="p-8 bg-gradient-to-r from-amber-500 to-orange-500">
              <h1 className="text-3xl font-bold text-white">Host Presentation Slots</h1>
              <p className="text-amber-50 mt-2">Create and manage presentation slots for students</p>
            </div>

            <div className="p-6">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingSlot ? 'Edit Presentation Slot' : 'Your Presentation Slots'}
                </h2>
                {!editingSlot && (
                  <button 
                    className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md shadow-sm transition-colors flex items-center"
                    onClick={() => setShowForm(!showForm)}
                  >
                    <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'} mr-2`}></i> 
                    {showForm ? 'Cancel' : 'Add New Slot'}
                  </button>
                )}
              </div>

              {/* Add New Slot Form */}
              {showForm && (
                <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingSlot ? 'Edit Presentation Slot' : 'Create New Presentation Slot'}
                  </h3>
                  
                  {/* Creation Mode Toggle */}
                  {!editingSlot && (
                    <div className="flex items-center mb-4 space-x-4">
                      <span className="text-sm font-medium text-gray-700">Creation Mode:</span>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4 text-amber-500"
                            checked={!batchMode}
                            onChange={() => setBatchMode(false)}
                          />
                          <span className="ml-2 text-gray-700">Single Slot</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4 text-amber-500"
                            checked={batchMode}
                            onChange={() => setBatchMode(true)}
                          />
                          <span className="ml-2 text-gray-700">Multiple Slots</span>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title*
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g., Project Presentation"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Venue*
                        </label>
                        <input
                          type="text"
                          name="venue"
                          value={formData.venue}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g., Conference Room A"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description*
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Describe the purpose of this presentation slot"
                        rows="3"
                        required
                      ></textarea>
                    </div>

                    {/* Presentation Type Selection with Team Members Fields */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Presentation Type*
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="presentationType"
                            value="single"
                            checked={formData.presentationType === 'single'}
                            onChange={handleInputChange}
                            className="form-radio h-4 w-4 text-amber-500"
                          />
                          <span className="ml-2 text-gray-700">Individual Presentation</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="presentationType"
                            value="team"
                            checked={formData.presentationType === 'team'}
                            onChange={handleInputChange}
                            className="form-radio h-4 w-4 text-amber-500"
                          />
                          <span className="ml-2 text-gray-700">Team Presentation</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Team size fields - only show when team presentation is selected */}
                    {formData.presentationType === 'team' && (
                      <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Team Size Requirements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Minimum Team Members*
                            </label>
                            <input
                              type="number"
                              name="minTeamMembers"
                              value={formData.minTeamMembers}
                              onChange={handleInputChange}
                              min="2"
                              max="20"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Maximum Team Members*
                            </label>
                            <input
                              type="number"
                              name="maxTeamMembers"
                              value={formData.maxTeamMembers}
                              onChange={handleInputChange}
                              min={formData.minTeamMembers}
                              max="20"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                              required
                            />
                            {formData.maxTeamMembers < formData.minTeamMembers && (
                              <p className="text-xs text-red-500 mt-1">Maximum must be greater than or equal to minimum</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Year*
                        </label>
                        <select
                          name="targetYear"
                          value={formData.targetYear}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        >
                          <option value="">Select Year</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* School Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target School*
                        </label>
                        <select
                          name="targetSchool"
                          value={formData.targetSchool}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        >
                          <option value="">Select School</option>
                          {Object.keys(academicData).map(school => (
                            <option key={school} value={school}>{school}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Department Selection - based on selected school */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Department*
                        </label>
                        <select
                          name="targetDepartment"
                          value={formData.targetDepartment}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                          disabled={!formData.targetSchool}
                        >
                          <option value="">Select Department</option>
                          {availableDepartments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Single Slot Date/Time */}
                    {!batchMode && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date*
                          </label>
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            required
                          />
                          {formData.date && (
                            <div className="mt-1 text-sm font-medium text-amber-600">
                              {new Date(formData.date).toLocaleDateString(undefined, {weekday: 'long'})}, {new Date(formData.date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time* {formData.date && (
                              <span className="text-amber-600 font-normal">
                                ({new Date(formData.date).toLocaleDateString(undefined, {weekday: 'short'})})
                              </span>
                            )}
                          </label>
                          <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            required
                          />
                          {formData.date && (
                            <div className="mt-1 text-xs text-gray-500">
                              <button 
                                type="button" 
                                className="text-amber-600 hover:text-amber-800 underline"
                                onClick={() => {
                                  const suggestions = suggestTimeSlots(formData.date);
                                  if (suggestions.length > 0) {
                                    setFormData(prev => ({...prev, startTime: suggestions[0]}));
                                  }
                                }}
                              >
                                Suggest times for {new Date(formData.date).toLocaleDateString(undefined, {weekday: 'long'})}
                              </button>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time (Auto-calculated)
                          </label>
                          <input
                            type="time"
                            value={calculateEndTime(formData.startTime, formData.duration)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.bufferTime > 0 ? 
                              `Actual end with ${formData.bufferTime}min buffer: ${calculateEndTime(formData.startTime, formData.duration, formData.bufferTime)}` : 
                              'No buffer time added'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Batch Create Mode - Date Selection */}
                    {batchMode && (
                      <>
                        <div className="border-t border-gray-200 pt-4 mb-4">
                          <h4 className="text-md font-medium text-gray-800 mb-2">Date Selection</h4>
                          
                          {/* Full width date range picker */}
                          <div className="bg-white p-4 rounded-md border border-gray-200 mb-4 w-full">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">Select Date Range</h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                <input
                                  type="date"
                                  value={batchData.dateRange.startDate}
                                  onChange={(e) => {
                                    const { value } = e.target;
                                    setBatchData(prev => ({
                                      ...prev,
                                      dateRange: {
                                        ...prev.dateRange,
                                        startDate: value
                                      }
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                <input
                                  type="date"
                                  value={batchData.dateRange.endDate}
                                  onChange={(e) => setBatchData(prev => ({
                                    ...prev,
                                    dateRange: {
                                      ...prev.dateRange,
                                      endDate: e.target.value
                                    }
                                  }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-xs text-gray-500 mb-2">Days of Week</label>
                              <div className="flex flex-wrap gap-2">
                                {daysOfWeek.map(day => (
                                  <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => handleDayOfWeekToggle(day.value)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      batchData.dateRange.daysOfWeek.includes(day.value)
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {day.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Preview of selected dates */}
                            {batchData.dateRange.startDate && batchData.dateRange.endDate && batchData.dateRange.daysOfWeek.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">
                                  Selected dates: <span className="font-medium">{generateDatesFromRange().length}</span>
                                </p>
                                <div className="max-h-24 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                                  {generateDatesFromRange().map(date => (
                                    <div key={date} className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded m-1">
                                      <span className="font-medium">{new Date(date).toLocaleDateString(undefined, {weekday: 'short'})}</span> {new Date(date).toLocaleDateString()}
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Add button to suggest time slots based on selected days */}
                                <div className="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={autoPopulateTimeSlots}
                                    className="px-3 py-1 text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-md"
                                  >
                                    Suggest Time Slots for Selected Days
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Time Slots Section */}
                          <div className="bg-white p-4 rounded-md border border-gray-200 mb-4 w-full">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="text-sm font-medium text-gray-700">Time Slots</h5>
                              <button
                                type="button"
                                onClick={addTimeSlot}
                                className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md hover:bg-amber-200"
                              >
                                Add Time Slot
                              </button>
                            </div>
                            
                            {/* Get unique days of the week from selected dates */}
                            {generateDatesFromRange().length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs text-gray-500 mb-2">Days included:</div>
                                <div className="flex flex-wrap gap-1">
                                  {[...new Set(generateDatesFromRange().map(date => 
                                    new Date(date).getDay()
                                  ))].sort().map(day => (
                                    <span key={day} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      {daysOfWeek.find(d => d.value === day)?.label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {batchData.timeSlots.map((slot, index) => (
                              <div key={index} className="flex flex-wrap items-center gap-3 mb-3 p-2 bg-gray-50 rounded-md">
                                <div className="flex-grow min-w-[140px]">
                                  <label className="block text-xs text-gray-500 mb-1">
                                    Start Time 
                                    {batchData.dateRange.daysOfWeek.length > 0 && (
                                      <span className="ml-1 text-amber-600">
                                        (Applies to {batchData.dateRange.daysOfWeek.map(day => 
                                          daysOfWeek.find(d => d.value === day)?.label
                                        ).join(', ')})
                                      </span>
                                    )}
                                  </label>
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => handleTimeSlotChange(index, 'startTime', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    required
                                  />
                                  {!slot.startTime && batchData.dateRange.daysOfWeek.length > 0 && (
                                    <div className="mt-1">
                                      <button 
                                        type="button"
                                        className="text-xs text-amber-600 hover:text-amber-800"
                                        onClick={() => {
                                          // Suggest a time for the first selected day of week
                                          const firstDay = batchData.dateRange.daysOfWeek[0];
                                          const suggestions = timeSlotSuggestions[firstDay] || [];
                                          if (suggestions.length > 0) {
                                            handleTimeSlotChange(index, 'startTime', suggestions[0]);
                                          }
                                        }}
                                      >
                                        Suggest time
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-grow min-w-[140px]">
                                  <label className="block text-xs text-gray-500 mb-1">
                                    End Time {slot.computed && '(Auto-calculated)'}
                                  </label>
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => handleTimeSlotChange(index, 'endTime', e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                                      slot.computed ? 'bg-gray-100' : ''
                                    }`}
                                    readOnly={slot.computed}
                                  />
                                  {slot.computed && formData.bufferTime > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Includes {formData.bufferTime}min buffer time
                                    </p>
                                  )}
                                </div>
                                {batchData.timeSlots.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeTimeSlot(index)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Remove time slot"
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
                                )}
                              </div>
                            ))}
                            
                          </div>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)*
                        </label>
                        <input
                          type="number"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          min="5"
                          max="240"
                          step="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Buffer Time (minutes)
                        </label>
                        <input
                          type="number"
                          name="bufferTime"
                          value={formData.bufferTime}
                          onChange={handleInputChange}
                          min="0"
                          max="30"
                          step="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Extra time between presentations for setup/teardown
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      {editingSlot ? (
                        <>
                          <button
                            type="button"
                            className="px-4 py-2 mr-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                              </>
                            ) : (
                              'Update Slot'
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="px-4 py-2 mr-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowForm(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                              </>
                            ) : (
                              batchMode ? 'Create Multiple Slots' : 'Create Slot'
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Slots Table */}
              {slots.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Description</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Audience</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {slots.map(slot => (
                        <tr key={slot._id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-800">{slot.title}</div>
                            <div className="text-sm text-gray-500 mt-1">{slot.description}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Venue: {slot.venue}
                              <span className="ml-2 inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {slot.presentationType === 'team' ? (
                                  `Team Presentation (${slot.minTeamMembers}-${slot.maxTeamMembers} members)`
                                ) : 'Individual Presentation'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-700">
                              {formatDate(slot.date)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {`${slot.startTime} - ${
                                // Show displayEndTime if available (time without buffer), otherwise use regular endTime
                                slot.displayEndTime || slot.endTime
                              }`}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Duration: {slot.duration} min
                              {slot.bufferTime > 0 && (
                                <span className="text-amber-600 ml-1">
                                  + {slot.bufferTime}min buffer
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-700">{slot.targetYear}</div>
                            <div className="text-sm text-gray-600 mb-1">{slot.targetSchool?.split('(')[0]}</div>
                            <div className="text-xs text-gray-500">{slot.targetDepartment}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              slot.status === 'available' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {slot.status === 'available' ? 'Available' : 'Booked'}
                            </span>
                            {slot.status === 'booked' && slot.bookedBy && (
                              <div className="text-xs text-gray-500 mt-1">
                                by {slot.bookedBy.name || 'Unknown'} 
                                {slot.bookedBy.rollNumber && ` (${slot.bookedBy.rollNumber})`}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <div className="flex space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                                onClick={() => initializeEditMode(slot)}
                                disabled={slot.status === 'booked'}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                                onClick={() => handleConfirmDelete(slot._id)}
                                disabled={slot.status === 'booked'}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-amber-500 mb-2">
                    <i className="fas fa-calendar-plus text-4xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Presentation Slots Yet</h3>
                  <p className="text-gray-500 mb-4">Create your first presentation slot to get started</p>
                  <button 
                    className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md shadow-sm transition-colors"
                    onClick={() => setShowForm(true)}
                  >
                    <i className="fas fa-plus mr-2"></i> Create First Slot
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default HostPresentation;
