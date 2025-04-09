import React from 'react';
import { format, addHours, isValid } from 'date-fns';
import { EVENT_CATEGORIES, parseDateTime } from '../../AcademicCalendar';

const SelectedEventsList = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <p className="text-gray-500 italic">No events scheduled for this day.</p>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute top-0 bottom-0 left-2 w-0.5 bg-gray-200 z-0"></div>
      
      <ul className="space-y-3 relative z-10">
        {events.map(event => {
          const category = EVENT_CATEGORIES[event.category || 'DEFAULT'];
          const startTime = parseDateTime(event.datetime);
          
          // Safely handle cases with invalid or missing endDatetime
          let endTime;
          if (event.endDatetime) {
            endTime = parseDateTime(event.endDatetime);
          } else if (startTime && isValid(startTime)) {
            // Default to 1 hour later if only start time is valid
            endTime = addHours(startTime, 1);
          }
          
          // Skip invalid events to prevent rendering issues
          if (!startTime || !isValid(startTime)) return null;
          
          return (
            <li key={event.id} className="pl-7 relative">
              {/* Timeline dot */}
              <div className={`absolute left-2 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-1/2 ${category.bgColor}`}></div>
              
              {/* Event content */}
              <div className="flex flex-col">
                <span className={`font-medium ${category.textColor}`}>{event.title}</span>
                <span className="text-gray-500 text-sm">
                  {event.time === 'All Day' ? (
                    'All Day'
                  ) : (
                    <>
                      {format(startTime, 'h:mm a')} 
                      {endTime && isValid(endTime) && ` - ${format(endTime, 'h:mm a')}`}
                    </>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SelectedEventsList;