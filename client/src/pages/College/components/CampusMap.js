import React from 'react';

const CampusMap = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-dark-gray">Campus Map</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3804.6868973748017!2d78.46518641487767!3d17.52010188798941!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb8f06a32e370d%3A0x3fe9488380d0f5a6!2sMahindra%20University!5e0!3m2!1sen!2sin!4v1634125505246!5m2!1sen!2sin"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Mahindra University Map"
          ></iframe>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-primary-red">Getting Here</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="bg-red-light rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Address</h4>
                <p className="text-sm text-medium-gray">
                  Survey No: 62/1A, Bahadurpally, Jeedimetla, Hyderabad - 500043, Telangana, India
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-red-light rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Distance from Key Locations</h4>
                <ul className="list-disc list-inside text-sm text-medium-gray pl-2">
                  <li>Rajiv Gandhi International Airport - 45 km</li>
                  <li>Secunderabad Railway Station - 18 km</li>
                  <li>Hyderabad Central Bus Station - 22 km</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-red-light rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Transportation Options</h4>
                <ul className="list-disc list-inside text-sm text-medium-gray pl-2">
                  <li>College Shuttle Service from key locations</li>
                  <li>Public Bus Routes: 235, 289, 345</li>
                  <li>App-based cab services available</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-primary-red">Campus Buildings</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-light-gray">
              <span className="font-medium">Academic Block A</span>
              <span className="text-sm text-primary-red">Engineering Departments</span>
            </div>
            
            <div className="flex items-center justify-between pb-2 border-b border-light-gray">
              <span className="font-medium">Academic Block B</span>
              <span className="text-sm text-primary-red">Business School</span>
            </div>
            
            <div className="flex items-center justify-between pb-2 border-b border-light-gray">
              <span className="font-medium">Central Library</span>
              <span className="text-sm text-primary-red">24/7 Facility</span>
            </div>
            
            <div className="flex items-center justify-between pb-2 border-b border-light-gray">
              <span className="font-medium">Research Center</span>
              <span className="text-sm text-primary-red">Innovation Hub</span>
            </div>
            
            <div className="flex items-center justify-between pb-2 border-b border-light-gray">
              <span className="font-medium">Boys Hostel</span>
              <span className="text-sm text-primary-red">Blocks 1-4</span>
            </div>
            
            <div className="flex items-center justify-between pb-2 border-b border-light-gray">
              <span className="font-medium">Girls Hostel</span>
              <span className="text-sm text-primary-red">Blocks 5-6</span>
            </div>
            
            <div className="flex items-center justify-between pb-2 border-b border-light-gray">
              <span className="font-medium">Sports Complex</span>
              <span className="text-sm text-primary-red">Multi-facility</span>
            </div>
            
            <div className="flex items-center justify-between pb-2 border-b border-light-gray">
              <span className="font-medium">Central Canteen</span>
              <span className="text-sm text-primary-red">Food Court</span>
            </div>
          </div>
          
          <div className="mt-4">
            <button type="button" className="text-primary-red hover:underline text-sm flex items-center cursor-pointer bg-transparent border-none p-0">
              Download Campus Map PDF
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CampusMap;
