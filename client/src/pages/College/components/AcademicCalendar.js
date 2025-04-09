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
import { ChevronLeft, ChevronRight, MoreHorizontal, X, Loader } from 'lucide-react';
import CalendarDayView from './Calendar/views/CalendarDayView';
import CalendarWeekView from './Calendar/views/CalendarWeekView';
import CalendarMonthView from './Calendar/views/CalendarMonthView';
import CalendarYearView from './Calendar/views/CalendarYearView';
import SelectedEventsList from './Calendar/components/SelectedEventsList';
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

// --- Sample local events for demo purposes ---
const sampleLocalEvents = [
  // Event for Today
  { id: 11, title: 'Team Sync', date: format(new Date(), 'yyyy-MM-dd'), time: '11AM', datetime: `${format(new Date(), 'yyyy-MM-dd')}T11:00`, endDatetime: `${format(new Date(), 'yyyy-MM-dd')}T12:00`, category: 'ADMINISTRATIVE' },
  { id: 20, title: 'Lunch', date: format(new Date(), 'yyyy-MM-dd'), time: '1PM', datetime: `${format(new Date(), 'yyyy-MM-dd')}T13:00`, endDatetime: `${format(new Date(), 'yyyy-MM-dd')}T14:00`, category: 'PERSONAL' },
];

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

// Event form component
const EventForm = ({ isOpen, onClose, onSave, initialDate }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [eventTime, setEventTime] = useState('12:00');
  const [eventDuration, setEventDuration] = useState(1);
  const [eventCategory, setEventCategory] = useState('DEFAULT');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (eventTitle.trim() && eventDate && eventTime && eventDuration > 0) {
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
        time: format(startDateTime, 'h:mma'),
        datetime: format(startDateTime, "yyyy-MM-dd'T'HH:mm"),
        endDatetime: format(endDateTime, "yyyy-MM-dd'T'HH:mm"),
        category: eventCategory
      };
      
      onSave(newEvent);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Add New Event</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Event Title */}
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-gray-700">
              Event Title
            </label>
            <input
              type="text"
              id="event-title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              placeholder="Enter event title"
              required
            />
          </div>
          
          {/* Event Date */}
          <div>
            <label htmlFor="event-date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="event-date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              step="0.25"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              required
            />
          </div>
          
          {/* Event Time */}
          <div>
            <label htmlFor="event-time" className="block text-sm font-medium text-gray-700">
              Time
            </label>
            <input
              type="time"
              id="event-time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              required
            />
          </div>
          
          {/* Event Category */}
          <div>
            <label htmlFor="event-category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="event-category"
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            >
              {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
              ))}
            </select>
          </div>
          
          {/* Event Duration */}
          <div>
            <label htmlFor="event-duration" className="block text-sm font-medium text-gray-700">
              Duration (hours)
            </label>
            <input
              type="number"
              id="event-duration"
              value={eventDuration}
              onChange={(e) => setEventDuration(Math.max(0.25, Number(e.target.value)))}
              min="0.25"
              step="0.25"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              required
            />
          </div>
          
          {/* Preview */}
          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-2">Event Preview:</p>
            <div className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${EVENT_CATEGORIES[eventCategory].lightBgColor} ${EVENT_CATEGORIES[eventCategory].textColor} ring-1 ring-inset ${EVENT_CATEGORIES[eventCategory].borderColor}`}>
              {eventTitle || "Event Title"}
            </div>
          </div>
          
          {/* Buttons */}
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Loading Overlay Component ---
const LoadingOverlay = ({ message = "Loading calendar events..." }) => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-white bg-opacity-80 p-6">
    <Loader className="h-8 w-8 text-red-600 animate-spin mb-4" />
    <p className="text-gray-600 font-medium text-center">{message}</p>
  </div>
);

// --- Main Calendar Application Component ---
function AcademicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState(sampleLocalEvents);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Reference for the view dropdown menu for detecting outside clicks
  const viewMenuRef = useRef(null);
  
  // Add this new reference to track if a view change is in progress
  const viewChangeInProgressRef = useRef(false);
  
  // Track years we've already loaded
  const loadedYearsRef = useRef(new Set());

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

  // Effect to load events when the year changes
  useEffect(() => {
    const fetchEventsForCurrentView = async () => {
      try {
        setLoading(true);
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
          setLoading(false);
          return;
        }
        
        try {
          // Import the service dynamically to avoid webpack issues
          const CalendarService = await import('../../../services/CalendarEventService');
          
          // Process all needed years
          let newEvents = [];
          for (const year of yearsToFetch) {
            const yearEvents = await CalendarService.getEventsForYear(year);
            newEvents = [...newEvents, ...yearEvents];
            loadedYearsRef.current.add(year);
          }
          
          // Merge with existing events
          setEvents(prevEvents => {
            const existingEventIds = new Set(prevEvents.map(e => e.id));
            const uniqueNewEvents = newEvents.filter(e => !existingEventIds.has(e.id));
            return [...prevEvents, ...uniqueNewEvents];
          });
        } catch (importError) {
          console.error('Error importing calendar service:', importError);
          setError('Could not load calendar service. Using local data only.');
        }
        
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError('Failed to load calendar events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventsForCurrentView();
  }, [currentDate, view]);

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
    if (view === 'month' && !isSameMonth(day, currentDate)) {
      setCurrentDate(startOfMonth(day));
    }
    // When clicking a day header in Week view, switch to Day view for that day
    if (view === 'week') {
      setView('day');
      setCurrentDate(day); // Set Day view's reference date
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
    setShowEventForm(true);
  };

  const handleSaveEvent = (newEvent) => {
    setUserEvents(prev => [...prev, newEvent]);
    // Add success notification if needed
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

          {/* Add event button - matched width with other buttons */}
          <button
            onClick={handleAddEventClick}
            type="button"
            className="h-10 w-24 rounded-md bg-red-600 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors flex items-center justify-center"
          >
            <span className="mr-1">+</span> Add event
          </button>
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
                {/* Uniform styling for mobile menu */}
                <button onClick={handleAddEventClick} className="block w-full px-4 py-2 text-left text-base text-red-600 font-medium hover:bg-red-50 transition-colors">Create event</button>
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

      {/* Calendar Grid Area - Clean white background with hidden scrollbars */}
      <div className="shadow-sm ring-1 ring-gray-200 lg:flex lg:flex-auto lg:flex-col bg-white mt-2 h-[85vh] overflow-hidden rounded-b-lg relative">
        {loading && <LoadingOverlay />}
        
        <div key={`view-${view}`} className="flex-auto h-full overflow-auto">
          {view === 'day' && (
            <CalendarDayView
              currentDate={selectedDate}
              events={allEvents}
            />
          )}
          {view === 'week' && (
            <CalendarWeekView
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={allEvents}
              onDateClick={handleDateClick}
              weekStartsOn={weekStartsOn}
            />
          )}
          {view === 'month' && (
            <CalendarMonthView
              currentMonthDate={currentDate}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
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
              />
            </div>
          )}
        </div>
      </div>

      {/* Event Form Modal */}
      <EventForm 
        isOpen={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSave={handleSaveEvent}
        initialDate={selectedDate}
      />

      {/* Selected Day Events Section - Clean white styling */}
      {view === 'month' && eventsForDate(selectedDate).length > 0 && (
        <div className="py-4 px-6 mt-2 border-t border-gray-200 lg:hidden bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-3">
            Schedule for <time dateTime={format(selectedDate, 'yyyy-MM-dd')}>{format(selectedDate, 'MMMM d, yyyy')}</time>
          </h3>
          <SelectedEventsList events={eventsForDate(selectedDate)} />
        </div>
      )}
    </div>
  );
}

export default AcademicCalendar;
