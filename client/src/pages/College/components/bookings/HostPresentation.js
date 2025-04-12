import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import PresentationService from '../../../../services/PresentationService';
import { toast } from 'react-toastify';

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
    targetSchool: '',    
    targetDepartment: '',
    presentationType: 'single',    
    minTeamMembers: 2,    
    maxTeamMembers: 5,    
    date: '',
    startTime: '',
    endTime: '',
    duration: 30,    
    bufferTime: 5,    
    venue: ''
  });
  
  // Batch mode additional form fields
  const [batchData, setBatchData] = useState({
    dates: [],
    dateRange: {
      startDate: '',
      endDate: '',
      daysOfWeek: []
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
    0: ['10:00', '11:30', '13:00', '14:30', '16:00'],
    1: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'],
    2: ['09:30', '11:00', '13:30', '15:00', '16:30'],
    3: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'],
    4: ['09:30', '11:00', '13:30', '15:00', '16:30'],
    5: ['09:00', '10:30', '12:00', '14:00', '15:30'],
    6: ['10:00', '11:30', '13:00', '14:30']
  }), []);
  
  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationMinutes, bufferTime = 0) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + (durationMinutes + bufferTime) * 60000);
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    
    return `${endHours}:${endMinutes}`;
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

    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
      
      if (selectedDays.includes(dayOfWeek)) {
        dates.push(new Date(currentDate));
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }, [batchData.dateRange]);
  
  // Auto populate time slots based on day of week
  const autoPopulateTimeSlots = useCallback(() => {
    const dates = generateDatesFromRange();
    
    if (dates.length === 0) return;
    
    // Find the most common day of week in the selected dates
    const dayFrequency = {};
    let mostCommonDay = 1; // Default to Monday
    
    dates.forEach(date => {
      const day = date.getDay();
      dayFrequency[day] = (dayFrequency[day] || 0) + 1;
      
      if (!mostCommonDay || dayFrequency[day] > dayFrequency[mostCommonDay]) {
        mostCommonDay = day;
      }
    });
    
    // Get suggested time slots for the most common day
    const suggestedTimes = timeSlotSuggestions[mostCommonDay] || timeSlotSuggestions[1];
    
    // Create time slots from suggestions
    const newTimeSlots = suggestedTimes.map(startTime => {
      const endTime = calculateEndTime(startTime, formData.duration, formData.bufferTime);
      return {
        startTime,
        endTime,
        computed: true
      };
    });
    
    setBatchData(prev => ({
      ...prev,
      timeSlots: newTimeSlots
    }));
  }, [formData.duration, formData.bufferTime, generateDatesFromRange, timeSlotSuggestions]);

  // Load presentation slots on mount
  useEffect(() => {
    fetchPresentationSlots();
  }, []);

  // Update available departments when school changes
  useEffect(() => {
    if (formData.targetSchool && academicData[formData.targetSchool]) {
      setAvailableDepartments(academicData[formData.targetSchool]);
    } else {
      setAvailableDepartments([]);
    }
  }, [formData.targetSchool, academicData]);

  // Add useEffect to update time slots when dates change
  useEffect(() => {
    if (batchMode) {
      if (batchData.dateRange.startDate && 
          batchData.dateRange.endDate && 
          batchData.dateRange.daysOfWeek.length > 0) {
        
        // Generate dates based on range and selected days
        const dates = generateDatesFromRange();
        setBatchData(prev => ({
          ...prev,
          dates
        }));
        
        // If time slots are empty or all computed, auto-populate
        if (batchData.timeSlots.length === 0 || 
            batchData.timeSlots.every(slot => slot.computed)) {
          autoPopulateTimeSlots();
        }
      }
    }
  }, [
    batchData.dateRange, 
    formData.duration, 
    formData.bufferTime, 
    batchMode, 
    generateDatesFromRange, 
    batchData.timeSlots, 
    autoPopulateTimeSlots
  ]);

  // Fetch presentation slots created by the host
  const fetchPresentationSlots = async () => {
    setIsLoading(true);
    try {
      const data = await PresentationService.getHostSlots();
      setSlots(data);
    } catch (error) {
      console.error('Error fetching presentation slots:', error);
      toast.error('Failed to load your presentation slots');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value, 10) : '') : value
    }));
    
    // Calculate end time when start time or duration changes
    if (name === 'startTime' || name === 'duration' || name === 'bufferTime') {
      const endTime = calculateEndTime(
        name === 'startTime' ? value : formData.startTime,
        name === 'duration' ? parseInt(value, 10) : formData.duration,
        name === 'bufferTime' ? parseInt(value, 10) : formData.bufferTime
      );
      
      setFormData(prev => ({
        ...prev,
        endTime
      }));
    }
  };
  
  // Remove a time slot from batch creation
  const removeTimeSlot = (index) => {
    setBatchData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };
  
  // Handle batch time slot changes
  const handleTimeSlotChange = (index, field, value) => {
    const updatedSlots = [...batchData.timeSlots];
    updatedSlots[index] = {
      ...updatedSlots[index],
      [field]: value,
      computed: false
    };
    
    // If changing start time, recalculate end time
    if (field === 'startTime') {
      updatedSlots[index].endTime = calculateEndTime(
        value, 
        formData.duration, 
        formData.bufferTime
      );
    }
    
    setBatchData(prev => ({
      ...prev,
      timeSlots: updatedSlots
    }));
  };

  // Suggest time slots based on day of week
  const suggestTimeSlots = (date) => {
    if (!date) return;
    
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const suggestedTimes = timeSlotSuggestions[dayOfWeek];
    
    if (suggestedTimes && suggestedTimes.length > 0) {
      // If in single mode, suggest the first time
      if (!batchMode) {
        const startTime = suggestedTimes[0];
        const endTime = calculateEndTime(startTime, formData.duration, formData.bufferTime);
        
        setFormData(prev => ({
          ...prev,
          startTime,
          endTime
        }));
      } 
      // In batch mode, suggest multiple time slots
      else {
        const newTimeSlots = suggestedTimes.map(startTime => {
          const endTime = calculateEndTime(startTime, formData.duration, formData.bufferTime);
          return {
            startTime,
            endTime,
            computed: true
          };
        });
        
        setBatchData(prev => ({
          ...prev,
          timeSlots: newTimeSlots
        }));
      }
    }
  };

  // Initialize edit mode with slot data
  const initializeEditMode = (slot) => {
    setEditingSlot(slot);
    setFormData({
      title: slot.title,
      description: slot.description,
      targetYear: slot.targetYear,
      targetSchool: slot.targetSchool,
      targetDepartment: slot.targetDepartment,
      presentationType: slot.presentationType,
      minTeamMembers: slot.minTeamMembers || 2,
      maxTeamMembers: slot.maxTeamMembers || 5,
      date: new Date(slot.date).toISOString().split('T')[0],
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      bufferTime: slot.bufferTime || 0,
      venue: slot.venue
    });
    
    setBatchMode(false);
    setShowForm(true);
  };
  
  // Cancel edit mode
  const cancelEdit = () => {
    setEditingSlot(null);
    resetForm();
    setShowForm(false);
  };
  
  // Reset form to initial state
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
      endTime: '',
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
    
    setBatchMode(false);
    setEditingSlot(null);
  };
  
  // Show delete confirmation
  const handleConfirmDelete = (slotId) => {
    setSlotToDelete(slotId);
    setShowDeleteConfirm(true);
  };
  
  // Execute the delete action
  const executeDelete = async () => {
    if (!slotToDelete) return;
    
    try {
      await PresentationService.deleteSlot(slotToDelete);
      
      // Remove from UI
      setSlots(prev => prev.filter(slot => slot._id !== slotToDelete));
      
      toast.success('Presentation slot deleted successfully');
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete slot. It may be already booked.');
    } finally {
      setShowDeleteConfirm(false);
      setSlotToDelete(null);
    }
  };
  
  // Create multiple slots in batch mode
  const createMultipleSlots = async () => {
    if (batchData.dates.length === 0 || batchData.timeSlots.length === 0) {
      toast.error('Please select dates and time slots for batch creation');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format dates for API
      const formattedDates = batchData.dates.map(date => 
        date instanceof Date ? date.toISOString() : new Date(date).toISOString()
      );
      
      // Create batch data object for API
      const batchCreateData = {
        commonData: {
          title: formData.title,
          description: formData.description,
          targetYear: formData.targetYear,
          targetSchool: formData.targetSchool,
          targetDepartment: formData.targetDepartment,
          presentationType: formData.presentationType,
          minTeamMembers: formData.presentationType === 'team' ? formData.minTeamMembers : undefined,
          maxTeamMembers: formData.presentationType === 'team' ? formData.maxTeamMembers : undefined,
          duration: formData.duration,
          bufferTime: formData.bufferTime,
          venue: formData.venue
        },
        dates: formattedDates,
        timeSlots: batchData.timeSlots
      };
      
      // Call the batch create endpoint
      const createdSlots = await PresentationService.createBatchSlots(batchCreateData);
      
      // Add created slots to the UI
      setSlots(prev => [...createdSlots, ...prev]);
      
      // Reset form and hide it
      resetForm();
      setShowForm(false);
      
      toast.success(`Created ${createdSlots.length} presentation slots`);
    } catch (error) {
      console.error('Error creating batch slots:', error);
      toast.error('Failed to create presentation slots');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.venue || 
        !formData.targetYear || !formData.targetSchool || !formData.targetDepartment) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (batchMode) {
      createMultipleSlots();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let response;
      
      // If editing, update the slot
      if (editingSlot) {
        response = await PresentationService.updateSlot(editingSlot._id, formData);
        
        // Update in UI
        setSlots(prev => prev.map(slot => 
          slot._id === editingSlot._id ? response : slot
        ));
        
        toast.success('Presentation slot updated successfully');
      } 
      // Otherwise create a new slot
      else {
        response = await PresentationService.createSlot(formData);
        
        // Add to UI
        setSlots(prev => [response, ...prev]);
        
        toast.success('Presentation slot created successfully');
      }
      
      // Reset form and hide it
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving presentation slot:', error);
      toast.error('Failed to save presentation slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Toggle a day of week selection
  const handleDayOfWeekToggle = (dayValue) => {
    setBatchData(prev => {
      const currentDays = prev.dateRange.daysOfWeek;
      const updatedDays = currentDays.includes(dayValue) 
        ? currentDays.filter(day => day !== dayValue)
        : [...currentDays, dayValue];
      
      return {
        ...prev,
        dateRange: {
          ...prev.dateRange,
          daysOfWeek: updatedDays
        }
      };
    });
  };
  
  // Add a new time slot
  const addTimeSlot = () => {
    setBatchData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: '', endTime: '', computed: false }]
    }));
  };

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 py-8 w-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-green-100">
          <div className="p-8 bg-gradient-to-r from-green-600 to-teal-500">
            <h1 className="text-3xl font-bold text-white">Host Presentations</h1>
            <p className="text-green-50 mt-2">Create and manage presentation slots for students</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-gray-800">My Presentation Slots</h2>
                <p className="text-gray-600">Manage your presentation availability for students</p>
              </div>
              
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Presentation Slot
              </button>
            </div>
            
            {isLoading ? (
              <div className="w-full flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Presentation Slots</h3>
                <p className="text-gray-600 mb-6">You haven't created any presentation slots yet.</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Create Your First Slot
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {slots.map(slot => (
                      <tr key={slot._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(slot.date)}, {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{slot.title}</div>
                          <div className="text-sm text-gray-500">{slot.venue}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{slot.targetYear}</div>
                          <div className="text-sm text-gray-500">{slot.targetDepartment}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${slot.status === 'available' ? 'bg-green-100 text-green-800' : 
                              slot.status === 'booked' ? 'bg-blue-100 text-blue-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {slot.status === 'available' ? 'Available' : 
                              slot.status === 'booked' ? 'Booked' : 'Cancelled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {slot.status === 'available' && (
                              <>
                                <button 
                                  onClick={() => initializeEditMode(slot)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleConfirmDelete(slot._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                            {slot.status === 'booked' && (
                              <span className="text-sm text-gray-500">
                                Booked by: {slot.bookedBy?.name || 'Unknown'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Form Section */}
        {showForm && (
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-green-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 bg-gradient-to-r from-green-600 to-teal-500">
              <h2 className="text-xl font-bold text-white">
                {editingSlot ? 'Edit Presentation Slot' : 'Create New Presentation Slot'}
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setBatchMode(false)}
                      className={`px-4 py-2 rounded-md ${!batchMode ? 
                        'bg-green-600 text-white' : 
                        'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      disabled={editingSlot !== null}
                    >
                      Single Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatchMode(true)}
                      className={`px-4 py-2 rounded-md ${batchMode ? 
                        'bg-green-600 text-white' : 
                        'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      disabled={editingSlot !== null}
                    >
                      Batch Create
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title and Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Final Project Presentation"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Briefly describe the presentation requirements and expectations"
                    />
                  </div>
                  
                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Year *</label>
                    <select
                      name="targetYear"
                      value={formData.targetYear}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target School *</label>
                    <select
                      name="targetSchool"
                      value={formData.targetSchool}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select School</option>
                      {Object.keys(academicData).map(school => (
                        <option key={school} value={school}>{school}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Department *</label>
                    <select
                      name="targetDepartment"
                      value={formData.targetDepartment}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.targetSchool}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Department</option>
                      {availableDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Presentation Type *</label>
                    <select
                      name="presentationType"
                      value={formData.presentationType}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="single">Individual</option>
                      <option value="team">Team</option>
                    </select>
                  </div>
                  
                  {/* Team Size (only if team presentation) */}
                  {formData.presentationType === 'team' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Team Members</label>
                        <input
                          type="number"
                          name="minTeamMembers"
                          min={2}
                          max={10}
                          value={formData.minTeamMembers}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Members</label>
                        <input
                          type="number"
                          name="maxTeamMembers"
                          min={formData.minTeamMembers || 2}
                          max={10}
                          value={formData.maxTeamMembers}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Venue */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Conference Room 201, Engineering Building"
                    />
                  </div>
                  
                  {/* Slot Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                    <input
                      type="number"
                      name="duration"
                      min={5}
                      max={120}
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Time (minutes)</label>
                    <input
                      type="number"
                      name="bufferTime"
                      min={0}
                      max={30}
                      value={formData.bufferTime}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Additional time between presentations for setup</p>
                  </div>
                  
                  {/* Date and Time Selection - Different UIs for single vs batch mode */}
                  {!batchMode ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={(e) => {
                            handleInputChange(e);
                            suggestTimeSlots(e.target.value);
                          }}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                          <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            disabled
                            className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Batch Date Selection</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                            <input
                              type="date"
                              value={batchData.dateRange.startDate}
                              onChange={(e) => setBatchData(prev => ({
                                ...prev,
                                dateRange: {
                                  ...prev.dateRange,
                                  startDate: e.target.value
                                }
                              }))}
                              required
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
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
                              required
                              min={batchData.dateRange.startDate}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week *</label>
                          <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map((day) => (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => handleDayOfWeekToggle(day.value)}
                                className={`px-3 py-2 rounded-md text-sm font-medium 
                                  ${batchData.dateRange.daysOfWeek.includes(day.value) ? 
                                    'bg-green-600 text-white' : 
                                    'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-medium text-gray-900">Time Slots</h3>
                            <button
                              type="button"
                              onClick={addTimeSlot}
                              className="text-green-600 hover:text-green-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          
                          {batchData.timeSlots.map((slot, index) => (
                            <div key={index} className="flex items-center space-x-4 mb-4">
                              <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {index === 0 ? 'Start Time *' : 'Start Time'}
                                  </label>
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => handleTimeSlotChange(index, 'startTime', e.target.value)}
                                    required={index === 0}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    disabled
                                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                              
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeTimeSlot(index)}
                                  className="text-red-500 hover:text-red-700 mt-6"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                          
                          {/* Preview of generated slots */}
                          {batchData.dates.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                              <h4 className="text-sm font-medium text-gray-800 mb-2">
                                Will create {batchData.dates.length * batchData.timeSlots.length} slots:
                              </h4>
                              <p className="text-sm text-gray-600">
                                {batchData.dates.length} days × {batchData.timeSlots.length} time slots per day
                              </p>
                              {batchData.dates.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs font-medium text-gray-600">Dates: </span>
                                  <span className="text-xs text-gray-600">
                                    {batchData.dates.slice(0, 3).map(date => 
                                      new Date(date).toLocaleDateString()
                                    ).join(', ')}
                                    {batchData.dates.length > 3 && `, +${batchData.dates.length - 3} more`}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : editingSlot ? 'Update Slot' : batchMode ? 'Create Slots' : 'Create Slot'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this presentation slot? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={executeDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HostPresentation;
