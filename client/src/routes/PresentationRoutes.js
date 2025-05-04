import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PresentationManagement from '../pages/College/components/bookings/Presentations/PresentationManagement';
import PresentationDetail from '../pages/College/components/bookings/Presentations/PresentationDetail';
import PresentationSlot from '../pages/College/components/bookings/Presentations/PresentationSlot';
import HostPresentation from '../pages/College/components/bookings/Presentations/HostPresentation';
import SlotDetailPage from '../pages/College/components/bookings/Presentations/SlotDetailPage';
import MyBookings from '../pages/College/components/bookings/Presentations/MyBookings';

const PresentationRoutes = () => {
  return (
    <Routes>
      <Route path="/manage-presentations" element={<PresentationManagement />} />
      <Route path="/presentation/:id/details" element={<PresentationDetail />} />
      <Route path="/presentation/:id/edit" element={<PresentationDetail isEditMode={true} />} />
      <Route path="/presentation/:presentationId/slot/:slotId" element={<SlotDetailPage />} />
      <Route path="/host-presentation" element={<HostPresentation />} />
      <Route path="/book-presentation" element={<PresentationSlot />} />
      <Route path="/my-bookings" element={<MyBookings />} />
    </Routes>
  );
};

export default PresentationRoutes;
