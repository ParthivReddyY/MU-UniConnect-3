import React, { useState, useEffect, useRef } from 'react';
import {
  format,
  startOfMonth,
  addMonths,
  subMonths,
  addYears,
  subYears,
  getYear,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  setHours,
  setMinutes,
  addMinutes,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfYear,
  parse,
  isValid
} from 'date-fns';
import { ChevronLeft, ChevronRight, MoreHorizontal, X, Calendar, Clock, Tag, Plus, Check } from 'lucide-react';
import CalendarDayView from './Calendar/views/CalendarDayView';
import CalendarWeekView from './Calendar/views/CalendarWeekView';
import CalendarMonthView from './Calendar/views/CalendarMonthView';
import CalendarYearView from './Calendar/views/CalendarYearView';
import SelectedEventsList from './Calendar/components/SelectedEventsList';
import { useAuth } from '../../../contexts/AuthContext';

// --- Configuration ---
const weekStartsOn = 1; // 1 = Monday

// Event categories with their colors - Enhanced with better contrasting colors
export const EVENT_CATEGORIES = {
  ACADEMIC: { name: 'Academic', shortName: 'ACAD', color: 'blue', bgColor: 'bg-blue-600', lightBgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-300' },
  CULTURAL: { name: 'Cultural', shortName: 'CULT', color: 'purple', bgColor: 'bg-purple-600', lightBgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-300' },
  ADMINISTRATIVE: { name: 'Administrative', shortName: 'ADMIN', color: 'green', bgColor: 'bg-emerald-600', lightBgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-300' },
  HOLIDAY: { name: 'Holiday', shortName: 'HOL', color: 'red', bgColor: 'bg-rose-600', lightBgColor: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'border-rose-300' },
  FESTIVAL: { name: 'Festival', shortName: 'FEST', color: 'amber', bgColor: 'bg-amber-600', lightBgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-300' },
  NATIONAL: { name: 'National', shortName: 'NAT', color: 'teal', bgColor: 'bg-teal-600', lightBgColor: 'bg-teal-50', textColor: 'text-teal-700', borderColor: 'border-teal-300' },
  PERSONAL: { name: 'Personal', shortName: 'PERS', color: 'pink', bgColor: 'bg-pink-600', lightBgColor: 'bg-pink-50', textColor: 'text-pink-700', borderColor: 'border-pink-300' },
  DEFAULT: { name: 'Misc', shortName: 'MISC', color: 'gray', bgColor: 'bg-gray-600', lightBgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-300' },
};

// --- Helper Functions ---
// Improved date parsing with better timezone handling
export const parseDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return null; // Handle null or undefined input
  
  try {
    // For ISO strings with time
    if (dateTimeStr.includes('T')) {
      // Handle full ISO format with seconds
      if (dateTimeStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
        const [datePart, timePart] = dateTimeStr.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        // Create date using UTC to avoid timezone issues
        return new Date(year, month - 1, day, hours, minutes, seconds);
      }
      
      // Handle ISO format without seconds
      if (dateTimeStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        const [datePart, timePart] = dateTimeStr.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        // Create date using local time components
        return new Date(year, month - 1, day, hours, minutes);
      }
      
      // Extract just the date part
      const datePart = dateTimeStr.split('T')[0];
      if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = datePart.split('-').map(Number);
        // Create date at start of day to avoid timezone issues
        return new Date(year, month - 1, day, 0, 0, 0);
      }
    }
    
    // Handle YYYY-MM-DD format
    if (dateTimeStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateTimeStr.split('-').map(Number);
      // Create date at start of day
      return new Date(year, month - 1, day, 0, 0, 0);
    }
    
    // Fallback to date-fns parse for other formats
    const formats = [
      "yyyy-MM-dd'T'HH:mm:ss",
      "yyyy-MM-dd'T'HH:mm",
      "yyyy-MM-dd",
      "MM/dd/yyyy",
      "dd/MM/yyyy"
    ];
    
    for (const format of formats) {
      const parsedDate = parse(dateTimeStr, format, new Date());
      if (isValid(parsedDate)) return parsedDate;
    }
    
    console.warn("Unable to parse date:", dateTimeStr);
    return null;
  } catch (e) {
    console.error("Error parsing date:", dateTimeStr, e);
    return null;
  }
};

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Event form component with Notion-like design
const EventForm = ({ isOpen, onClose, onSave, initialDate }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [eventTime, setEventTime] = useState('12:00');
  const [eventDuration, setEventDuration] = useState(1);
  const [eventCategory, setEventCategory] = useState('DEFAULT');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryRef = useRef(null);
  
  // New state variables for additional options
  const [location, setLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [repeatOption, setRepeatOption] = useState('none');
  const [description, setDescription] = useState('');
  const [repeatMenuOpen, setRepeatMenuOpen] = useState(false);
  
  const repeatRef = useRef(null);
  
  // Repeat options
  const REPEAT_OPTIONS = {
    none: { name: 'Does not repeat', value: 'none' },
    daily: { name: 'Daily', value: 'daily' },
    weekly: { name: 'Weekly', value: 'weekly' },
    monthly: { name: 'Monthly', value: 'monthly' },
    yearly: { name: 'Yearly', value: 'yearly' },
  };
  
  // Reset form values when initialDate changes
  useEffect(() => {
    setEventDate(format(initialDate, 'yyyy-MM-dd'));
  }, [initialDate]);
  
  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryMenuOpen(false);
      }
      if (repeatRef.current && !repeatRef.current.contains(e.target)) {
        setRepeatMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryRef, repeatRef]);
  
  // Effect to adjust time when all-day is toggled
  useEffect(() => {
    if (isAllDay) {
      setEventTime('00:00');
      setEventDuration(24);
    } else if (eventDuration === 24 && eventTime === '00:00') {
      // Reset to default if turning off all-day
      setEventTime('12:00');
      setEventDuration(1);
    }
  }, [isAllDay, eventDuration, eventTime]);
  
  // Fix for all-day toggle - refactor for better reactivity
  useEffect(() => {
    if (isAllDay) {
      // When all-day is toggled on, set time to start of day and duration to 24 hours
      if (eventTime !== '00:00' || eventDuration !== 24) {
        setEventTime('00:00');
        setEventDuration(24);
      }
    } else if (eventTime === '00:00' && eventDuration === 24) {
      // Only reset if the current values match our all-day defaults
      setEventTime('12:00');
      setEventDuration(1);
    }
  }, [isAllDay, eventTime, eventDuration]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (eventTitle.trim() && eventDate) {
      // Parse time
      const [hours, minutes] = eventTime.split(':').map(Number);
      const selectedDate = parse(eventDate, 'yyyy-MM-dd', new Date());
      
      // Create start and end datetimes
      const startDateTime = setMinutes(setHours(selectedDate, hours), minutes);
      const endDateTime = addMinutes(startDateTime, eventDuration * 60);
      
      // Format for event object
      const newEvent = {
        id: Date.now(),
        title: eventTitle.trim(),
        date: eventDate,
        time: isAllDay ? 'All day' : format(startDateTime, 'h:mma'),
        datetime: format(startDateTime, "yyyy-MM-dd'T'HH:mm"),
        endDatetime: format(endDateTime, "yyyy-MM-dd'T'HH:mm"),
        category: eventCategory,
        // Add new fields
        location: location.trim(),
        isAllDay: isAllDay,
        repeat: repeatOption,
        description: description.trim()
      };
      
      onSave(newEvent);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden animate-fade-in">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Header */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-gray-100">
            <h3 className="text-xl font-medium text-gray-900">New Event</h3>
            <button 
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="px-4 py-2 overflow-y-auto max-h-[calc(100vh-250px)]">
            {/* Event Title and All-Day Toggle in one row */}
            <div className="flex items-center mb-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full text-xl font-medium placeholder-gray-400 border-0 border-b-2 border-transparent focus:border-red-500 focus:ring-0 px-0 py-1 bg-white"
                  placeholder="Event title"
                  required
                  autoFocus
                />
              </div>
              <div className="ml-4 flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-2">All day</span>
                <label htmlFor="all-day-toggle" className="relative inline-block w-10 align-middle select-none cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="all-day-toggle"
                    checked={isAllDay}
                    onChange={() => setIsAllDay(!isAllDay)}
                    className="sr-only"
                  />
                  <div className={`block h-6 w-10 rounded-full transition-colors ${isAllDay ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                  <div className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${isAllDay ? 'transform translate-x-4' : ''}`}></div>
                </label>
              </div>
            </div>
            
            {/* Main form grid - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              {/* Date display */}
              <div className="bg-gray-50 rounded-lg p-2 flex items-center">
                <div className="w-full">
                  <p className="text-xs font-medium text-gray-500 mb-1">Date</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="border-0 p-0 text-sm text-gray-800 focus:ring-0 bg-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Time picker */}
              <div className={`bg-gray-50 rounded-lg p-2 ${isAllDay ? 'opacity-50' : ''}`}>
                <label htmlFor="event-time" className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <input
                    type="time"
                    id="event-time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full border-0 p-0 text-sm text-gray-800 focus:ring-0 bg-transparent"
                    required
                    disabled={isAllDay}
                  />
                </div>
              </div>
              
              {/* Duration */}
              <div className={`bg-gray-50 rounded-lg p-2 ${isAllDay ? 'opacity-50' : ''}`}>
                <label htmlFor="event-duration" className="block text-xs font-medium text-gray-500 mb-1">Duration (hours)</label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">hr</span>
                  <input
                    type="number"
                    id="event-duration"
                    value={eventDuration}
                    onChange={(e) => setEventDuration(Math.max(0.25, Number(e.target.value)))}
                    min="0.25"
                    step="0.25"
                    className="w-full border-0 p-0 text-sm text-gray-800 focus:ring-0 bg-transparent"
                    required
                    disabled={isAllDay}
                  />
                </div>
              </div>
            </div>
            
            {/* Second row - Location, Repeat, Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              {/* Location */}
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <label htmlFor="event-location" className="text-xs font-medium text-gray-500">Location</label>
                </div>
                <input
                  type="text"
                  id="event-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  className="w-full border-0 p-0 text-sm text-gray-800 focus:ring-0 bg-transparent"
                />
              </div>
              
              {/* Repetition */}
              <div className="relative bg-gray-50 rounded-lg p-2" ref={repeatRef}>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setRepeatMenuOpen(!repeatMenuOpen)}
                >
                  <div className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500">Repeat</span>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-800 mr-1">{REPEAT_OPTIONS[repeatOption].name}</p>
                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${repeatMenuOpen ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                
                {repeatMenuOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-40 overflow-auto">
                    <div className="p-1">
                      {Object.values(REPEAT_OPTIONS).map((option) => (
                        <div 
                          key={option.value} 
                          className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer rounded-md"
                          onClick={() => {
                            setRepeatOption(option.value);
                            setRepeatMenuOpen(false);
                          }}
                        >
                          <span className="text-sm text-gray-800">{option.name}</span>
                          {repeatOption === option.value && (
                            <Check className="w-4 h-4 text-red-500 ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Category dropdown */}
              <div className="relative bg-gray-50 rounded-lg p-2" ref={categoryRef}>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                >
                  <div className="flex items-center space-x-1">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">Category</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${EVENT_CATEGORIES[eventCategory].lightBgColor} ${EVENT_CATEGORIES[eventCategory].textColor} ring-1 ring-inset ${EVENT_CATEGORIES[eventCategory].borderColor}`}>
                      {EVENT_CATEGORIES[eventCategory].name}
                    </div>
                    <ChevronRight className={`h-4 w-4 text-gray-400 ml-1 transition-transform duration-200 ${categoryMenuOpen ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                
                {categoryMenuOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-40 overflow-auto">
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                        <div 
                          key={key} 
                          className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer rounded-md"
                          onClick={() => {
                            setEventCategory(key);
                            setCategoryMenuOpen(false);
                          }}
                        >
                          <div className={`w-2 h-2 rounded-full ${category.bgColor} mr-2`}></div>
                          <span className="text-sm text-gray-800">{category.name}</span>
                          {eventCategory === key && (
                            <Check className="w-3 h-3 text-red-500 ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Description and Preview in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <label htmlFor="event-description" className="text-xs font-medium text-gray-500">Description</label>
                </div>
                <textarea
                  id="event-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about this event..."
                  rows="2"
                  className="w-full border-0 p-0 text-sm text-gray-800 focus:ring-0 bg-transparent resize-none"
                />
              </div>
              
              {/* Event summary/preview */}
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-medium text-gray-500 mb-1">Event Preview:</p>
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full ${EVENT_CATEGORIES[eventCategory].bgColor} mt-1 flex-shrink-0`}></div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${EVENT_CATEGORIES[eventCategory].textColor}`}>
                      {eventTitle || "Event Title"}
                    </p>
                    <div className="mt-0.5 text-xs text-gray-600 space-y-0.5">
                      <p className="line-clamp-1">{format(parse(eventDate, 'yyyy-MM-dd', new Date()), 'EEE, MMM d')} • {isAllDay ? 'All day' : format(parse(`${eventDate}T${eventTime}`, "yyyy-MM-dd'T'HH:mm", new Date()), 'h:mm a')}</p>
                      {location && <p className="line-clamp-1">{location}</p>}
                      {repeatOption !== 'none' && <p className="line-clamp-1">Repeats {REPEAT_OPTIONS[repeatOption].name.toLowerCase()}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with buttons */}
          <div className="px-4 py-2 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 border border-gray-300 rounded-md shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 border border-transparent rounded-md shadow-sm transition-colors"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Event Detail Modal Component
const EventDetailModal = ({ isOpen, event, onClose }) => {
  if (!isOpen || !event) return null;
  
  // Get category styling
  const category = EVENT_CATEGORIES[event.category || 'DEFAULT'];
  const eventDate = parseDateTime(event.datetime || event.date);
  const isUserEvent = event.userId; // If userId exists, it's a user-created event
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto overflow-hidden animate-fade-in" 
           onClick={e => e.stopPropagation()}>
        {/* Header with category color */}
        <div className={`px-6 py-4 ${category.lightBgColor} border-b border-gray-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full ${category.bgColor} mr-2`}></div>
              <span className={`text-xs font-medium ${category.textColor}`}>{category.name}</span>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 className="text-xl font-semibold mt-2 text-gray-900">{event.title}</h2>
        </div>
        
        {/* Event Content */}
        <div className="p-6">
          {/* Date and Time */}
          <div className="flex items-start mb-4">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-gray-900 font-medium">
                {eventDate ? format(eventDate, 'EEEE, MMMM d, yyyy') : event.date}
              </p>
              <p className="text-gray-600 text-sm">
                {event.isAllDay ? 'All day' : event.time}
              </p>
              {event.repeat && event.repeat !== 'none' && (
                <p className="text-gray-500 text-xs mt-1">
                  Repeats {event.repeat.charAt(0).toUpperCase() + event.repeat.slice(1)}
                </p>
              )}
            </div>
          </div>
          
          {/* Location if available */}
          {event.location && (
            <div className="flex items-start mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-gray-900">{event.location}</p>
              </div>
            </div>
          )}
          
          {/* Description if available */}
          {event.description && (
            <div className="flex items-start mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <div>
                <p className="text-gray-900 whitespace-pre-line">{event.description}</p>
              </div>
            </div>
          )}
          
          {/* Created by info - only for user events */}
          {isUserEvent && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {event.userRole ? `Added by ${event.userRole}` : 'User event'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Calendar Application Component ---
function AcademicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // New state for selected event
  
  // Get auth context to check user roles
  const { currentUser, hasRole } = useAuth();
  
  // Check if user can add events (admin, faculty, or clubHead)
  const canAddEvents = () => {
    return currentUser && hasRole(['admin', 'faculty', 'clubHead']);
  };
  
  // View menu reference and other refs
  const viewMenuRef = useRef(null);
  const viewChangeInProgressRef = useRef(false);
  const loadedYearsRef = useRef(new Set());

  // Function to show success message temporarily
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Effect to close the view menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target)) {
        setViewMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [viewMenuRef]);

  // Add this new effect to handle view changes
  useEffect(() => {
    // Reset the view change flag when view has changed
    viewChangeInProgressRef.current = false;
  }, [view]);

  // Effect to load user events from the server when component mounts
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!currentUser) return;
      
      try {
        const response = await fetch('/api/calendar-events/user-events', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.events && Array.isArray(data.events)) {
            setUserEvents(data.events);
          }
        }
      } catch (error) {
        console.error('Error fetching user events:', error);
        // Keep the sample events if fetch fails
      }
    };
    
    fetchUserEvents();
  }, [currentUser]);

  // Effect to load events when the year changes
  useEffect(() => {
    const fetchEventsForCurrentView = async () => {
      try {
        // Don't show loading state, just fetch in background
        setError(null);
        
        const currentYear = getYear(currentDate);
        const yearsToLoad = new Set([currentYear]);
        
        // Determine which additional years we need based on view
        if (view === 'year') {
          yearsToLoad.add(currentYear - 1);
          yearsToLoad.add(currentYear + 1);
        } else if (view === 'month') {
          const month = currentDate.getMonth();
          if (month === 0) yearsToLoad.add(currentYear - 1);
          if (month === 11) yearsToLoad.add(currentYear + 1);
        }
        
        // Filter out years we've already loaded
        const yearsToFetch = [...yearsToLoad].filter(year => !loadedYearsRef.current.has(year));
        
        if (yearsToFetch.length === 0) {
          return;
        }
        
        try {
          // Import the service dynamically to avoid webpack issues
          const CalendarEventService = await import('../../../services/CalendarEventService').then(module => module.default);
          
          // Process all needed years
          let newEvents = [];
          for (const year of yearsToFetch) {
            console.log(`Fetching events for year ${year}`);
            const yearEvents = await CalendarEventService.getEventsForYear(year);
            console.log(`Received ${yearEvents.length} events for year ${year}`);
            
            newEvents = [...newEvents, ...yearEvents];
            loadedYearsRef.current.add(year);
          }
          
          // Merge with existing events, ensuring we don't duplicate
          setEvents(prevEvents => {
            // Create a map of existing event IDs
            const existingEventMap = new Map(prevEvents.map(e => [e.id, e]));
            
            // Add new events, replacing existing ones with the same ID
            newEvents.forEach(newEvent => {
              existingEventMap.set(newEvent.id, newEvent);
            });
            
            // Convert map values back to array
            return Array.from(existingEventMap.values());
          });
        } catch (importError) {
          console.error('Error importing calendar service:', importError);
          setError('Could not load all calendar events. Using local data only.');
          
          // Use fallback events generator when the service fails
          for (const year of yearsToFetch) {
            const fallbackEvents = generateFallbackEvents(year);
            console.log(`Generated ${fallbackEvents.length} fallback events for year ${year}`);
            setEvents(prevEvents => [...prevEvents, ...fallbackEvents]);
            loadedYearsRef.current.add(year);
          }
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError('Failed to load some calendar events. Please try again later.');
      }
    };

    fetchEventsForCurrentView();
  }, [currentDate, view]);

  // Add the fallback generator function directly to ensure it's available
  const generateFallbackEvents = (year) => {
    const baseId = year * 1000;
    
    // Helper function to adjust lunar calendar dates
    function adjustLunarDate(baseDate, shift) {
      try {
        const date = new Date(baseDate);
        if (isNaN(date.getTime())) {
          console.error('Invalid date provided:', baseDate);
          return baseDate; // Return original if invalid
        }
        
        // Apply the shift
        date.setDate(date.getDate() - shift);
        
        // Format back to YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('Error adjusting lunar date:', error);
        return baseDate; // Return original if error
      }
    }
    
    const baseYear = 2023; // Reference year for festival dates
    const yearDiff = year - baseYear;
    
    // Approximate shifts for lunar calendar-based festivals
    const lunarShift = Math.floor(yearDiff * 10.875) % 30;
    
    // Start with basic events that don't change much between years
    let events = [
      { title: 'New Year', date: `${year}-01-01`, category: 'HOLIDAY' },
      { title: 'Makar Sankranti', date: `${year}-01-14`, category: 'FESTIVAL' },
      { title: 'Republic Day', date: `${year}-01-26`, category: 'NATIONAL' },
      { title: 'Holi', date: adjustLunarDate(`${year}-03-08`, lunarShift), category: 'FESTIVAL' },
      { title: 'Ram Navami', date: adjustLunarDate(`${year}-03-30`, lunarShift), category: 'FESTIVAL' },
      { title: 'Buddha Purnima', date: adjustLunarDate(`${year}-05-05`, lunarShift), category: 'FESTIVAL' },
      { title: 'Independence Day', date: `${year}-08-15`, category: 'NATIONAL' },
      { title: 'Janmashtami', date: adjustLunarDate(`${year}-08-19`, lunarShift), category: 'FESTIVAL' },
      { title: 'Teachers Day', date: `${year}-09-05`, category: 'ACADEMIC' },
      { title: 'Gandhi Jayanti', date: `${year}-10-02`, category: 'NATIONAL' },
      { title: 'Dussehra', date: adjustLunarDate(`${year}-10-15`, lunarShift), category: 'FESTIVAL' },
      { title: 'Diwali', date: adjustLunarDate(`${year}-11-12`, lunarShift), category: 'FESTIVAL' },
      { title: 'Christmas', date: `${year}-12-25`, category: 'HOLIDAY' }
    ];
    
    // Add academic events
    events = [...events, ...[
      { title: 'New Academic Year Begins', date: `${year}-07-01`, category: 'ACADEMIC' },
      { title: 'Orientation Day', date: `${year}-07-03`, category: 'ACADEMIC' },
      { title: 'Mid Term Exams Start', date: `${year}-09-20`, category: 'ACADEMIC' },
      { title: 'Mid Term Exams End', date: `${year}-09-27`, category: 'ACADEMIC' },
      { title: 'End Semester Exams Start', date: `${year}-12-01`, category: 'ACADEMIC' },
      { title: 'End Semester Exams End', date: `${year}-12-15`, category: 'ACADEMIC' }
    ]];
    
    // Format events properly
    return events.map((event, index) => {
      return {
        id: baseId + index,
        title: event.title,
        date: event.date,
        time: 'All Day',
        datetime: `${event.date}T00:00`,
        endDatetime: `${event.date}T23:59`,
        category: event.category
      };
    });
  };

  // --- Date Navigation Handlers ---
  const navigate = (direction) => {
    switch (view) {
      case 'day':
        const newDay = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
        setCurrentDate(newDay);
        setSelectedDate(newDay); // Keep selectedDate in sync with Day view
        break;
      case 'week':
        const newWeekDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
        setCurrentDate(newWeekDate);
        setSelectedDate(startOfWeek(newWeekDate, { weekStartsOn })); // Select start of the new week
        break;
      case 'month':
        const newMonthDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
        setCurrentDate(newMonthDate);
        setSelectedDate(startOfMonth(newMonthDate)); // Select start of the new month
        break;
      case 'year':
        const newYearDate = direction === 'next' ? addYears(currentDate, 1) : subYears(currentDate, 1);
        setCurrentDate(newYearDate);
        setSelectedDate(startOfYear(newYearDate)); // Select start of the new year
        break;
      default:
        break;
    }
    setMobileMenuOpen(false);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setMobileMenuOpen(false);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    
    // Adjust current date based on view
    if (view === 'month' && !isSameMonth(day, currentDate)) {
      setCurrentDate(startOfMonth(day));
    } else if (view === 'week') {
      setCurrentDate(day);
      // Optionally switch to day view when clicking in week view
      // setView('day'); 
    } else {
      setCurrentDate(day);
    }
  };

  const handleMonthClick = (monthIndex) => {
    setCurrentDate(new Date(getYear(currentDate), monthIndex, 1));
    setView('month');
  };

  // --- Event Handling ---
  const eventsForDate = (date) => {
    const allEvents = [...events, ...userEvents];
    return allEvents.filter(event => {
      const eventDate = parseDateTime(event.date || event.datetime); // Use date field first if available
      return eventDate && isSameDay(eventDate, date);
    }).sort((a, b) => { // Optional: Sort events by time
      const timeA = parseDateTime(a.datetime);
      const timeB = parseDateTime(b.datetime);
      if (!timeA || !timeB) return 0;
      return timeA - timeB;
    });
  };

  const handleAddEventClick = () => {
    // Only show form if user has permission
    if (canAddEvents()) {
      // No change needed here - selectedDate is already properly passed to EventForm
      setShowEventForm(true);
    } else {
      setError("You don't have permission to add events. Only faculty, club heads, and administrators can add events.");
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  // Save event to both local state and the server
  const handleSaveEvent = async (newEvent) => {
    try {
      // Save to the server if user is logged in
      if (currentUser) {
        const eventToSave = {
          ...newEvent,
          userId: currentUser.id,
          userRole: currentUser.role
        };
        
        const response = await fetch('/api/calendar-events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(eventToSave)
        });
        
        if (response.ok) {
          const data = await response.json();
          // Use the server-generated ID and data
          setUserEvents(prev => [...prev, data.event]);
          showSuccess("Event created successfully!");
        } else {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          setError(`Failed to save event: ${errorData.message || 'Unknown error'}`);
          setTimeout(() => setError(null), 5000);
        }
      } else {
        // Just add to local state if not logged in
        setUserEvents(prev => [...prev, newEvent]);
        showSuccess("Event created successfully!");
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setError("Failed to save event. Please check your connection and try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Add handler for double-click on day
  const handleDayDoubleClick = (day) => {
    if (canAddEvents()) {
      setSelectedDate(day);
      setShowEventForm(true);
    }
  };

  // Double-click handler for events - passing to calendar views
  const handleEventDoubleClick = (event) => {
    if (canAddEvents()) {
      // Use the event date if available
      const eventDate = parseDateTime(event.datetime || event.date);
      if (eventDate && isValid(eventDate)) {
        setSelectedDate(eventDate);
      }
      setShowEventForm(true);
    }
  };

  // Handle event click to show details
  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  // --- Dynamic Header Title ---
  const getHeaderTitle = () => {
    switch (view) {
      case 'day':
        return format(selectedDate, 'MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn });
        const startFormat = isSameMonth(weekStart, weekEnd) ? 'MMM d' : 'MMM d, yyyy';
        return `Week of ${format(weekStart, startFormat)} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return '';
    }
  };

  // All events combined for display
  const allEvents = [...events, ...userEvents];

  // --- Success Message Component ---
  const SuccessMessage = ({ message }) => (
    <div className="bg-green-50 border border-green-300 text-green-700 p-4 rounded-md mb-4 animate-fade-in">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );

  // --- Error Message Component ---
  const ErrorMessage = ({ message }) => (
    <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );

  // Create a wrapper for setView to prevent multiple rapid view changes
  const handleViewChange = (newView) => {
    if (viewChangeInProgressRef.current) return;
    
    viewChangeInProgressRef.current = true;
    setView(newView);
    
    // Close any open menus
    setViewMenuOpen(false);
    setMobileMenuOpen(false);
  };

  // --- Render Logic ---
  return (
    <div className="lg:flex lg:h-full lg:flex-col font-sans bg-white rounded-lg shadow-md border border-gray-100">
      {/* Header - Clean white design */}
      <header className="flex items-center justify-between border-b border-gray-200 py-4 px-6 lg:flex-none bg-white shadow-sm">
        <h1 className="text-lg font-semibold leading-6 text-gray-900">
          <time dateTime={format(currentDate, 'yyyy-MM-dd')}>
            {getHeaderTitle()}
          </time>
        </h1>

        {/* Desktop Controls - Uniform styling */}
        <div className="hidden md:flex items-center gap-3">
          {/* Navigation buttons group */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('prev')}
              type="button"
              className="h-10 w-10 bg-white border border-gray-200 text-red-600 rounded-l-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors flex items-center justify-center"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={goToToday}
              type="button"
              className="h-10 w-24 bg-white border-t border-b border-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigate('next')}
              type="button"
              className="h-10 w-10 bg-white border border-gray-200 text-red-600 rounded-r-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors flex items-center justify-center"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* View selector button */}
          <div className="relative" ref={viewMenuRef}>
            <button
              type="button"
              onClick={() => setViewMenuOpen(!viewMenuOpen)}
              className="h-10 w-28 bg-white border border-gray-200 text-gray-700 text-base font-medium rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors flex items-center justify-between px-4"
            >
              <span>{view.charAt(0).toUpperCase() + view.slice(1)}</span>
              <ChevronRight className="h-5 w-5 text-red-500 rotate-90 ml-2" />
            </button>
            
            {viewMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-32 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {['day', 'week', 'month', 'year'].map((viewType) => (
                    <button
                      key={viewType}
                      onClick={() => handleViewChange(viewType)}
                      className={`block w-full px-4 py-2 text-left text-base ${view === viewType ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-500'} transition-colors`}
                    >
                      {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add event button - Only shown to authorized users */}
          {currentUser && (
            <button
              onClick={handleAddEventClick}
              type="button"
              className={`h-10 px-4 rounded-md text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors flex items-center justify-center ${
                canAddEvents() 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              title={canAddEvents() ? "Add new event" : "Only faculty, club heads, and administrators can add events"}
            >
              <Plus className="w-4 h-4 mr-1" /> Add event
            </button>
          )}
        </div>

        {/* Mobile Controls - More consistent styling too */}
        <div className="relative flex items-center md:hidden gap-2">
          <button
            onClick={goToToday}
            type="button"
            className="h-10 w-24 bg-white border border-gray-200 text-gray-800 text-base font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors flex items-center justify-center"
          >
            Today
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="h-10 w-10 flex items-center justify-center bg-white border border-gray-200 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          </button>
          {mobileMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
              <div className="py-1">
                {/* Only show Create event option to authorized users */}
                {canAddEvents() && (
                  <button onClick={handleAddEventClick} className="block w-full px-4 py-2 text-left text-base text-red-600 font-medium hover:bg-red-50 transition-colors">Create event</button>
                )}
                <button onClick={() => handleViewChange('day')} className="block w-full px-4 py-2 text-left text-base text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">Day</button>
                <button onClick={() => handleViewChange('week')} className="block w-full px-4 py-2 text-left text-base text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">Week</button>
                <button onClick={() => handleViewChange('month')} className="block w-full px-4 py-2 text-left text-base text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">Month</button>
                <button onClick={() => handleViewChange('year')} className="block w-full px-4 py-2 text-left text-base text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">Year</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Display error if any */}
      {error && <ErrorMessage message={error} />}

      {/* Display success message if any */}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* Calendar Grid Area - Clean white background with hidden scrollbars */}
      <div className="shadow-sm ring-1 ring-gray-200 lg:flex lg:flex-auto lg:flex-col bg-white mt-2 h-[85vh] overflow-hidden rounded-b-lg relative">
        <div key={`view-${view}`} className="flex-auto h-full overflow-auto">
          {view === 'day' && (
            <CalendarDayView
              currentDate={selectedDate}
              events={allEvents}
              onEventDoubleClick={handleEventDoubleClick}
              onEventClick={handleEventClick}
              onDayDoubleClick={handleDayDoubleClick}
            />
          )}
          {view === 'week' && (
            <CalendarWeekView
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={allEvents}
              onDateClick={handleDateClick}
              onEventDoubleClick={handleEventDoubleClick}
              onEventClick={handleEventClick}
              onDayDoubleClick={handleDayDoubleClick}
              weekStartsOn={weekStartsOn}
            />
          )}
          {view === 'month' && (
            <CalendarMonthView
              currentMonthDate={currentDate}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              onEventDoubleClick={handleEventDoubleClick}
              onEventClick={handleEventClick}
              onDayDoubleClick={handleDayDoubleClick}
              events={allEvents}
              weekStartsOn={weekStartsOn}
            />
          )}
          {view === 'year' && (
            <div className="p-4 md:p-6">
              <CalendarYearView
                currentYearDate={currentDate}
                onMonthClick={handleMonthClick}
                events={allEvents}
                onEventClick={handleEventClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* Event Form Modal - Ensure selectedDate is passed */}
      {canAddEvents() && (
        <EventForm 
          isOpen={showEventForm}
          onClose={() => setShowEventForm(false)}
          onSave={handleSaveEvent}
          initialDate={selectedDate}
        />
      )}

      {/* Selected Day Events Section - Clean white styling */}
      {view === 'month' && eventsForDate(selectedDate).length > 0 && (
        <div className="py-4 px-6 mt-2 border-t border-gray-200 lg:hidden bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-3">
            Schedule for <time dateTime={format(selectedDate, 'yyyy-MM-dd')}>{format(selectedDate, 'MMMM d, yyyy')}</time>
          </h3>
          <SelectedEventsList events={eventsForDate(selectedDate)} />
        </div>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal 
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

export default AcademicCalendar;
