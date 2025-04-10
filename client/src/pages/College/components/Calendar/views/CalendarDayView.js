import React from 'react';
import { format, addHours, isValid } from 'date-fns';
import { classNames, parseDateTime, EVENT_CATEGORIES } from '../../AcademicCalendar';

const CalendarDayView = ({ currentDate, events, onEventDoubleClick }) => {
  // Get events for the current day
  const filteredEvents = events.filter(event => {
    const eventDate = parseDateTime(event.datetime);
    if (!eventDate || !isValid(eventDate)) return false;  // Skip invalid dates
    
    const compareDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    return eventDate.getFullYear() === compareDate.getFullYear() && 
      eventDate.getMonth() === compareDate.getMonth() && 
      eventDate.getDate() === compareDate.getDate();
  }).sort((a, b) => {
    const timeA = parseDateTime(a.datetime);
    const timeB = parseDateTime(b.datetime);
    if (!timeA || !timeB) return 0;
    return timeA - timeB;
  });

  // Generate hours for display
  const startHour = 7; // 7 AM
  const endHour = 20; // 8 PM
  
  // Create an array of hours for the day
  const hoursOfDay = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
    const hour = startHour + i;
    const date = new Date(currentDate);
    date.setHours(hour, 0, 0, 0);
    return date;
  });

  // Function to calculate event position and height in the grid
  const getEventStyles = (event) => {
    const eventStart = parseDateTime(event.datetime);
    const eventEnd = parseDateTime(event.endDatetime) || addHours(eventStart, 1);
    
    if (!eventStart || !isValid(eventStart)) return {}; // Skip if no valid start time

    // Calculate position (0 to 100%)
    const totalDayMinutes = (endHour - startHour + 1) * 60;
    const eventStartMinutes = Math.max(0, (eventStart.getHours() - startHour) * 60 + eventStart.getMinutes());
    const eventEndMinutes = Math.min(
      (eventEnd.getHours() - startHour) * 60 + eventEnd.getMinutes(),
      totalDayMinutes
    );
    
    const topPosition = (eventStartMinutes / totalDayMinutes) * 100;
    const height = Math.max(5, ((eventEndMinutes - eventStartMinutes) / totalDayMinutes) * 100); // Minimum height

    return {
      top: `${topPosition}%`,
      height: `${height}%`
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Day header */}
      <header className="flex-none bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, 'EEEE')}
          </h2>
          <p className="text-base text-gray-500 mt-1">
            {format(currentDate, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="text-base bg-white text-gray-600 px-4 py-1 rounded-full border border-gray-200 shadow-sm">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </div>
      </header>

      {/* Main grid - Added position relative for proper event positioning */}
      <div className="flex flex-1 overflow-y-auto scrollbar-hide bg-white relative">
        {/* Time indicators */}
        <div className="flex-none w-16 bg-white ring-1 ring-gray-100 z-10">
          <div className="sticky top-0 z-20 bg-white text-sm font-medium text-gray-600 text-center py-2 border-b border-gray-100">Hour</div>
          <div className="grid grid-cols-1">
            {hoursOfDay.map((hour) => (
              <div key={hour.getTime()} className="h-16 flex items-center justify-center border-t border-gray-100">
                <span className="text-sm font-medium text-gray-400">
                  {format(hour, 'h a')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Event grid */}
        <div className="flex-auto grid grid-cols-1 grid-rows-1 overflow-y-auto border-l border-gray-100 relative">
          {/* Background grid with half-hour lines */}
          <div className="col-start-1 col-end-2 row-start-1 row-end-2 absolute inset-0">
            {hoursOfDay.map((hour) => (
              <div key={hour.getTime()} className="relative h-16">
                {/* Hour line */}
                <div className={classNames(
                  "border-t border-gray-100 h-full",
                  (hour.getHours() >= 9 && hour.getHours() <= 17) 
                    ? 'bg-white' 
                    : 'bg-gray-50/30'
                )}/>
                
                {/* Half hour line */}
                <div className="absolute left-0 right-0 top-1/2 border-t border-gray-100 border-dashed opacity-70" />
              </div>
            ))}
          </div>

          {/* Events */}
          <ol className="col-start-1 col-end-2 row-start-1 row-end-2 relative z-20 px-2 min-h-full">
            {filteredEvents.map((event) => {
              const { top, height } = getEventStyles(event);
              const category = EVENT_CATEGORIES[event.category || 'DEFAULT'];
              
              return (
                <li 
                  key={event.id}
                  className="absolute inset-x-2 flex flex-col transition-all duration-300 hover:z-30"
                  style={{ top, height }}
                  onDoubleClick={() => onEventDoubleClick && onEventDoubleClick(event)}
                >
                  <div className={`flex-auto rounded-md border-l-4 ${category.borderColor} p-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white ${category.lightBgColor} bg-opacity-70 cursor-pointer`}>
                    <p className={`text-sm font-semibold ${category.textColor} mb-1`}>
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-600 whitespace-nowrap">
                      {format(parseDateTime(event.datetime), 'h:mm a')} - {format(parseDateTime(event.endDatetime || addHours(parseDateTime(event.datetime), 1)), 'h:mm a')}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Current time indicator */}
          <div className="col-start-1 col-end-2 row-start-1 row-end-2 z-10 pointer-events-none">
            {(() => {
              const now = new Date();
              if (now.getFullYear() === currentDate.getFullYear() && 
                  now.getMonth() === currentDate.getMonth() && 
                  now.getDate() === currentDate.getDate()) {
                
                const totalDayMinutes = (endHour - startHour + 1) * 60;
                const nowMinutes = (now.getHours() - startHour) * 60 + now.getMinutes();
                const topPosition = (nowMinutes / totalDayMinutes) * 100;
                
                return (
                  <div 
                    className="absolute left-0 right-0 flex items-center" 
                    style={{ top: `${topPosition}%` }}
                  >
                    <div className="h-3 w-3 rounded-full bg-red-500 ml-3 animate-pulse"></div>
                    <div className="h-[2px] flex-1 bg-red-500"></div>
                    <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-md mr-4 shadow-md">
                      {format(now, 'h:mm a')}
                    </span>
                  </div>
                )
              }
              return null;
            })()}
          </div>
        </div>
      </div>

      {/* Legend at the bottom - timeline style */}
      {filteredEvents.length > 0 && (
        <div className="flex-none border-t border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="font-medium text-base text-gray-700 mb-3">Today's Schedule</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-0 bottom-0 left-2 w-0.5 bg-gray-200 z-0"></div>
            
            <ul className="space-y-3 relative z-10">
              {filteredEvents.map(event => {
                const category = EVENT_CATEGORIES[event.category || 'DEFAULT'];
                const startTime = parseDateTime(event.datetime);
                const endTime = parseDateTime(event.endDatetime) || (startTime && addHours(startTime, 1));
                
                if (!startTime || !isValid(startTime)) return null;
                
                return (
                  <li key={event.id} className="pl-7 relative">
                    {/* Timeline dot */}
                    <div className={`absolute left-2 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-1/2 ${category.bgColor}`}></div>
                    <span className={`font-medium ${category.textColor} mr-2`}>{event.title}</span>
                    <span className="text-gray-500 text-sm">
                      {format(startTime, 'h:mm a')} - {endTime ? format(endTime, 'h:mm a') : 'TBD'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDayView;