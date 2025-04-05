import React from 'react';

const HostelMaintenance = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-dark-gray">Hostel Maintenance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-red">Hostel Administration</h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-2">Important Contacts</h4>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-red-light rounded-full p-3 h-12 w-12 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-medium">Chief Warden</h5>
                    <p className="text-sm text-medium-gray mb-1">Dr. Ravi Kumar</p>
                    <p className="text-sm text-medium-gray">Email: chief.warden@mahindra.edu</p>
                    <p className="text-sm text-medium-gray">Phone: +91 9876543210</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-red-light rounded-full p-3 h-12 w-12 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-medium">Boys Hostel Warden</h5>
                    <p className="text-sm text-medium-gray mb-1">Mr. Suresh Patel</p>
                    <p className="text-sm text-medium-gray">Email: boys.warden@mahindra.edu</p>
                    <p className="text-sm text-medium-gray">Phone: +91 9876543211</p>
                  </div>
                </div>
                
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
                    <p className="text-sm text-medium-gray">Phone: +91 9876543212</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-4">Maintenance Request</h4>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
                    <input type="text" id="name" className="w-full p-2 border border-light-gray rounded focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="room">Room Number</label>
                    <input type="text" id="room" className="w-full p-2 border border-light-gray rounded focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red" placeholder="e.g. A-101" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="issue">Issue Type</label>
                  <select id="issue" className="w-full p-2 border border-light-gray rounded focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red">
                    <option value="">Select an issue type</option>
                    <option value="electrical">Electrical Issue</option>
                    <option value="plumbing">Plumbing Issue</option>
                    <option value="furniture">Furniture Issue</option>
                    <option value="cleaning">Cleaning Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
                  <textarea id="description" rows="3" className="w-full p-2 border border-light-gray rounded focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red" placeholder="Please describe your issue in detail..."></textarea>
                </div>
                
                <div>
                  <button type="submit" className="btn-primary">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-red">Out Pass QR Code</h3>
            
            <div className="flex flex-col items-center justify-center">
              <div className="border-2 border-dashed border-light-gray p-4 rounded-lg mb-4">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://mahindra-university-outpass.com" 
                  alt="Outpass QR Code" 
                  className="w-48 h-48"
                />
              </div>
              
              <p className="text-center text-sm text-medium-gray mb-4">
                Scan this QR code to access the out pass application system for weekend leaves and holidays.
              </p>
              
              <button className="text-primary-red flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR Code
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-red">Hostel Guidelines</h3>
            
            <ul className="space-y-3 list-disc list-inside text-medium-gray">
              <li>Entry to hostel after 10:00 PM is not allowed</li>
              <li>Maintain silence in corridors and common areas</li>
              <li>Visitors are allowed only in designated areas</li>
              <li>Out passes are mandatory for weekend leaves</li>
              <li>Report maintenance issues promptly</li>
              <li>Keep your rooms and common areas clean</li>
              <li>Electrical appliances require prior permission</li>
            </ul>
            
            <div className="mt-4">
              <button className="text-primary-red hover:underline text-sm bg-transparent border-none cursor-pointer p-0">
                View Complete Hostel Rulebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HostelMaintenance;
