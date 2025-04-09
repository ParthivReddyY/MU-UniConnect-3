import React from 'react';
import { 
  format, 
  getYear, 
  eachMonthOfInterval, 
  startOfYear, 
  endOfYear,
  getMonth,
  isSameMonth,
  isValid
} from 'date-fns';
import { classNames, parseDateTime, EVENT_CATEGORIES } from '../../AcademicCalendar';

const CalendarYearView = ({ currentYearDate, onMonthClick, events }) => {
  const year = getYear(currentYearDate);
  const months = eachMonthOfInterval({
    start: startOfYear(currentYearDate),
    end: endOfYear(currentYearDate)
  });

  // Group events by month with improved date handling
  const eventsByMonth = Array(12).fill().map(() => []);
  events.forEach(event => {
    const eventDate = parseDateTime(event.datetime || event.date);
    if (eventDate && isValid(eventDate) && getYear(eventDate) === year) {
      const month = getMonth(eventDate);
      eventsByMonth[month].push(event);
    }
  });

  return (
    <div className="grid grid-cols-3 lg:grid-cols-4 gap-8">
      {months.map((month) => {
        const monthIndex = getMonth(month);
        const monthEvents = eventsByMonth[monthIndex];
        const isCurrentMonth = isSameMonth(month, new Date());
        
        // Group events by date within the month
        const daysWithEvents = {};
        monthEvents.forEach(event => {
          const eventDate = parseDateTime(event.datetime || event.date);
          if (eventDate && isValid(eventDate)) {
            const day = format(eventDate, 'd');
            if (!daysWithEvents[day]) {
              daysWithEvents[day] = [];
            }
            daysWithEvents[day].push(event);
          }
        });

        return (
          <div 
            key={month.toString()}
            className="rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white hover:border-red-200"
            onClick={() => onMonthClick(monthIndex)}
          >
            {/* Month Header */}
            <div className={classNames(
              'px-3 py-2 text-center font-semibold text-lg',
              isCurrentMonth ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'
            )}>
              {format(month, 'MMMM')}
            </div>
            
            {/* Month Summary */}
            <div className="p-3 bg-white flex flex-col">
              {/* Event count badge */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-base text-gray-500">
                  {format(month, 'yyyy')}
                </div>
                {monthEvents.length > 0 && (
                  <div className="bg-red-50 text-red-600 text-sm font-medium px-2 py-1 rounded-full border border-red-100">
                    {monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'}
                  </div>
                )}
              </div>

              {/* Calendar mini visualization with colors by category */}
              <div className="mt-1 space-y-1">
                {Object.keys(daysWithEvents).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(daysWithEvents)
                      .sort((a, b) => parseInt(a) - parseInt(b))
                      .map(day => {
                        // Find the predominant category for this day
                        const categoryCounts = {};
                        daysWithEvents[day].forEach(event => {
                          const cat = event.category || 'DEFAULT';
                          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                        });
                        
                        const predominantCategory = Object.entries(categoryCounts)
                          .sort((a, b) => b[1] - a[1])[0][0];
                        
                        const category = EVENT_CATEGORIES[predominantCategory];
                        
                        return (
                          <div 
                            key={day}
                            className={`flex items-center justify-center rounded-lg ${category.lightBgColor} ${category.textColor} border ${category.borderColor} w-9 h-9 text-sm font-medium relative`}
                            title={`${daysWithEvents[day].length} events on day ${day}`}
                          >
                            {/* Date number */}
                            {day}
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <p className="text-base text-gray-500 py-2">No events</p>
                )}
              </div>

              {/* Notable events preview with category colors */}
              {monthEvents.length > 0 && (
                <div className="mt-3 text-sm text-gray-700">
                  <div className="font-medium mb-1 text-gray-600">Notable:</div>
                  <ul className="space-y-1">
                    {monthEvents.slice(0, 2).map(event => {
                      const category = EVENT_CATEGORIES[event.category || 'DEFAULT'];
                      return (
                        <li key={event.id} className="flex items-center space-x-2" title={event.title}>
                          <span className={`w-2 h-2 rounded-full ${category.bgColor} flex-shrink-0`}></span>
                          <span className={`truncate ${category.textColor}`}>{event.title}</span>
                        </li>
                      );
                    })}
                    {monthEvents.length > 2 && (
                      <li className="text-gray-500 pl-4">
                        +{monthEvents.length - 2} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarYearView;