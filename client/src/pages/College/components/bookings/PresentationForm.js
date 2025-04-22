import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  calculateEndTime,
  timeToMinutes,
  daysOfWeek,
  timeSlotSuggestions,
  years,
  academicData,
  checkDayInDateRange,
  createEmptyDaySlots
} from './PresentationUtils';

const PresentationForm = ({ 
  editingEvent = null, 
  onCancel, 
  onSave,
  isSubmitting
}) => {
  // Form state
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
  const [daySlots, setDaySlots] = useState(createEmptyDaySlots());
  const [activeDay, setActiveDay] = useState(null);
  
  // Available departments based on selected school
  const [availableDepartments, setAvailableDepartments] = useState([]);

  // Update available departments when school changes
  useEffect(() => {
    if (formData.targetSchool && academicData[formData.targetSchool]) {
      setAvailableDepartments(academicData[formData.targetSchool]);
    } else {
      setAvailableDepartments([]);
    }
  }, [formData.targetSchool]);

  // Initialize form data if editing
  useEffect(() => {
    if (editingEvent) {
      // Reset form data with event details
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description,
        targetYear: editingEvent.targetYear,
        targetSchool: editingEvent.targetSchool,
        targetDepartment: editingEvent.targetDepartment,
        presentationType: editingEvent.presentationType,
        minTeamMembers: editingEvent.minTeamMembers || 2,
        maxTeamMembers: editingEvent.maxTeamMembers || 5,
        venue: editingEvent.venue,
        duration: editingEvent.duration,
        bufferTime: editingEvent.bufferTime || 0,
      });
      
      // Extract date information from slots to determine date range
      if (editingEvent.slots && editingEvent.slots.length > 0) {
        // Sort slots by date
        const sortedSlots = [...editingEvent.slots].sort((a, b) => 
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
    }
  }, [editingEvent]);

  // Update active day when days of week change
  useEffect(() => {
    if (daySlots.dateRange.daysOfWeek.length > 0 && !activeDay) {
      // Set the first selected day as active
      setActiveDay(daySlots.dateRange.daysOfWeek[0]);
    } else if (daySlots.dateRange.daysOfWeek.length === 0) {
      setActiveDay(null);
    }
  }, [daySlots.dateRange.daysOfWeek, activeDay]);
  
  // Define validateSelectedDays function
  const validateSelectedDays = useCallback(() => {
    if (!daySlots.dateRange.startDate || !daySlots.dateRange.endDate || daySlots.dateRange.daysOfWeek.length === 0) {
      return { valid: true, invalidDays: [] };
    }
    
    const startDate = new Date(daySlots.dateRange.startDate);
    const endDate = new Date(daySlots.dateRange.endDate);
    const invalidDays = [];
    
    daySlots.dateRange.daysOfWeek.forEach(day => {
      const isDayInRange = checkDayInDateRange(day, startDate, endDate);
      if (!isDayInRange) {
        invalidDays.push(day);
      }
    });
    
    return {
      valid: invalidDays.length === 0,
      invalidDays
    };
  }, [daySlots.dateRange.startDate, daySlots.dateRange.endDate, daySlots.dateRange.daysOfWeek]);
  
  // Get day label from day value
  const getDayLabel = useCallback((dayValue) => {
    return daysOfWeek.find(day => day.value === dayValue)?.label || '';
  }, []);
  
  // Add validation when date range changes
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
  }, [daySlots.dateRange.startDate, daySlots.dateRange.endDate, daySlots.dateRange.daysOfWeek.length, getDayLabel, validateSelectedDays]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // This function is already defined using useCallback above


  // Toggle a day of week selection
  const handleDayOfWeekToggle = (dayValue) => {
    setDaySlots(prev => {
      const currentDays = prev.dateRange.daysOfWeek;
      
      // If removing a day, just filter it out
      if (currentDays.includes(dayValue)) {
        return {
          ...prev,
          dateRange: {
            ...prev.dateRange,
            daysOfWeek: currentDays.filter(day => day !== dayValue)
          }
        };
      }
      
      // Adding a day - validate it exists in the range first
      if (prev.dateRange.startDate && prev.dateRange.endDate) {
        // Check if this day occurs in the selected date range
        const isDayInRange = checkDayInDateRange(
          dayValue, 
          new Date(prev.dateRange.startDate),
          new Date(prev.dateRange.endDate)
        );
        
        if (!isDayInRange) {
          toast.warning(`${getDayLabel(dayValue)} doesn't occur in your selected date range.`);
          return prev; // Don't add the day
        }
      }
      
      // Day is valid, add it
      const updatedDays = [...currentDays, dayValue];
      
      // If this is the first day being added or there's no active day, set it as active
      if (currentDays.length === 0 || !activeDay) {
        setActiveDay(dayValue);
      }
      
      // Add an initial time slot - using setTimeout to avoid state update within state update
      if (prev.slots[dayValue].length === 0) {
        setTimeout(() => addTimeSlot(dayValue), 0);
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
  
  // Generate dates from date range
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
  
  // Check for overlapping time slots
  const hasOverlappingTimeSlots = () => {
    let hasOverlaps = false;
    
    Object.entries(daySlots.slots).forEach(([day, slots]) => {
      if (slots.length <= 1) return;
      
      // Sort slots by start time
      const sortedSlots = [...slots].sort((a, b) => {
        const aMinutes = timeToMinutes(a.startTime);
        const bMinutes = timeToMinutes(b.startTime);
        return aMinutes - bMinutes;
      });
      
      // Check for overlaps
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        const currentEndMinutes = timeToMinutes(sortedSlots[i].endTime);
        const nextStartMinutes = timeToMinutes(sortedSlots[i + 1].startTime);
        
        if (currentEndMinutes > nextStartMinutes) {
          hasOverlaps = true;
          break;
        }
      }
    });
    
    return hasOverlaps;
  };
  
  // Validate form before submission
  const validateFormBeforeSubmit = () => {
    // Check required fields
    if (!formData.title || !formData.description || !formData.venue || 
        !formData.targetYear || !formData.targetSchool || !formData.targetDepartment) {
      toast.error('Please fill all required fields');
      return false;
    }
    
    // Validate date range
    if (!daySlots.dateRange.startDate || !daySlots.dateRange.endDate) {
      toast.error('Please select a date range');
      return false;
    }
    
    // Validate days selection
    if (daySlots.dateRange.daysOfWeek.length === 0) {
      toast.error('Please select at least one day of the week');
      return false;
    }
    
    // Check time slots for each day
    const missingTimeSlots = daySlots.dateRange.daysOfWeek.filter(day => 
      daySlots.slots[day].length === 0
    );
    
    if (missingTimeSlots.length > 0) {
      const missingDays = missingTimeSlots.map(day => getDayLabel(day)).join(', ');
      toast.error(`Please add at least one time slot for: ${missingDays}`);
      return false;
    }

    // Validate date order
    if (new Date(daySlots.dateRange.startDate) > new Date(daySlots.dateRange.endDate)) {
      toast.error('Start date must be before or equal to end date');
      return false;
    }
    
    // Validate selected days exist in the range
    const daysValidation = validateSelectedDays();
    if (!daysValidation.valid) {
      const invalidDayLabels = daysValidation.invalidDays.map(day => getDayLabel(day)).join(', ');
      toast.error(`Selected days not in date range: ${invalidDayLabels}`);
      return false;
    }
    
    // Validate dates were generated
    const generatedDates = generateDatesFromRange();
    if (generatedDates.length === 0) {
      toast.error('No dates were generated. Please check your date range and selected days.');
      return false;
    }
    
    // Check for overlapping time slots
    if (hasOverlappingTimeSlots()) {
      toast.error('Some time slots are overlapping. Please check your schedule.');
      return false;
    }
    
    return true;
  };
  
  // Helper to create array of time slots with day of week
  const buildTimeSlotArray = () => {
    const allTimeSlots = [];
    daySlots.dateRange.daysOfWeek.forEach(dayOfWeek => {
      const slotsForDay = daySlots.slots[dayOfWeek] || [];
      
      // Add each slot with its day of week
      slotsForDay.forEach(slot => {
        allTimeSlots.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
          dayOfWeek: dayOfWeek
        });
      });
    });
    return allTimeSlots;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateFormBeforeSubmit()) return;
    
    // Generate all dates with their day of week
    const datesByDay = generateDatesFromRange();
    
    // Collect all date strings
    const allDates = datesByDay.map(({ date }) => date.toISOString());
    
    // Build time slots with day of week association
    const allTimeSlots = buildTimeSlotArray();
    
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
      timeSlots: allTimeSlots
    };

    onSave(batchCreateData, editingEvent);
  };

  return (
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
            onClick={onCancel}
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
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
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
  );
};

export default PresentationForm;