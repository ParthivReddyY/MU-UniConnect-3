import React, { useState } from 'react';

const FacultyView = ({ faculty }) => {
  const [activeTab, setActiveTab] = useState('basic');
  
  // Render HTML content safely
  const renderHTML = (content) => {
    return { __html: content || '<p>No information provided.</p>' };
  };
  
  // Provide a reliable inline SVG fallback
  const inlineSVGFallback = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23c0c0c0'/%3E%3Cpath d='M30,80 Q50,60 70,80' fill='%23c0c0c0'/%3E%3C/svg%3E`;
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden w-full">
      {/* Professional header section */}
      <div className="relative">
        {/* Background header banner with gradient */}
        <div className="h-48 bg-gradient-to-r from-gray-700 via-gray-800 to-primary-red"></div>
        
        {/* Profile image and basic info container */}
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row">
            {/* Profile image */}
            <div className="md:w-1/4 -mt-20 md:ml-10">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                <img 
                  src={faculty.image || "/img/default-faculty.png"} 
                  alt={faculty.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {e.target.src = inlineSVGFallback}}
                />
              </div>
            </div>
            
            {/* Faculty name and designation */}
            <div className="md:w-3/4 pt-4 md:-mt-16 md:pt-0 md:pl-8">
              <div className="bg-white md:bg-transparent md:pt-20 p-4 md:p-0 rounded-lg shadow-md md:shadow-none">
                <h1 className="text-3xl font-bold text-gray-900">{faculty.name}</h1>
                <div className="flex flex-wrap items-center mt-1">
                  <span className="text-xl font-semibold text-primary-red">{faculty.designation}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-700">{faculty.department}</span>
                </div>
                
                {/* Contact buttons row */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {faculty.email && (
                    <a 
                      href={`mailto:${faculty.email}`} 
                      className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <i className="fas fa-envelope mr-2"></i>
                      <span className="text-sm">Email</span>
                    </a>
                  )}
                  
                  {faculty.mobileNumber && (
                    <a 
                      href={`tel:${faculty.mobileNumber}`} 
                      className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                    >
                      <i className="fas fa-phone-alt mr-2"></i>
                      <span className="text-sm">Call</span>
                    </a>
                  )}
                  
                  {faculty.cabinLocation && (
                    <div className="flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      <span className="text-sm">{faculty.cabinLocation}</span>
                    </div>
                  )}
                  
                  {faculty.freeTimings && (
                    <div className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full">
                      <i className="fas fa-clock mr-2"></i>
                      <span className="text-sm">{faculty.freeTimings}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200 mt-6">
        <div className="container mx-auto px-4">
          <nav className="flex flex-wrap -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'basic'
                  ? 'border-primary-red text-primary-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-user mr-2"></i> Overview
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'education'
                  ? 'border-primary-red text-primary-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-graduation-cap mr-2"></i> Education & Experience
            </button>
            <button
              onClick={() => setActiveTab('publications')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'publications'
                  ? 'border-primary-red text-primary-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-book mr-2"></i> Publications & Research
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'projects'
                  ? 'border-primary-red text-primary-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-tasks mr-2"></i> Projects
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'contact'
                  ? 'border-primary-red text-primary-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-address-card mr-2"></i> Contact
            </button>
          </nav>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Faculty Overview
              </h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={renderHTML(faculty.overview)}></div>
            </div>
          </div>
        </div>
        
        {/* Education & Experience Tab */}
        <div className={activeTab === 'education' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                <i className="fas fa-graduation-cap text-primary-red mr-2"></i>
                Education
              </h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={renderHTML(faculty.education)}></div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                <i className="fas fa-briefcase text-primary-red mr-2"></i>
                Work Experience
              </h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={renderHTML(faculty.workExperience)}></div>
            </div>
          </div>
        </div>
        
        {/* Publications & Research Tab */}
        <div className={activeTab === 'publications' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                <i className="fas fa-scroll text-primary-red mr-2"></i>
                Academic Publications
              </h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={renderHTML(faculty.publications)}></div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                <i className="fas fa-flask text-primary-red mr-2"></i>
                Research Interests
              </h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={renderHTML(faculty.research)}></div>
            </div>
          </div>
        </div>
        
        {/* Projects Tab */}
        <div className={activeTab === 'projects' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
              <i className="fas fa-project-diagram text-primary-red mr-2"></i>
              Research Projects
            </h2>
            
            {faculty.projects && faculty.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faculty.projects.map((project, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{project.description}</p>
                    
                    {project.timeline && (
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <i className="far fa-calendar-alt mr-2"></i>
                        <span>{project.timeline}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <i className="fas fa-file-alt text-gray-400 text-4xl mb-3"></i>
                <p className="text-gray-500">No projects currently listed.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Contact Tab */}
        <div className={activeTab === 'contact' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
              <i className="fas fa-id-card text-primary-red mr-2"></i>
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect with {faculty.name.split(' ')[0]}</h3>
                
                {faculty.emails && faculty.emails.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Email Addresses:</p>
                    {faculty.emails.map((email, idx) => (
                      <div key={idx} className="flex items-center py-2">
                        <i className="fas fa-envelope text-primary-red mr-3"></i>
                        <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                          {email}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                
                {faculty.mobileNumber && (
                  <div className="mb-5">
                    <p className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Phone:</p>
                    <div className="flex items-center py-2">
                      <i className="fas fa-phone-alt text-primary-red mr-3"></i>
                      <a href={`tel:${faculty.mobileNumber}`} className="text-blue-600 hover:underline">
                        {faculty.mobileNumber}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Office Information</h3>
                
                {faculty.cabinLocation && (
                  <div className="mb-5">
                    <p className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Office Location:</p>
                    <div className="flex items-center py-2">
                      <i className="fas fa-map-marker-alt text-primary-red mr-3"></i>
                      <span>{faculty.cabinLocation}</span>
                    </div>
                  </div>
                )}
                
                {faculty.freeTimings && (
                  <div className="mb-5">
                    <p className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Office Hours:</p>
                    <div className="flex items-center py-2">
                      <i className="fas fa-clock text-primary-red mr-3"></i>
                      <span>{faculty.freeTimings}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyView;
