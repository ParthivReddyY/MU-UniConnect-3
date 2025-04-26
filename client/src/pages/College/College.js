import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import CollegeHeader from './components/CollegeHeader';
import CollegeTabs from './components/CollegeTabs';
import Overview from './components/Overview';
import NewsUpdates from './components/NewsUpdates';
import AcademicCalendar from './components/AcademicCalendar';
import Bookings from './components/Bookings';
import HostelMaintenance from './components/HostelMaintenance';
import CampusMap from './components/CampusMap';
import FacultyAppointment from './components/bookings/FacultyAppointment';
import PresentationSlot from './components/bookings/Presentations/PresentationSlot';
import HostPresentation from './components/bookings/Presentations/HostPresentation';

const College = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're on a booking sub-route
  const isBookingSubRoute = location.pathname.includes('/college/bookings/');

  useEffect(() => {
    // Get tab from URL
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get('tab');
    const newsId = searchParams.get('id');
    
    // If there's a news ID in the URL, ensure we're on the news tab
    if (newsId) {
      setActiveTab('news');
    }
    // Otherwise use the tab from URL if it's valid
    else if (tabFromUrl && ['general', 'news', 'calendar', 'bookings', 'hostel', 'map'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
    
    // Add scroll functionality - wait for content to load before scrolling
    setTimeout(() => {
      const contentArea = document.querySelector('.w-full.bg-white.rounded-xl');
      if (contentArea) {
        // Adjust scroll position to account for fixed header
        const yOffset = -200; // Adjust this value based on your header height
        const y = contentArea.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 650); // Set timeout slightly longer than the loading timeout (600ms)
    
    // Simulate loading content
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Create new URL with the selected tab
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tab);
    
    // If switching to a tab other than 'news', remove the news 'id' parameter
    if (tab !== 'news' && searchParams.has('id')) {
      searchParams.delete('id');
    }
    
    // Update the URL without reloading the page
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    }, { replace: true });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3, 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  // Render appropriate component based on active tab
  const renderContent = () => {
    if (isLoading) {
      return <TabSkeleton />;
    }

    // If we're on a booking sub-route, don't render the main tab content
    if (isBookingSubRoute) {
      return null;
    }

    switch (activeTab) {
      case 'general':
        return <Overview />;
      case 'news':
        return <NewsUpdates />;
      case 'calendar':
        return <AcademicCalendar />;
      case 'bookings':
        return <Bookings />;
      case 'hostel':
        return <HostelMaintenance />;
      case 'map':
        return <CampusMap />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Hero Section with parallax effect - only show on main routes */}
      {!isBookingSubRoute && <CollegeHeader />}

      {/* Content Section */}
      <div className={`w-full px-4 md:px-6 lg:px-8 py-6 md:py-8 ${!isBookingSubRoute ? "-mt-6" : ""} relative z-10`}>
        {/* Navigation Tabs - only show on main routes */}
        {!isBookingSubRoute && (
          <div className="w-full mx-auto mb-6">
            <CollegeTabs 
              activeTab={activeTab}
              setActiveTab={handleTabChange}
            />
          </div>
        )}
        
        {/* Main Content Area */}
        {isBookingSubRoute ? (
          <Routes>
            <Route path="bookings/faculty-appointment" element={<FacultyAppointment />} />
            <Route path="bookings/presentation-slot" element={<PresentationSlot />} />
            <Route path="bookings/host-presentation" element={<HostPresentation />} />
            {/* Add other booking-related routes here */}
            {/* Add other booking sub-routes here when they are implemented */}
          </Routes>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full bg-white rounded-xl shadow-md p-5 md:p-8"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

// Skeleton loader for tab content
const TabSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        <div className="h-32 bg-gray-200 rounded mb-6"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-4">
        <div className="h-48 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default College;
