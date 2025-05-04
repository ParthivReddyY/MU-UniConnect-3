import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PresentationCreationForm from '../pages/College/components/bookings/Presentations/PresentationCreationForm';
import PresentationManagement from '../pages/College/components/bookings/Presentations/PresentationManagement';
import PresentationSlot from '../pages/College/components/bookings/Presentations/PresentationSlot';
import PresentationGrading from '../pages/College/components/bookings/Presentations/PresentationGrading';
import MyBookings from '../pages/College/components/bookings/Presentations/MyBookings';
import { PrivateRoute } from './PrivateRoute';

const PresentationRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute />}>
        <Route path="/create" element={<PresentationCreationForm />} />
        <Route path="/manage" element={<PresentationManagement />} />
        <Route path="/book" element={<PresentationSlot />} />
        <Route path="/grade/:presentationId/:slotId" element={<PresentationGrading />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Route>
    </Routes>
  );
};

export default PresentationRoutes;
