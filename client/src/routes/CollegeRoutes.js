import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CollegeLayout from '../layouts/CollegeLayout';
import Dashboard from '../pages/College/Dashboard';
import PresentationRoutes from './PresentationRoutes';
// Import other college routes as needed

const CollegeRoutes = () => {
  return (
    <CollegeLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Bookings Section */}
        <Route path="/bookings/*" element={<PresentationRoutes />} />
        
        {/* Add other college routes as needed */}
      </Routes>
    </CollegeLayout>
  );
};

export default CollegeRoutes;
