import React, { useState } from 'react';
import CollegeHeader from './components/CollegeHeader';
import CollegeTabs from './components/CollegeTabs';
import Overview from './components/Overview';
import NewsUpdates from './components/NewsUpdates';
import AcademicCalendar from './components/AcademicCalendar';
import Bookings from './components/Bookings';
import HostelMaintenance from './components/HostelMaintenance';
import CampusMap from './components/CampusMap';

const College = () => {
  const [activeTab, setActiveTab] = useState('general');

  // Render the appropriate component based on the active tab
  const renderTabContent = () => {
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
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <CollegeHeader />

      {/* Content Section */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <CollegeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Tab Content */}
        <div className="max-w-7xl mx-auto animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default College;
