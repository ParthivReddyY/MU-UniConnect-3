import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const AcademicCalendar = () => {
  // Sample events for calendar
  const events = [
    {
      id: 1,
      title: 'Mid Semester Exams',
      start: new Date(2023, 9, 15),
      end: new Date(2023, 9, 22),
    },
    {
      id: 2,
      title: 'Cultural Fest',
      start: new Date(2023, 10, 5),
      end: new Date(2023, 10, 7),
    },
    {
      id: 3,
      title: 'College Foundation Day',
      start: new Date(2023, 10, 15),
      end: new Date(2023, 10, 16),
    },
  ];

  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-dark-gray">Academic Calendar</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day', 'agenda']}
          />
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-primary-red">Important Dates</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="bg-red-light text-primary-red rounded-lg p-3 h-16 w-16 flex flex-col items-center justify-center text-center">
                <span className="text-xs">OCT</span>
                <span className="text-xl font-bold">15</span>
              </div>
              <div>
                <h4 className="font-medium">Mid Semester Examinations Begin</h4>
                <p className="text-sm text-medium-gray">8:00 AM - All Departments</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-red-light text-primary-red rounded-lg p-3 h-16 w-16 flex flex-col items-center justify-center text-center">
                <span className="text-xs">NOV</span>
                <span className="text-xl font-bold">05</span>
              </div>
              <div>
                <h4 className="font-medium">Cultural Festival Begins</h4>
                <p className="text-sm text-medium-gray">5:00 PM - University Grounds</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-red-light text-primary-red rounded-lg p-3 h-16 w-16 flex flex-col items-center justify-center text-center">
                <span className="text-xs">NOV</span>
                <span className="text-xl font-bold">15</span>
              </div>
              <div>
                <h4 className="font-medium">College Foundation Day</h4>
                <p className="text-sm text-medium-gray">10:00 AM - University Auditorium</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-red-light text-primary-red rounded-lg p-3 h-16 w-16 flex flex-col items-center justify-center text-center">
                <span className="text-xs">DEC</span>
                <span className="text-xl font-bold">05</span>
              </div>
              <div>
                <h4 className="font-medium">End Semester Examinations Begin</h4>
                <p className="text-sm text-medium-gray">8:00 AM - All Departments</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              className="text-primary-red hover:underline text-sm font-medium flex items-center cursor-pointer bg-transparent border-0"
              onClick={() => console.log('Download calendar')}
            >
              Download Full Academic Calendar
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AcademicCalendar;
