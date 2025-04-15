import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import PresentationService from '../../../../services/PresentationService';
import { toast } from 'react-toastify';

const HostPresentation = () => {
  // Remove unused currentUser from useAuth
  useAuth(); // Keep the hook call if needed for authentication
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [viewEventDetails, setViewEventDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetYear: '',
    targetSchool: '',    
    targetDepartment: '',
    presentationType: 'single',    
    minTeamMembers: 2,    
    maxTeamMembers: 5,
    venue: '',
    duration: 30,    
    bufferTime: 5,
  });
  
  // Day-specific time slots
  const [daySlots, setDaySlots] = useState({
    dateRange: {
      startDate: '',
      endDate: '',
      daysOfWeek: []
    },
    slots: {
      0: [], // Sunday
      1: [], // Monday
      2: [], // Tuesday
      3: [], // Wednesday
      4: [], // Thursday
      5: [], // Friday
      6: [], // Saturday
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  
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
  
  const daysOfWeek = useMemo(() => [
    { value: 0, label: 'Sun', color: 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300' },
    { value: 1, label: 'Mon', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300' },
    { value: 2, label: 'Tue', color: 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300' },
    { value: 3, label: 'Wed', color: 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300' },
    { value: 4, label: 'Thu', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300' },
    { value: 5, label: 'Fri', color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-300' },
    { value: 6, label: 'Sat', color: 'bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-300' }
  ], []);

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
    if (!daySlots.dateRange.startDate || !daySlots.dateRange.endDate || daySlots.dateRange.daysOfWeek.length === 0) {
      return [];
    }

    const startDate = new Date(daySlots.dateRange.startDate);
    const endDate = new Date(daySlots.dateRange.endDate);
    const selectedDays = daySlots.dateRange.daysOfWeek;
    const dates = [];

    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
      
      if (selectedDays.includes(dayOfWeek)) {
        dates.push({
          date: new Date(currentDate),
          dayOfWeek
        });
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }, [daySlots.dateRange]);

  // Add this validation function to check if selected days exist in the date range
  const validateSelectedDays = useCallback(() => {
    if (!daySlots.dateRange.startDate || !daySlots.dateRange.endDate || daySlots.dateRange.daysOfWeek.length === 0) {
      return true; // Skip validation if date range or days not selected yet
    }
  
    const startDate = new Date(daySlots.dateRange.startDate);
    const endDate = new Date(daySlots.dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date
    
    // Calculate days between start and end dates
    const availableDays = new Set();
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      availableDays.add(currentDate.getDay());
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Check if all selected days are in the available range
    const invalidDays = daySlots.dateRange.daysOfWeek.filter(day => !availableDays.has(day));
    
    return {
      valid: invalidDays.length === 0,
      invalidDays: invalidDays
    };
  }, [daySlots.dateRange]);
  
  // Add/remove a time slot for a specific day
  const addTimeSlot = (day) => {
    setDaySlots(prev => {
      // Find the last slot for this day to determine the next start time
      const daySlots = prev.slots[day];
      let suggestedTime;
      
      if (daySlots.length === 0) {
        // If no slots yet, use suggestion from timeSlotSuggestions
        suggestedTime = timeSlotSuggestions[day][0] || '09:00';
      } else {
        // Get the end time of the last slot and use it as the start time for the new slot
        const lastSlot = daySlots[daySlots.length - 1];
        
        // Ensure that the next slot actually starts at the END time of the previous slot
        suggestedTime = lastSlot.endTime;
        
        // Check if the suggested time is past end of day (6 PM)
        const [hours] = suggestedTime.split(':').map(Number);
        if (hours >= 18) {
          toast.warning(`You're scheduling a slot after 6 PM. Please ensure this is intentional.`);
        }
      }
      
      const endTime = calculateEndTime(suggestedTime, formData.duration, formData.bufferTime);
      
      // Create a new slot
      const newSlot = {
        startTime: suggestedTime,
        endTime: endTime,
        id: Date.now() // unique identifier
      };
      
      return {
        ...prev,
        slots: {
          ...prev.slots,
          [day]: [...prev.slots[day], newSlot]
        }
      };
    });
  };
  
  const removeTimeSlot = (day, slotId) => {
    setDaySlots(prev => ({
      ...prev,
      slots: {
        ...prev.slots,
        [day]: prev.slots[day].filter(slot => slot.id !== slotId)
      }
    }));
  };
  
  // Handle time slot changes for a specific day
  const handleTimeSlotChange = (day, slotId, field, value) => {
    setDaySlots(prev => {
      const updatedDaySlots = [...prev.slots[day]];
      const slotIndex = updatedDaySlots.findIndex(slot => slot.id === slotId);
      
      if (slotIndex === -1) return prev;
      
      const updatedSlot = { ...updatedDaySlots[slotIndex], [field]: value };
      
      // If changing start time, recalculate end time
      if (field === 'startTime') {
        updatedSlot.endTime = calculateEndTime(
          value, 
          formData.duration, 
          formData.bufferTime
        );
      }
      
      updatedDaySlots[slotIndex] = updatedSlot;
      
      return {
        ...prev,
        slots: {
          ...prev.slots,
          [day]: updatedDaySlots
        }
      };
    });
  };

  // Load presentation events on mount
  useEffect(() => {
    fetchPresentationEvents();
  }, []);

  // Update available departments when school changes
  useEffect(() => {
    if (formData.targetSchool && academicData[formData.targetSchool]) {
      setAvailableDepartments(academicData[formData.targetSchool]);
    } else {
      setAvailableDepartments([]);
    }
  }, [formData.targetSchool, academicData]);

  // Update day slots when days of week change
  useEffect(() => {
    if (daySlots.dateRange.daysOfWeek.length > 0 && !activeDay) {
      // Set the first selected day as active
      setActiveDay(daySlots.dateRange.daysOfWeek[0]);
    } else if (daySlots.dateRange.daysOfWeek.length === 0) {
      setActiveDay(null);
    }
  }, [daySlots.dateRange.daysOfWeek, activeDay]);

  // Add validation when date range changes
  // Get day label from day value
  const getDayLabel = useCallback((dayValue) => {
    return daysOfWeek.find(day => day.value === dayValue)?.label || '';
  }, [daysOfWeek]);

  useEffect(() => {
    if (daySlots.dateRange.startDate && daySlots.dateRange.endDate && daySlots.dateRange.daysOfWeek.length > 0) {
      const validationResult = validateSelectedDays();
      
      if (!validationResult.valid) {
        // Remove days that are not in the range
        const invalidDayLabels = validationResult.invalidDays.map(day => getDayLabel(day)).join(', ');
        
        toast.warning(`Removed days not in date range: ${invalidDayLabels}`);
        
        setDaySlots(prev => ({
          ...prev,
          dateRange: {
            ...prev.dateRange,
            daysOfWeek: prev.dateRange.daysOfWeek.filter(day => !validationResult.invalidDays.includes(day))
          }
        }));
      }
    }
  }, [daySlots.dateRange.startDate, daySlots.dateRange.endDate, daySlots.dateRange.daysOfWeek.length, validateSelectedDays, daysOfWeek, getDayLabel]);

  // Fetch presentation events created by the host
  const fetchPresentationEvents = async () => {
    setIsLoading(true);
    try {
      // This would need to be updated in your backend to return events instead of slots
      const data = await PresentationService.getHostSlots();
      
      // For now, we'll treat the existing slots as events
      // In a real implementation, you'd have a separate API endpoint for events
      setEvents(data);
    } catch (error) {
      console.error('Error fetching presentation events:', error);
      toast.error('Failed to load your presentation events');
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
  };
  
  // Toggle a day of week selection
  const handleDayOfWeekToggle = (dayValue) => {
    setDaySlots(prev => {
      const currentDays = prev.dateRange.daysOfWeek;
      let updatedDays;
      
      if (currentDays.includes(dayValue)) {
        updatedDays = currentDays.filter(day => day !== dayValue);
      } else {
        // Before adding the day, validate if it exists in the date range
        if (prev.dateRange.startDate && prev.dateRange.endDate) {
          const startDate = new Date(prev.dateRange.startDate);
          const endDate = new Date(prev.dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          
          // Check if this day occurs in the date range
          let currentDate = new Date(startDate);
          let dayExistsInRange = false;
          
          while (currentDate <= endDate) {
            if (currentDate.getDay() === dayValue) {
              dayExistsInRange = true;
              break;
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          if (!dayExistsInRange) {
            toast.warning(`${getDayLabel(dayValue)} doesn't occur in your selected date range.`);
            return prev; // Don't add the day if it's not in the range
          }
        }
        
        updatedDays = [...currentDays, dayValue];
        
        // If this is the first day being added or there's no active day, set it as active
        if (currentDays.length === 0 || !activeDay) {
          setActiveDay(dayValue);
        }
        
        // If this day doesn't have any time slots yet, add one as a suggestion
        if (prev.slots[dayValue].length === 0) {
          // We'll add a time slot in the useEffect that runs when days change
          setTimeout(() => addTimeSlot(dayValue), 0);
        }
      }
      
      return {
        ...prev,
        dateRange: {
          ...prev.dateRange,
          daysOfWeek: updatedDays
        }
      };
    });
  };
  
  // Suggest time slots for a specific day
  const suggestTimeSlotsForDay = (day) => {
    const suggestedStartTimes = timeSlotSuggestions[day] || [];
    
    if (suggestedStartTimes.length === 0) return;
    
    // Create sequential time slots from suggestions
    const newTimeSlots = [];
    let currentTime = suggestedStartTimes[0];
    
    for (let i = 0; i < Math.min(4, suggestedStartTimes.length); i++) { // Limit to 4 slots for better UI
      // For each suggestion, create a slot
      const endTime = calculateEndTime(currentTime, formData.duration, formData.bufferTime);
      
      newTimeSlots.push({
        startTime: currentTime,
        endTime: endTime,
        id: Date.now() + i // unique identifier
      });
      
      // Set next start time to be the end time of the current slot
      currentTime = endTime;
      
      // Check if we're going too late in the day
      const [hours] = currentTime.split(':').map(Number);
      if (hours >= 17) { // If we're at or past 5 PM, stop adding more
        break;
      }
    }
    
    setDaySlots(prev => ({
      ...prev,
      slots: {
        ...prev.slots,
        [day]: newTimeSlots
      }
    }));
  };

  // Initialize edit mode with event data
  const initializeEditMode = (event) => {
    setEditingEvent(event);
    
    // Reset form data with event details
    setFormData({
      title: event.title,
      description: event.description,
      targetYear: event.targetYear,
      targetSchool: event.targetSchool,
      targetDepartment: event.targetDepartment,
      presentationType: event.presentationType,
      minTeamMembers: event.minTeamMembers || 2,
      maxTeamMembers: event.maxTeamMembers || 5,
      venue: event.venue,
      duration: event.duration,
      bufferTime: event.bufferTime || 0,
    });
    
    // Extract date information from slots to determine date range
    if (event.slots && event.slots.length > 0) {
      // Sort slots by date
      const sortedSlots = [...event.slots].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      // Get earliest and latest dates
      const startDate = new Date(sortedSlots[0].date);
      const endDate = new Date(sortedSlots[sortedSlots.length - 1].date);
      
      // Extract all days of week that have slots
      const existingDays = new Set();
      const slotsByDay = {};
      
      // Initialize slot containers for each day
      for (let i = 0; i < 7; i++) {
        slotsByDay[i] = [];
      }
      
      // Group slots by day of week
      sortedSlots.forEach(slot => {
        const date = new Date(slot.date);
        const dayOfWeek = date.getDay();
        existingDays.add(dayOfWeek);
        
        // Find slots on the same day with the same time
        const existingSlot = slotsByDay[dayOfWeek].find(
          s => s.startTime === slot.startTime && s.endTime === slot.endTime
        );
        
        // Only add unique time slots
        if (!existingSlot) {
          slotsByDay[dayOfWeek].push({
            startTime: slot.startTime,
            endTime: slot.endTime,
            id: Date.now() + Math.random() // Generate a temporary ID for UI purposes
          });
        }
      });
      
      // Set date range and days of week
      setDaySlots({
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          daysOfWeek: Array.from(existingDays)
        },
        slots: slotsByDay
      });
      
      // Set the first day as active
      if (existingDays.size > 0) {
        setActiveDay(Array.from(existingDays)[0]);
      }
    }
    
    setShowForm(true);
  };
  
  // View event details
  const viewEvent = (event) => {
    setViewEventDetails(event);
  };
  
  // Cancel edit mode
  const cancelEdit = () => {
    setEditingEvent(null);
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
      venue: '',
      duration: 30,
      bufferTime: 5,
    });
    
    setDaySlots({
      dateRange: {
        startDate: '',
        endDate: '',
        daysOfWeek: []
      },
      slots: {
        0: [], // Sunday
        1: [], // Monday
        2: [], // Tuesday
        3: [], // Wednesday
        4: [], // Thursday
        5: [], // Friday
        6: [], // Saturday
      }
    });
    
    setActiveDay(null);
    setEditingEvent(null);
  };
  
  // Show delete confirmation
  const handleConfirmDelete = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
  };
  
  // Execute the delete action - completely revised for reliability
  const executeDelete = async () => {
    if (!eventToDelete) return;
    
    setIsSubmitting(true);
    console.log(`Starting deletion process for event ID: ${eventToDelete}`);
    
    try {
      // First, try to find the event details to get the title
      const eventToDeleteObj = events.find(event => event._id === eventToDelete);
      if (!eventToDeleteObj) {
        throw new Error('Could not find event to delete');
      }
      
      console.log(`Found event to delete: ${eventToDeleteObj.title}`);
      
      // Track deletion success
      let deletionSuccessful = false;
      
      // First attempt: Use the deleteSlotsByTitle method (more reliable for multiple slots)
      try {
        const result = await PresentationService.deleteSlotsByTitle(eventToDeleteObj.title);
        console.log('Bulk deletion result:', result);
        
        if (result && result.deletedCount > 0) {
          deletionSuccessful = true;
          console.log(`Successfully deleted ${result.deletedCount} slots by title`);
        } else {
          console.warn('Bulk deletion returned zero slots deleted');
        }
      } catch (bulkDeleteError) {
        console.error('Bulk deletion failed:', bulkDeleteError);
        
        // Fallback: Delete each slot individually
        console.log('Attempting individual slot deletion as fallback...');
        try {
          // Get all slots for this event
          const eventSlots = await PresentationService.getSlotsByEventId(eventToDeleteObj.title);
          console.log(`Found ${eventSlots.length} slots to delete individually`);
          
          if (eventSlots && eventSlots.length > 0) {
            let successCount = 0;
            
            // Delete slots one by one (not using Promise.all to avoid overwhelming the server)
            for (const slot of eventSlots) {
              try {
                await PresentationService.deleteSlot(slot._id);
                successCount++;
                console.log(`Successfully deleted slot ${slot._id} (${successCount}/${eventSlots.length})`);
              } catch (err) {
                console.error(`Failed to delete individual slot ${slot._id}:`, err);
              }
            }
            
            // Set success if at least one slot was deleted
            deletionSuccessful = successCount > 0;
            console.log(`Individual deletion completed: ${successCount}/${eventSlots.length} slots deleted`);
            
            if (successCount > 0 && successCount < eventSlots.length) {
              toast.warning(`Partially deleted: ${successCount} out of ${eventSlots.length} slots removed.`);
            }
          }
        } catch (fallbackError) {
          console.error('Fallback individual deletion failed:', fallbackError);
        }
      }
      
      // Only update UI if at least some deletion was successful
      if (deletionSuccessful) {
        // First update the UI immediately for better user experience
        setEvents(prev => prev.filter(event => event._id !== eventToDelete));
        toast.success('Presentation event deleted successfully');
        
        // Then refresh data from server to ensure UI is in sync
        setTimeout(() => fetchPresentationEvents(), 500);
      } else {
        throw new Error('Could not delete any slots for this event');
      }
    } catch (error) {
      console.error('Error in deletion process:', error);
      toast.error(error.message || 'Failed to delete event. It may have bookings or be in use.');
    } finally {
      setShowDeleteConfirm(false);
      setEventToDelete(null);
      setIsSubmitting(false);
    }
  };
  
  // Create or update a presentation event with multiple slots - only change the batch data preparation
  const createPresentationEvent = async () => {
    // Validate form
    if (!formData.title || !formData.description || !formData.venue || 
        !formData.targetYear || !formData.targetSchool || !formData.targetDepartment) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Validate date range
    if (!daySlots.dateRange.startDate || !daySlots.dateRange.endDate) {
      toast.error('Please select a date range');
      return;
    }
    
    // Validate days selection
    if (daySlots.dateRange.daysOfWeek.length === 0) {
      toast.error('Please select at least one day of the week');
      return;
    }
    
    // Check if there's at least one time slot for each selected day
    const missingTimeSlots = daySlots.dateRange.daysOfWeek.filter(day => 
      daySlots.slots[day].length === 0
    );
    
    if (missingTimeSlots.length > 0) {
      const missingDays = missingTimeSlots.map(day => 
        daysOfWeek.find(d => d.value === day)?.label
      ).join(', ');
      
      toast.error(`Please add at least one time slot for: ${missingDays}`);
      return;
    }

    // Add extra validation for date range
    if (new Date(daySlots.dateRange.startDate) > new Date(daySlots.dateRange.endDate)) {
      toast.error('Start date must be before or equal to end date');
      return;
    }
    
    // Validate that selected days actually exist in the date range
    const daysValidation = validateSelectedDays();
    if (!daysValidation.valid) {
      const invalidDayLabels = daysValidation.invalidDays.map(day => getDayLabel(day)).join(', ');
      toast.error(`Selected days not in date range: ${invalidDayLabels}`);
      return;
    }
    
    // Validate that there are actual dates generated (the range isn't empty)
    const generatedDates = generateDatesFromRange();
    if (generatedDates.length === 0) {
      toast.error('No dates were generated. Please check your date range and selected days.');
      return;
    }
    
    // Check overlapping time slots
    let hasOverlappingSlots = false;
    Object.entries(daySlots.slots).forEach(([day, slots]) => {
      if (slots.length <= 1) return;
      
      slots.sort((a, b) => {
        const [aHours, aMinutes] = a.startTime.split(':').map(Number);
        const [bHours, bMinutes] = b.startTime.split(':').map(Number);
        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
      });
      
      for (let i = 0; i < slots.length - 1; i++) {
        const currentSlotEnd = slots[i].endTime;
        const nextSlotStart = slots[i + 1].startTime;
        
        const [currentHours, currentMinutes] = currentSlotEnd.split(':').map(Number);
        const [nextHours, nextMinutes] = nextSlotStart.split(':').map(Number);
        
        const currentEndMinutes = currentHours * 60 + currentMinutes;
        const nextStartMinutes = nextHours * 60 + nextMinutes;
        
        if (currentEndMinutes > nextStartMinutes) {
          hasOverlappingSlots = true;
          break;
        }
      }
    });
    
    if (hasOverlappingSlots) {
      toast.error('Some time slots are overlapping. Please check your schedule.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate all dates with their day of week
      const datesByDay = generateDatesFromRange();
      
      // Collect all date strings
      const allDates = datesByDay.map(({ date }) => date.toISOString());
      
      // Collect time slots WITH their day of week association
      const allTimeSlots = [];
      daySlots.dateRange.daysOfWeek.forEach(dayOfWeek => {
        const slotsForDay = daySlots.slots[dayOfWeek] || [];
        
        // Add each slot with its day of week
        slotsForDay.forEach(slot => {
          allTimeSlots.push({
            startTime: slot.startTime,
            endTime: slot.endTime,
            dayOfWeek: dayOfWeek // Critical: Pass the day of week to maintain association
          });
        });
      });
      
      console.log(`Preparing to create slots for ${allDates.length} dates with ${allTimeSlots.length} time patterns`);
      console.log('Time slots by day:', Object.fromEntries(
        daySlots.dateRange.daysOfWeek.map(day => [
          day, 
          daySlots.slots[day] ? daySlots.slots[day].length : 0
        ])
      ));
      
      // Create batch data object for API
      const batchCreateData = {
        commonData: {
          title: formData.title,
          description: formData.description,
          targetYear: formData.targetYear,
          targetSchool: formData.targetSchool,
          targetDepartment: formData.targetDepartment,
          presentationType: formData.presentationType,
          minTeamMembers: formData.presentationType === 'team' ? Math.max(2, formData.minTeamMembers) : undefined,
          maxTeamMembers: formData.presentationType === 'team' ? Math.max(formData.minTeamMembers, formData.maxTeamMembers) : undefined,
          duration: formData.duration,
          bufferTime: formData.bufferTime,
          venue: formData.venue
        },
        dates: allDates,
        timeSlots: allTimeSlots // Now includes dayOfWeek information
      };
      
      // For editing, we need to first delete the existing event
      if (editingEvent) {
        try {
          // Delete all slots from the event we're editing
          const existingSlots = await PresentationService.getEventSlots(editingEvent.title);
          
          if (existingSlots && existingSlots.length > 0) {
            // Delete each slot individually
            await Promise.all(
              existingSlots
                .filter(slot => slot.status === 'available') // Only delete available slots
                .map(slot => PresentationService.deleteSlot(slot._id))
            );
          }
        } catch (error) {
          console.error('Error deleting existing slots:', error);
          toast.warning('Some existing slots could not be deleted');
        }
      }
      
      // Create the new slots with our enhanced approach
      const createdSlots = await PresentationService.createBatchSlots(batchCreateData);
      
      console.log(`Created ${createdSlots.length} slots`);
      
      // Refresh the events list
      await fetchPresentationEvents();
      
      // Reset form and hide it
      resetForm();
      setShowForm(false);
      
      toast.success(
        editingEvent 
          ? `Updated presentation event with ${createdSlots.length} slots` 
          : `Created presentation event with ${createdSlots.length} slots`
      );
    } catch (error) {
      console.error('Error creating/updating presentation event:', error);
      
      // Show a more specific error message
      let errorMessage = 'Failed to save presentation event';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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
      day: 'numeric'
    });
  };
  
  // Calculate total slots count for an event
  const getTotalSlotsCount = () => {
    const dates = generateDatesFromRange();
    let count = 0;
    
    dates.forEach(({ dayOfWeek }) => {
      count += daySlots.slots[dayOfWeek].length;
    });
    
    return count;
  };
  
  // Count slots by day
  const getSlotsByDay = () => {
    const slotsByDay = {};
    
    daySlots.dateRange.daysOfWeek.forEach(day => {
      slotsByDay[day] = daySlots.slots[day].length;
    });
    
    return slotsByDay;
  };

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 py-8 w-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-teal-200">
          <div className="p-8 bg-gradient-to-r from-teal-600 to-emerald-500">
            <h1 className="text-3xl font-bold text-white">Presentation Events</h1>
            <p className="text-teal-50 mt-2">Create and manage presentation events for students</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-gray-800">My Presentations</h2>
                <p className="text-gray-600">Manage your presentation events and time slots</p>
              </div>
              
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Presentation
              </button>
            </div>
            
            {isLoading ? (
              <div className="w-full flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-teal-300 rounded-lg bg-teal-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-teal-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Presentation Events</h3>
                <p className="text-gray-600 mb-6">You haven't created any presentation events yet.</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md"
                >
                  Create Your First Presentation
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                  <div 
                    key={event._id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-teal-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-400 px-4 py-3">
                      <h3 className="text-lg font-medium text-white truncate">{event.title}</h3>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-600 mb-3 text-sm line-clamp-2 min-h-[40px]">{event.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <span className="text-gray-500 block">Venue:</span>
                          <span className="font-medium">{event.venue}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <span className="text-gray-500 block">Duration:</span>
                          <span className="font-medium">{event.duration} min</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <span className="text-gray-500 block">Type:</span>
                          <span className="font-medium">
                            {event.presentationType === 'single' ? 'Individual' : 'Team'}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <span className="text-gray-500 block">Audience:</span>
                          <span className="font-medium">{event.targetYear}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 font-medium">Slots:</span>
                        <span className="bg-teal-100 text-teal-800 text-xs font-medium py-1 px-2 rounded-full">
                          {/* This would be the actual slots count in a real implementation */}
                          {event.slots ? event.slots.length : 0} slots
                        </span>
                      </div>
                      
                      <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => viewEvent(event)}
                          className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View Details
                        </button>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => initializeEditMode(event)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleConfirmDelete(event._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Form Section */}
        {showForm && (
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-teal-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 bg-gradient-to-r from-teal-600 to-emerald-500">
              <h2 className="text-xl font-bold text-white">
                {editingEvent ? 'Edit Presentation Event' : 'Create New Presentation Event'}
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Event Details</h3>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Title and Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Briefly describe the presentation requirements and expectations"
                  />
                </div>
                
                {/* Venue */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., Conference Room 201, Engineering Building"
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
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
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
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
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </>
                )}
                
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Additional time between presentations for setup</p>
                </div>
              </div>
              
              {/* Date Selection Section */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Schedule</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={daySlots.dateRange.startDate}
                      onChange={(e) => setDaySlots(prev => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          startDate: e.target.value
                        }
                      }))}
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      value={daySlots.dateRange.endDate}
                      onChange={(e) => setDaySlots(prev => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          endDate: e.target.value
                        }
                      }))}
                      required
                      min={daySlots.dateRange.startDate}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Days of Week *</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleDayOfWeekToggle(day.value)}
                        className={`px-4 py-2 rounded-md text-sm font-medium border ${
                          daySlots.dateRange.daysOfWeek.includes(day.value)
                            ? day.color
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Time Slot Selection with Day Tabs */}
                {daySlots.dateRange.daysOfWeek.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Time Slots by Day</h3>
                    
                    {/* Day Accordion Sections */}
                    <div className="space-y-4">
                      {daySlots.dateRange.daysOfWeek.map(dayValue => {
                        const day = daysOfWeek.find(d => d.value === dayValue);
                        return (
                          <div 
                            key={dayValue} 
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            {/* Day Header */}
                            <div 
                              className={`flex justify-between items-center p-4 cursor-pointer ${day.color}`} 
                              onClick={() => setActiveDay(activeDay === dayValue ? null : dayValue)}
                            >
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">
                                  {day.label}
                                </h4>
                                <span className="bg-white text-xs py-0.5 px-1.5 rounded-full">
                                  {daySlots.slots[dayValue].length} slot{daySlots.slots[dayValue].length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-5 w-5 transition-transform ${activeDay === dayValue ? 'transform rotate-180' : ''}`} 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            
                            {/* Day Content (Expandable) */}
                            {activeDay === dayValue && (
                              <div className="p-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-sm font-medium text-gray-800">
                                    Time Slots for {day.label}
                                  </h4>
                                  <div className="flex space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => addTimeSlot(dayValue)}
                                      className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm flex items-center"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                      </svg>
                                      Add Slot
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => suggestTimeSlotsForDay(dayValue)}
                                      className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                                    >
                                      Suggest Times
                                    </button>
                                  </div>
                                </div>
                                
                                {daySlots.slots[dayValue].length === 0 ? (
                                  <div className="text-center py-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                                    <p className="text-gray-500">No time slots added for {day.label}</p>
                                    <button
                                      type="button"
                                      onClick={() => addTimeSlot(dayValue)}
                                      className="mt-2 px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm"
                                    >
                                      Add a Time Slot
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {/* Timeline visualization */}
                                    <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                      <div className="text-xs font-medium text-gray-500 mb-2">Daily Schedule Timeline</div>
                                      <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
                                        {/* Time markers */}
                                        <div className="absolute inset-0 flex text-gray-400 text-xs">
                                          {Array.from({length: 12}).map((_, i) => (
                                            <div key={i} className="flex-1 border-l border-gray-200 relative">
                                              <span className="absolute -top-4 left-1">{(i + 8) % 12 || 12}{i + 8 < 12 ? 'AM' : 'PM'}</span>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {/* Slot blocks */}
                                        {daySlots.slots[dayValue].map(slot => {
                                          const [startHour, startMinute] = slot.startTime.split(':').map(Number);
                                          const [endHour, endMinute] = slot.endTime.split(':').map(Number);
                                          
                                          // Convert to minutes since 8 AM (assuming 8 AM - 8 PM working hours)
                                          const startMinutes = (startHour - 8) * 60 + startMinute;
                                          const endMinutes = (endHour - 8) * 60 + endMinute;
                                          
                                          // Calculate position (0-100%)
                                          const startPercent = (startMinutes / (12 * 60)) * 100;
                                          const widthPercent = ((endMinutes - startMinutes) / (12 * 60)) * 100;
                                          
                                          return (
                                            <div 
                                              key={slot.id}
                                              className="absolute h-6 top-1 rounded bg-teal-500 text-white text-xs flex items-center justify-center overflow-hidden"
                                              style={{
                                                left: `${startPercent}%`,
                                                width: `${widthPercent}%`,
                                                minWidth: '30px'
                                              }}
                                            >
                                              {slot.startTime}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    
                                    {/* List of slots */}
                                    {daySlots.slots[dayValue].map((slot, index) => (
                                      <div key={slot.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                                        <div className="flex-none w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-medium">
                                          {index + 1}
                                        </div>
                                        
                                        <div className="flex-grow grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Start Time
                                            </label>
                                            <input
                                              type="time"
                                              value={slot.startTime}
                                              onChange={(e) => handleTimeSlotChange(dayValue, slot.id, 'startTime', e.target.value)}
                                              required
                                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
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
                                        
                                        <button
                                          type="button"
                                          onClick={() => removeTimeSlot(dayValue, slot.id)}
                                          className="text-red-500 hover:text-red-700 p-1"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                    
                                    {/* Add another slot button */}
                                    <button
                                      type="button"
                                      onClick={() => addTimeSlot(dayValue)}
                                      className="w-full py-2 px-3 border border-dashed border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400 text-sm flex items-center justify-center"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                      </svg>
                                      Add Another Time Slot
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Preview of total slots */}
                    <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <h4 className="text-sm font-medium text-teal-800 mb-2">
                        Your presentation event will create:
                      </h4>
                      <p className="text-sm text-teal-700 mb-1">
                        <span className="font-semibold">{getTotalSlotsCount()}</span> total time slots across {daySlots.dateRange.daysOfWeek.length} days of the week
                      </p>
                      
                      {/* Show slots by day */}
                      <div className="mt-2 space-y-1">
                        {Object.entries(getSlotsByDay()).map(([day, count]) => (
                          <div key={day} className="flex items-center">
                            <span className="w-12 text-xs font-medium text-teal-800">
                              {getDayLabel(Number(day))}:
                            </span>
                            <span className="text-xs text-teal-700">
                              {count} time slot{count !== 1 ? 's' : ''} × {generateDatesFromRange().filter(d => d.dayOfWeek === Number(day)).length} date{generateDatesFromRange().filter(d => d.dayOfWeek === Number(day)).length !== 1 ? 's' : ''} = {count * generateDatesFromRange().filter(d => d.dayOfWeek === Number(day)).length} total slots
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Show date range */}
                      <div className="mt-3 text-xs text-teal-700">
                        <span className="font-medium">Date range: </span>
                        <span>
                          {daySlots.dateRange.startDate ? new Date(daySlots.dateRange.startDate).toLocaleDateString() : 'Not set'} to {daySlots.dateRange.endDate ? new Date(daySlots.dateRange.endDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createPresentationEvent}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                >
                  {isSubmitting 
                    ? (editingEvent ? 'Updating...' : 'Creating...') 
                    : (editingEvent ? 'Update Presentation' : 'Create Presentation')
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Event Details Modal */}
        {viewEventDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full p-0 shadow-2xl">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-500 p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">{viewEventDetails.title}</h3>
                  <button
                    onClick={() => setViewEventDetails(null)}
                    className="text-white hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-6">{viewEventDetails.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">Venue</span>
                    <span className="font-medium">{viewEventDetails.venue}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">Duration</span>
                    <span className="font-medium">{viewEventDetails.duration} minutes</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">Type</span>
                    <span className="font-medium">
                      {viewEventDetails.presentationType === 'single' ? 'Individual' : 'Team'}
                      {viewEventDetails.presentationType === 'team' && viewEventDetails.minTeamMembers && viewEventDetails.maxTeamMembers && 
                        ` (${viewEventDetails.minTeamMembers}-${viewEventDetails.maxTeamMembers} members)`}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">Target Year</span>
                    <span className="font-medium">{viewEventDetails.targetYear}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">School</span>
                    <span className="font-medium">{viewEventDetails.targetSchool}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">Department</span>
                    <span className="font-medium">{viewEventDetails.targetDepartment}</span>
                  </div>
                </div>
                
                <h4 className="text-lg font-medium text-gray-800 mb-3">Time Slots</h4>
                
                {/* In a real implementation, you'd group slots by date */}
                {viewEventDetails.slots && viewEventDetails.slots.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {viewEventDetails.slots.map(slot => (
                          <tr key={slot._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(slot.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {slot.startTime} - {slot.endTime}
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                    <p className="text-gray-500">No time slots available for this presentation</p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setViewEventDetails(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this presentation event? This will remove all associated time slots and cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-md disabled:opacity-75"
                  onClick={executeDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
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
