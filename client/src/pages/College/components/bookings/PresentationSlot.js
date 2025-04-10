import React from 'react';

const PresentationSlot = () => {
  return (
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
  );
};

export default PresentationSlot;
