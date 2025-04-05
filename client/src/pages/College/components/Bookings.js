import React from 'react';

const Bookings = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-dark-gray">Bookings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Event Booking */}
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
        
        {/* Faculty Appointment */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <div className="h-36 bg-primary-teal flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-2">Faculty Appointment</h3>
            <p className="text-medium-gray mb-4 h-24">
              Schedule meetings with professors during their office hours for academic guidance, 
              project discussions, or personal mentoring.
            </p>
            <button className="w-full bg-primary-teal text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
              Schedule Meeting
            </button>
          </div>
        </div>
        
        {/* Presentation Slot */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <div className="h-36 bg-accent-gold flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-2">Presentation Slot</h3>
            <p className="text-medium-gray mb-4 h-24">
              Reserve time slots for project presentations, thesis defense, or seminar presentations 
              with the necessary equipment and facilities.
            </p>
            <button className="w-full bg-accent-gold text-white py-2 px-4 rounded hover:bg-yellow-500 transition-colors">
              Book Slot
            </button>
          </div>
        </div>
        
        {/* Project Submission */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <div className="h-36 bg-success-green flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-2">Project Submission</h3>
            <p className="text-medium-gray mb-4 h-24">
              Submit your academic projects, research papers, and assignments through our 
              digital portal with easy tracking and feedback.
            </p>
            <button className="w-full bg-success-green text-white py-2 px-4 rounded hover:bg-green-600 transition-colors">
              Submit Project
            </button>
          </div>
        </div>
        
        {/* Lab Booking */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <div className="h-36 bg-primary-red flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-2">Lab Booking</h3>
            <p className="text-medium-gray mb-4 h-24">
              Reserve specialized laboratories for research work, experiments, 
              or project development with required equipment and technical assistance.
            </p>
            <button className="w-full bg-primary-red text-white py-2 px-4 rounded hover:bg-secondary-red transition-colors">
              Reserve Lab
            </button>
          </div>
        </div>
        
        {/* Sports Facility */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <div className="h-36 bg-primary-teal flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-2">Sports Facility</h3>
            <p className="text-medium-gray mb-4 h-24">
              Book sports facilities including courts, grounds, and equipment 
              for personal practice, team events, or inter-college tournaments.
            </p>
            <button className="w-full bg-primary-teal text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
              Book Facility
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bookings;
