import React from 'react';

const FacultyAppointment = () => {
  return (
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
  );
};

export default FacultyAppointment;
