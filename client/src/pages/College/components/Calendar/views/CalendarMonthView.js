import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  isValid
} from 'date-fns';
import { classNames, parseDateTime, EVENT_CATEGORIES } from '../../AcademicCalendar';

const CalendarMonthView = ({ currentMonthDate, selectedDate, onDateClick, events, weekStartsOn = 1 }) => {
  // Create date range for the month grid
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(currentMonthDate);
  const calendarStartDate = startOfWeek(monthStart, { weekStartsOn });
  const calendarEndDate = endOfWeek(monthEnd, { weekStartsOn });
  
  // Generate all days to display in the grid
  const calendarDays = eachDayOfInterval({
    start: calendarStartDate,
    end: calendarEndDate
  });

  // Group events by date with improved date handling
  const eventsByDate = {};
  events.forEach(event => {
    const eventDate = parseDateTime(event.datetime || event.date);
    if (eventDate && isValid(eventDate)) {
      const dateKey = format(eventDate, 'yyyy-MM-dd');
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    }
  });

  // Create a 2D array for weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Day of week headers */}
      <div className="grid grid-cols-7 gap-px border-b border-gray-200 bg-white text-center text-sm font-semibold leading-6 text-gray-700 shadow-sm">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="py-3">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 isolate grid grid-cols-7 grid-rows-6 gap-[1px] bg-gray-100 text-base overflow-y-auto scrollbar-hide">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day) => {
              // Get events for this day
              const dayEvents = eventsByDate[format(day, 'yyyy-MM-dd')] || [];
              const isCurrentMonth = isSameMonth(day, currentMonthDate);
              const isSelectedDay = isSameDay(day, selectedDate);
              
              // Limit visible events (max 3 to prevent overflow)
              const visibleEvents = dayEvents.slice(0, 3);
              const hiddenEventsCount = Math.max(0, dayEvents.length - 3);
                  
              return (
                <div
                  key={day.toString()}
                  className={classNames(
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                    isSelectedDay && 'bg-red-50 ring-1 ring-red-200',
                    'relative min-h-[6rem] py-2 px-2 flex flex-col hover:bg-red-50 hover:z-10 focus:z-10 cursor-pointer transition-all duration-150',
                    'border border-gray-100'
                  )}
                  onClick={() => onDateClick(day)}
                >
                  {/* Day number */}
                  <time
                    dateTime={format(day, 'yyyy-MM-dd')}
                    className={classNames(
                      'ml-auto flex h-8 w-8 items-center justify-center rounded-full',
                      isToday(day) ? 'bg-red-600 font-semibold text-white' : 
                      !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                    )}
                  >
                    <span className="text-base">{format(day, 'd')}</span>
                  </time>
                  
                  {/* Events for the day */}
                  <ol className="mt-2 space-y-1">
                    {visibleEvents.map((event) => {
                      const category = EVENT_CATEGORIES[event.category || 'DEFAULT'];
                      return (
                        <li key={event.id}>
                          <div className={`flex items-center rounded-md px-2 py-1 ${category.lightBgColor} ${category.textColor} border-l-[3px] ${category.borderColor} shadow-sm transition-all hover:shadow-md`}>
                            <p className="truncate text-xs font-medium flex-grow" title={event.title}>
                              {event.title}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                    
                    {hiddenEventsCount > 0 && (
                      <li>
                        <div className="text-xs text-gray-500 bg-white py-1 px-2 rounded-md border border-gray-100 shadow-sm mt-1">
                          +{hiddenEventsCount} more
                        </div>
                      </li>
                    )}
                  </ol>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CalendarMonthView;