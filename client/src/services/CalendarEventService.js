// Cache for storing fetched events by year to avoid unnecessary API calls
const eventsCache = {};

/**
 * Fetch public holidays from the Nager.Date API
 * @param {number} year - The year to fetch holidays for
 * @returns {Promise<Array>} - Array of holiday events
 */
const fetchPublicHolidays = async (year) => {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/publicholidays/${year}/IN`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch public holidays: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform API data to our event format
    return data.map((holiday, index) => ({
      id: `holiday-${year}-${index}`,
      title: holiday.name,
      date: holiday.date,
      time: 'All Day',
      datetime: `${holiday.date}T00:00`,
      endDatetime: `${holiday.date}T23:59`,
      category: holiday.global ? 'NATIONAL' : 'HOLIDAY'
    }));
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    return [];
  }
};

/**
 * Fetch Hindu festivals from the Calendarific API
 * @param {number} year - The year to fetch festivals for
 * @returns {Promise<Array>} - Array of festival events
 */
const fetchHinduFestivals = async (year) => {
  // Try using a free API for Hindu festivals - Holiday API with a free tier
  try {
    // Using public proxy to avoid CORS issues with the free API
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(
      `https://www.googleapis.com/calendar/v3/calendars/en.indian%23holiday@group.v.calendar.google.com/events?key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs&timeMin=${year}-01-01T00:00:00Z&timeMax=${year+1}-01-01T00:00:00Z`
    )}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch festivals: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items) return [];
    
    // Transform Google Calendar API data to our event format
    return data.items.map((event, index) => {
      const startDate = event.start.date || (event.start.dateTime ? event.start.dateTime.split('T')[0] : null);
      
      if (!startDate) return null;
      
      return {
        id: `festival-${year}-${index}`,
        title: event.summary,
        date: startDate,
        time: 'All Day',
        datetime: `${startDate}T00:00`,
        endDatetime: `${startDate}T23:59`,
        category: 'FESTIVAL'
      };
    }).filter(Boolean); // Remove null events
  } catch (error) {
    console.error('Error fetching Hindu festivals:', error);
    return [];
  }
};

/**
 * Generate academic events for a specific year - dates that generally don't change annually
 * @param {number} year - The year to generate events for
 * @returns {Array} Array of academic events
 */
const getAcademicEvents = (year) => {
  return [
    { title: 'New Academic Year Begins', date: `${year}-07-01`, category: 'ACADEMIC' },
    { title: 'Orientation Day', date: `${year}-07-03`, category: 'ACADEMIC' },
    { title: 'Teachers Day', date: `${year}-09-05`, category: 'ACADEMIC' },
    { title: 'Mid Term Exams Start', date: `${year}-09-20`, category: 'ACADEMIC' },
    { title: 'Mid Term Exams End', date: `${year}-09-27`, category: 'ACADEMIC' },
    { title: 'Summer Vacation Begins', date: `${year}-05-20`, category: 'ACADEMIC' },
    { title: 'End Semester Exams Start', date: `${year}-12-01`, category: 'ACADEMIC' },
    { title: 'End Semester Exams End', date: `${year}-12-15`, category: 'ACADEMIC' },
    { title: 'Winter Break Begins', date: `${year}-12-16`, category: 'ACADEMIC' }
  ];
};

/**
 * Fallback festival dates if APIs fail
 * @param {number} year 
 * @returns {Array} Basic festival dates
 */
const getFallbackFestivalDates = (year) => {
  const baseYear = 2023; // Reference year for festival dates
  const yearDiff = year - baseYear;
  
  // Approximate shifts for lunar calendar-based festivals (very rough estimation)
  // In reality, these need proper astronomical calculations
  const lunarShift = Math.floor(yearDiff * 10.875) % 30;
  
  // Base dates from 2023
  const festivals = [
    { title: 'New Year', date: `${year}-01-01`, category: 'HOLIDAY' },
    { title: 'Makar Sankranti', date: `${year}-01-14`, category: 'FESTIVAL' },
    { title: 'Republic Day', date: `${year}-01-26`, category: 'NATIONAL' },
    { title: 'Independence Day', date: `${year}-08-15`, category: 'NATIONAL' },
    { title: 'Teachers Day', date: `${year}-09-05`, category: 'ACADEMIC' },
    { title: 'Gandhi Jayanti', date: `${year}-10-02`, category: 'NATIONAL' },
    { title: 'Christmas', date: `${year}-12-25`, category: 'HOLIDAY' },
    // Add lunar calendar festivals with adjusted dates
    { title: 'Diwali', date: adjustLunarDate(`${year}-11-12`, lunarShift), category: 'FESTIVAL' },
    { title: 'Holi', date: adjustLunarDate(`${year}-03-08`, lunarShift), category: 'FESTIVAL' }
  ];
  
  // Helper function to adjust lunar calendar dates
  function adjustLunarDate(baseDate, shift) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - shift);
    return date.toISOString().split('T')[0];
  }
  
  return festivals;
};

/**
 * Generate fallback events for a year if API requests fail
 * @param {number} year - The year to generate events for
 * @returns {Array} Generated events
 */
export const generateFallbackEvents = (year) => {
  const baseId = year * 1000;
  
  // Start with basic events that don't change much between years
  let events = getFallbackFestivalDates(year);
  
  // Add academic events
  events = [...events, ...getAcademicEvents(year)];
  
  // Add administrative events - randomly generated
  for (let i = 1; i <= 6; i++) {
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    events.push({
      title: `Faculty Meeting ${i}`,
      date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      category: 'ADMINISTRATIVE'
    });
  }
  
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

/**
 * Generate university-specific events for a year
 * @param {number} year - The year to generate events for
 * @returns {Array} University events
 */
export const generateUniversityEvents = (year) => {
  // Base event ID to avoid conflicts
  const baseId = year * 1000 + 500;
  
  // University-specific events that don't change dates
  const events = getAcademicEvents(year);
  
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

/**
 * Fetch events for a specific year using multiple APIs
 * @param {number} year - The year to fetch events for
 * @returns {Promise<Array>} Events for the specified year
 */
export const getEventsForYear = async (year) => {
  // Check cache first
  if (eventsCache[year]) {
    return eventsCache[year];
  }

  try {
    // Fetch from multiple sources in parallel for better performance
    const [holidays, festivals] = await Promise.all([
      fetchPublicHolidays(year),
      fetchHinduFestivals(year)
    ]);
    
    // Combine all events
    let events = [...holidays, ...festivals];
    
    // If no events were fetched (APIs failed), use fallback data
    if (events.length === 0) {
      events = generateFallbackEvents(year);
    } else {
      // Add university events even if we got API data
      const universityEvents = generateUniversityEvents(year);
      events = [...events, ...universityEvents];
    }
    
    // Cache the results
    eventsCache[year] = events;
    return events;
  } catch (error) {
    console.error(`Error generating events for year ${year}:`, error);
    
    // Return fallback events on error
    const fallbackEvents = generateFallbackEvents(year);
    eventsCache[year] = fallbackEvents;
    return fallbackEvents;
  }
};

const CalendarEventService = {
  getEventsForYear,
  generateFallbackEvents,
  generateUniversityEvents
};

export default CalendarEventService;
