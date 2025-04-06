import React from 'react';
import { motion } from 'framer-motion';

const CollegeTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'general', label: 'Overview', icon: 'fas fa-university' },
    { id: 'news', label: 'News & Updates', icon: 'fas fa-newspaper' },
    { id: 'calendar', label: 'Academic Calendar', icon: 'fas fa-calendar-alt' },
    { id: 'bookings', label: 'Bookings', icon: 'fas fa-ticket-alt' },
    { id: 'hostel', label: 'Hostel Maintenance', icon: 'fas fa-home' },
    { id: 'map', label: 'Campus Map', icon: 'fas fa-map-marked-alt' }
  ];

  return (
    <div className="w-full">
      {/* Navigation container - centered with increased width and grey glass effect */}
      <div className="flex justify-center px-4">
        <div className="w-[95%] inline-flex justify-between bg-gray-200/70 backdrop-blur-md rounded-full p-2 shadow-lg border border-gray-100/50 overflow-x-auto scrollbar-hide relative">
          {/* Animated Background Indicator */}
          <motion.div
            className="absolute top-2 bottom-2 rounded-full bg-primary-red shadow-md"
            layoutId="activeTabIndicator"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            style={{
              width: `calc(100% / ${tabs.length} - 8px)`,
            }}
            initial={false}
            animate={{
              left: `calc(${tabs.findIndex(tab => tab.id === activeTab)} * (100% / ${tabs.length}) + 4px)`,
            }}
          />
          
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 flex-1 px-4 py-3 mx-1 rounded-full font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2.5 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-dark-gray hover:text-primary-red'
              }`}
              aria-pressed={activeTab === tab.id}
            >
              <i className={`${tab.icon} ${activeTab === tab.id ? '' : 'text-primary-red'}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollegeTabs;
