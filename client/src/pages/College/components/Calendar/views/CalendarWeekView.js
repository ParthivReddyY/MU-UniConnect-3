import React from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isToday, 
  isSameDay, 
  addHours,
  setHours,
  isValid
} from 'date-fns';
import { classNames, parseDateTime, EVENT_CATEGORIES } from '../../AcademicCalendar';

const CalendarWeekView = ({ currentDate, selectedDate, events, onDateClick, weekStartsOn = 1 }) => {
  // Generate days of the week
  const startDate = startOfWeek(currentDate, { weekStartsOn });
  const endDate = endOfWeek(currentDate, { weekStartsOn });
  const daysOfWeek = eachDayOfInterval({ start: startDate, end: endDate });

  // Time grid configuration
  const startHour = 7; // 7 AM
  const endHour = 20; // 8 PM
  
  // Create array of hour markers
  const hoursOfDay = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Get events for the current week with proper validation
  const eventsByDay = daysOfWeek.map(day => {
    return events.filter(event => {
      const eventDate = parseDateTime(event.datetime);
      return eventDate && isValid(eventDate) && isSameDay(eventDate, day);
    }).sort((a, b) => {
      const timeA = parseDateTime(a.datetime);
      const timeB = parseDateTime(b.datetime);
      if (!timeA || !timeB) return 0;
      return timeA - timeB;
    });
  });

  // Function to calculate event position and height in the grid
  const getEventStyles = (event) => {
    const eventStart = parseDateTime(event.datetime);
    const eventEnd = parseDateTime(event.endDatetime) || addHours(eventStart, 1); // Default to 1 hour if no end time
    
    if (!eventStart || !isValid(eventStart)) return {}; // Skip if no valid start time

    // Calculate position (0 to 100%)
    const totalDayMinutes = (endHour - startHour + 1) * 60;
    const eventStartMinutes = Math.max(0, (eventStart.getHours() - startHour) * 60 + eventStart.getMinutes());
    const eventEndMinutes = Math.min(
      (eventEnd.getHours() - startHour) * 60 + eventEnd.getMinutes(),
      totalDayMinutes
    );
    
    const topPosition = (eventStartMinutes / totalDayMinutes) * 100;
    const height = Math.max(5, ((eventEndMinutes - eventStartMinutes) / totalDayMinutes) * 100); // Min height of 5%

    return {
      top: `${topPosition}%`,
      height: `${height}%`,
      left: '5%',
      width: '90%'
    };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Week day headers */}
      <div className="flex-none border-b border-gray-200">
        <div className="flex bg-white">
          {/* Time header column */}
          <div className="w-16 flex-none bg-white border-r border-gray-100"></div>
          
          {/* Days of week */}
          <div className="flex flex-auto">
            {daysOfWeek.map((day, i) => (
              <button 
                key={day.toISOString()}
                type="button"
                onClick={() => onDateClick(day)}
                className={classNames(
                  "flex-1 min-w-0 py-3 hover:bg-red-50 focus:z-10 focus:outline-none transition-colors",
                  isSameDay(day, selectedDate) ? 'bg-red-50' : '',
                  i < daysOfWeek.length - 1 ? 'border-r border-gray-100' : ''
                )}
              >
                <div className="flex flex-col items-center">
                  <span className={classNames(
                    "text-sm font-medium text-center",
                    isToday(day) ? 'text-red-600' : 'text-gray-500'
                  )}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={classNames(
                    "mt-1 text-xl font-semibold text-center",
                    isToday(day) ? 'text-white bg-red-600 rounded-full w-8 h-8 flex items-center justify-center' : 'text-gray-900'
                  )}>
                    {format(day, 'd')}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    {format(day, 'MMM')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Time grid with events */}
      <div className="flex flex-1 overflow-y-auto scrollbar-hide">
        {/* Hour markers */}
        <div className="flex-none w-16 bg-white ring-1 ring-gray-100">
          {hoursOfDay.map((hour) => (
            <div 
              key={hour} 
              className="relative flex flex-col items-center justify-center h-16 border-t border-gray-100"
            >
              <span className="text-sm font-medium text-gray-400">{format(setHours(new Date(), hour), 'ha')}</span>
            </div>
          ))}
        </div>

        {/* Days columns with events */}
        <div className="flex-auto grid grid-cols-7 grid-rows-1 overflow-y-auto scrollbar-hide">
          {/* Render columns for each day */}
          {daysOfWeek.map((day, dayIndex) => (
            <div key={day.toISOString()} className="relative col-span-1">
              {/* Hour grid lines */}
              <div className="absolute inset-0">
                {hoursOfDay.map((hour) => (
                  <div key={hour} className="relative">
                    {/* Hour line */}
                    <div 
                      className={classNames(
                        "absolute w-full border-t border-gray-100 h-16",
                        (hour >= 9 && hour <= 17) ? 'bg-white' : 'bg-gray-50/30'
                      )}
                      style={{ top: `${(hour - startHour) * 64}px` }}
                    />
                    
                    {/* Half hour line */}
                    <div 
                      className="absolute w-full border-t border-gray-100 border-dashed opacity-70"
                      style={{ top: `${(hour - startHour) * 64 + 32}px` }}
                    />
                  </div>
                ))}
              </div>

              {/* Current time line (if today) */}
              {isToday(day) && (() => {
                const now = new Date();
                const minutes = (now.getHours() - startHour) * 60 + now.getMinutes();
                const totalMinutes = (endHour - startHour + 1) * 60;
                const topPosition = (minutes / totalMinutes) * 100;
                
                if (minutes >= 0 && now.getHours() <= endHour) {
                  return (
                    <div 
                      className="absolute left-0 right-0 flex items-center z-20" 
                      style={{ top: `${topPosition}%` }}
                    >
                      <div className="h-[2px] w-full bg-red-500"></div>
                      <div className="absolute left-0 h-3 w-3 -ml-1.5 -mt-1.5 rounded-full bg-red-500"></div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Day events */}
              <div className="absolute inset-0">
                {eventsByDay[dayIndex].map((event) => {
                  const { top, height, left, width } = getEventStyles(event);
                  const category = EVENT_CATEGORIES[event.category || 'DEFAULT'];
                  
                  return (
                    <div
                      key={event.id}
                      className="absolute z-10"
                      style={{ top, height, left, width }}
                    >
                      <div className={`h-full rounded-md border-l-4 ${category.borderColor} p-1 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white ${category.lightBgColor} bg-opacity-40`}>
                        <div className={`text-xs ${category.textColor} font-medium mb-0.5`}>
                          {format(parseDateTime(event.datetime), 'h:mm a')}
                        </div>
                        <div className="text-xs font-semibold truncate text-gray-800">{event.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarWeekView;