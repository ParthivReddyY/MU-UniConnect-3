import React from 'react';

const HostelMaintenance = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-dark-gray">Hostel Contact Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Boys Hostel Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-primary-red">Boys Hostel Contacts</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="bg-red-light rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium">Phase Wardens</h5>
                <p className="text-sm text-medium-gray mb-1">Phase I Warden (2019 Batch): <a href="tel:9550278690" className="text-primary-red hover:underline">9550278690</a></p>
                <p className="text-sm text-medium-gray mb-1">Phase II Warden (2020 Batch): <a href="tel:9963477263" className="text-primary-red hover:underline">9963477263</a></p>
                <p className="text-sm text-medium-gray">Phase II Warden (2022 Batch): <a href="tel:9100947891" className="text-primary-red hover:underline">9100947891</a></p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-red-light rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium">Boys Hostel Maintenance</h5>
                <p className="text-sm text-medium-gray mb-1">Maintenance Team</p>
                <p className="text-sm text-medium-gray mb-1">Phase I & II Maintenance: <a href="tel:9154776199" className="text-primary-red hover:underline">9154776199</a></p>
                <p className="text-sm text-medium-gray mb-1">Phase II HK Chandra Kishore: <a href="tel:9963106953" className="text-primary-red hover:underline">9963106953</a></p>
                <p className="text-sm text-medium-gray mb-1">Phase I HK Vinod: <a href="tel:9963022499" className="text-primary-red hover:underline">9963022499</a></p>
                <p className="text-sm text-medium-gray">Phase II HK Boy Saailu: <a href="tel:8309134307" className="text-primary-red hover:underline">8309134307</a></p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Girls Hostel Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-primary-red">Girls Hostel Contacts</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="bg-red-light rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium">Girls Hostel Warden</h5>
                <p className="text-sm text-medium-gray mb-1">Dr. Priya Sharma</p>
                <p className="text-sm text-medium-gray">Email: girls.warden@mahindra.edu</p>
                <p className="text-sm text-medium-gray">Phone: <a href="tel:+919876543212" className="text-primary-red hover:underline">+91 9876543212</a></p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-red-light rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium">Girls Hostel Office</h5>
                <p className="text-sm text-medium-gray mb-1">Administrative Staff</p>
                <p className="text-sm text-medium-gray">Email: girls.hostel@mahindra.edu</p>
                <p className="text-sm text-medium-gray">Phone: <a href="tel:+919876543214" className="text-primary-red hover:underline">+91 9876543214</a></p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-red-light rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium">Girls Hostel Maintenance</h5>
                <p className="text-sm text-medium-gray mb-1">Maintenance Team</p>
                <p className="text-sm text-medium-gray">Email: girls.maintenance@mahindra.edu</p>
                <p className="text-sm text-medium-gray">Phone: <a href="tel:+919876543216" className="text-primary-red hover:underline">+91 9876543216</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* MEC Security Contacts Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-primary-red">MEC Security Contacts</h3>
          
          <div className="flex gap-4 items-start">
            <div className="bg-red-light rounded-full p-3 h-12 w-12 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <p className="text-sm text-medium-gray font-medium">Major General Sukesh Rakshit Sir:</p>
                <p className="text-sm text-medium-gray"><a href="tel:7075098502" className="text-primary-red hover:underline">7075098502</a></p>
                <p className="text-sm text-medium-gray font-medium">MEC Main Gate:</p>
                <p className="text-sm text-medium-gray"><a href="tel:4044333538" className="text-primary-red hover:underline">4044333538</a></p>
                <p className="text-sm text-medium-gray font-medium">General Email:</p>
                <p className="text-sm text-medium-gray">
                  <a href="mailto:hostelcom@mahindrauniversity.edu.in" className="text-primary-red hover:underline">hostelcom@mahindrauniversity.edu.in</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cafeteria Supervisors Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-primary-red">Cafeteria Supervisors</h3>
          
          <div className="flex gap-4 items-start">
            <div className="bg-red-light rounded-full p-3 h-12 w-12 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
              </svg>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <p className="text-sm text-medium-gray font-medium">Ramana:</p>
                <p className="text-sm text-medium-gray"><a href="tel:9704208287" className="text-primary-red hover:underline">9704208287</a></p>
                <p className="text-sm text-medium-gray font-medium">Ismail:</p>
                <p className="text-sm text-medium-gray"><a href="tel:9000418541" className="text-primary-red hover:underline">9000418541</a></p>
                <p className="text-sm text-medium-gray font-medium">Sagar:</p>
                <p className="text-sm text-medium-gray"><a href="tel:9493272650" className="text-primary-red hover:underline">9493272650</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Outpass QR Code System Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-dark-gray">Hostel Outpass System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Outpass Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-red">Outpass Information</h3>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium">Hostel In-Time</h5>
                <p className="text-sm text-medium-gray mb-2">Campus Entry: 10:30 PM</p>
                <p className="text-sm text-medium-gray mb-2">Boys Hostel: 11:30 PM</p>
                <p className="text-sm text-medium-gray mb-2">Girls Hostel: 11:30 PM</p>
                <p className="text-sm text-medium-gray mb-2">Late entries require prior permission from hostel warden</p>
                <p className="text-sm text-medium-gray">Three late entries in a month may result in disciplinary action</p>
              </div>
              <div>
                <h5 className="font-medium">Class Hour Restrictions</h5>
                <p className="text-sm text-medium-gray mb-2">Outpass is not permitted during class hours (8:30 AM - 4:30 PM)</p>
                <p className="text-sm text-medium-gray mb-2">Medical emergencies require proper documentation</p>
                <p className="text-sm text-medium-gray">Special permissions need approval from both HOD and Hostel Warden</p>
              </div>
            </div>
          </div>
          {/* QR Code Scanner */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-red">QR Code System</h3>
            <div className="space-y-4">
              <div className="mt-4">
                <h5 className="font-medium mb-3">Scan Your Outpass QR</h5>
                <div className="flex flex-col items-center">
                  <img 
                    src="https://res.cloudinary.com/dmny4ymqp/image/upload/v1746018300/URL_QR_Code_tkqfmx.png" 
                    alt="Outpass QR Code" 
                    className="w-[280px] h-[280px] object-contain mb-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HostelMaintenance;
