import React from 'react';

const Overview = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-dark-gray">College Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-red">About Mahindra University</h3>
            <p className="mb-4 text-dark-gray">
              Mahindra University (MU) is a multi-disciplinary university that aims to educate future citizens for and of a better world. 
              MU is envisaged as a world-class academic institution that will foster the next generation of scientists, leaders, innovators 
              and entrepreneurs, to help solve the complex challenges of the 21st century.
            </p>
            <p className="mb-4 text-dark-gray">
              Set up as part of the Mahindra Educational Institutions (MEI), a not-for-profit subsidiary of Tech Mahindra, 
              Mahindra University is spread across a vibrant 130-acre campus in Hyderabad.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-red">Vision & Mission</h3>
            <p className="mb-2 font-medium">Vision:</p>
            <p className="mb-4 text-dark-gray">
              To be recognized globally for excellence in education and to nurture young minds to become future leaders and innovators.
            </p>
            <p className="mb-2 font-medium">Mission:</p>
            <p className="text-dark-gray">
              To provide world-class educational experience, foster research and development, and promote innovation and 
              entrepreneurship that addresses the needs of society.
            </p>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-red">Essential Information</h3>
            
            <div className="mb-4">
              <h4 className="font-medium mb-1">Address:</h4>
              <p className="text-dark-gray">Survey No: 62/1A, Bahadurpally, Jeedimetla, Hyderabad - 500043, Telangana, India</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-1">Contact:</h4>
              <p className="text-dark-gray">+91 40 6722 9999</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-1">Email:</h4>
              <p className="text-dark-gray">info@mahindrauniversity.edu.in</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Website:</h4>
              <a href="https://www.mahindrauniversity.edu.in" target="_blank" rel="noreferrer" className="text-primary-red hover:underline">
                www.mahindrauniversity.edu.in
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-red">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => window.location.href='/academic-calendar'} className="text-primary-teal hover:underline">Academic Calendar</button>
              </li>
              <li>
                <button onClick={() => window.location.href='/admission-process'} className="text-primary-teal hover:underline">Admission Process</button>
              </li>
              <li>
                <button onClick={() => window.location.href='/fee-structure'} className="text-primary-teal hover:underline">Fee Structure</button>
              </li>
              <li>
                <button onClick={() => window.location.href='/scholarships'} className="text-primary-teal hover:underline">Scholarships</button>
              </li>
              <li>
                <button onClick={() => window.location.href='/campus-facilities'} className="text-primary-teal hover:underline">Campus Facilities</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
