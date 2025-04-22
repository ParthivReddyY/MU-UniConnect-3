import { format } from 'date-fns';

/**
 * Calculates the end time based on start time and duration
 * 
 * @param {string} startTime - Start time in format "HH:MM"
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} bufferTime - Buffer time in minutes
 * @returns {string} End time in format "HH:MM"
 */
export const calculateEndTime = (startTime, durationMinutes, bufferTime = 0) => {
  if (!startTime) return '';
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + (durationMinutes + bufferTime) * 60000);
  const endHours = endDate.getHours().toString().padStart(2, '0');
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
  
  return `${endHours}:${endMinutes}`;
};

/**
 * Format date for display
 * 
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  return format(new Date(dateString), 'EEE, MMM d, yyyy');
};

/**
 * Check if a day of week exists within a date range
 * 
 * @param {number} dayValue - Day value (0-6, where 0 is Sunday)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean} Whether day exists in range
 */
export const checkDayInDateRange = (dayValue, startDate, endDate) => {
  endDate.setHours(23, 59, 59, 999); // Include the entire end date
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (currentDate.getDay() === dayValue) {
      return true;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return false;
};

/**
 * Convert time string to minutes
 * 
 * @param {string} timeString - Time in format "HH:MM"
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Create an object with template time slots for each day
 * 
 * @returns {Object} Time slot template object
 */
export const createEmptyDaySlots = () => ({
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

/**
 * Days of week configuration
 */
export const daysOfWeek = [
  { value: 0, label: 'Sun', color: 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300' },
  { value: 1, label: 'Mon', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300' },
  { value: 2, label: 'Tue', color: 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300' },
  { value: 3, label: 'Wed', color: 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300' },
  { value: 4, label: 'Thu', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300' },
  { value: 5, label: 'Fri', color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-300' },
  { value: 6, label: 'Sat', color: 'bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-300' }
];

/**
 * Time slot suggestions by day of week
 */
export const timeSlotSuggestions = {
  0: ['10:00', '11:30', '13:00', '14:30', '16:00'],         // Sunday
  1: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'], // Monday
  2: ['09:30', '11:00', '13:30', '15:00', '16:30'],          // Tuesday
  3: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'], // Wednesday
  4: ['09:30', '11:00', '13:30', '15:00', '16:30'],          // Thursday
  5: ['09:00', '10:30', '12:00', '14:00', '15:30'],          // Friday
  6: ['10:00', '11:30', '13:00', '14:30']                    // Saturday
};

/**
 * Academic data containing schools and departments
 */
export const academicData = {
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
};

/**
 * List of academic years
 */
export const years = [
  'First Year', 'Second Year', 'Third Year', 'Fourth Year', 'All Years'
];

/**
 * Animation variants for page transitions
 */
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};