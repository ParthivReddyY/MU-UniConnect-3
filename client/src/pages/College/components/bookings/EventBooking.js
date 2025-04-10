import React from 'react';

const EventBooking = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
      <div className="h-36 bg-primary-red flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2">Event Booking</h3>
        <p className="text-medium-gray mb-4 h-24">
          Book auditoriums, seminar halls, and other venues for cultural events, 
          technical symposiums, and other student activities.
        </p>
        <button className="w-full bg-primary-red text-white py-2 px-4 rounded hover:bg-secondary-red transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default EventBooking;
