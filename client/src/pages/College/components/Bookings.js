import React from 'react';
import EventBooking from './bookings/EventBooking';
import FacultyAppointment from './bookings/FacultyAppointment';
import PresentationSlot from './bookings/PresentationSlot';
import ProjectSubmission from './bookings/ProjectSubmission';

const Bookings = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-dark-gray">Bookings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventBooking />
        <FacultyAppointment />
        <PresentationSlot />
        <ProjectSubmission />
      </div>
    </>
  );
};

export default Bookings;
