import React from 'react';

const CollegeTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sticky top-16 md:top-20 z-20 -mx-4 md:-mx-6 lg:-mx-8 mb-8">
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-light-gray px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative">
          {/* Tab container with overflow for mobile */}
          <div className="flex overflow-x-auto scrollbar-hide py-3 gap-2 md:gap-6 items-center justify-center">
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-all relative ${activeTab === 'general' ? 'text-primary-red' : 'text-medium-gray hover:text-dark-gray'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Overview
              {activeTab === 'general' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-red rounded-full transform animate-fadeIn"></span>}
            </button>
            
            <button 
              onClick={() => setActiveTab('news')}
              className={`flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-all relative ${activeTab === 'news' ? 'text-primary-red' : 'text-medium-gray hover:text-dark-gray'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              News & Updates
              {activeTab === 'news' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-red rounded-full transform animate-fadeIn"></span>}
            </button>
            
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-all relative ${activeTab === 'calendar' ? 'text-primary-red' : 'text-medium-gray hover:text-dark-gray'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Academic Calendar
              {activeTab === 'calendar' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-red rounded-full transform animate-fadeIn"></span>}
            </button>
            
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-all relative ${activeTab === 'bookings' ? 'text-primary-red' : 'text-medium-gray hover:text-dark-gray'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Bookings
              {activeTab === 'bookings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-red rounded-full transform animate-fadeIn"></span>}
            </button>
            
            <button 
              onClick={() => setActiveTab('hostel')}
              className={`flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-all relative ${activeTab === 'hostel' ? 'text-primary-red' : 'text-medium-gray hover:text-dark-gray'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Hostel
              {activeTab === 'hostel' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-red rounded-full transform animate-fadeIn"></span>}
            </button>
            
            <button 
              onClick={() => setActiveTab('map')}
              className={`flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-all relative ${activeTab === 'map' ? 'text-primary-red' : 'text-medium-gray hover:text-dark-gray'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Campus Map
              {activeTab === 'map' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-red rounded-full transform animate-fadeIn"></span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeTabs;
