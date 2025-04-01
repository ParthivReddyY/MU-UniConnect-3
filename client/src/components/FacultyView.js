import React, { useState, useEffect, useRef, useMemo } from 'react';
import { renderHTML } from '../utils/editorUtils';
import ScrollProgress from './ScrollProgress';

const FacultyView = ({ faculty }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [visibleSections, setVisibleSections] = useState({});
  
  // Create individual refs
  const overviewRef = useRef(null);
  const educationRef = useRef(null);
  const workExperienceRef = useRef(null);
  const publicationsRef = useRef(null);
  const researchRef = useRef(null);
  const projectsRef = useRef(null);
  const contactRef = useRef(null);
  
  // Create a stable object with refs using useMemo
  const sectionRefs = useMemo(() => ({
    overview: overviewRef,
    education: educationRef,
    workExperience: workExperienceRef,
    publications: publicationsRef,
    research: researchRef,
    projects: projectsRef,
    contact: contactRef
  }), []);
  
  // Provide a reliable inline SVG fallback
  const inlineSVGFallback = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23c0c0c0'/%3E%3Cpath d='M30,80 Q50,60 70,80' fill='%23c0c0c0'/%3E%3C/svg%3E`;
  
  // For tracking scroll position and active section
  const observerRef = useRef(null);
  
  // Animate entrance when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById('faculty-view-container');
      if (container) {
        container.classList.add('opacity-100');
        container.classList.remove('opacity-0', 'translate-y-5');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Set up intersection observer for section scrolling
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-5% 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('section-', '');
          setActiveSection(id);
          
          // Update URL hash without scrolling
          const url = new URL(window.location);
          url.hash = id;
          window.history.replaceState({}, '', url);
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, options);
    
    // Observe all sections
    Object.keys(sectionRefs).forEach(section => {
      if (sectionRefs[section].current) {
        observerRef.current.observe(sectionRefs[section].current);
      }
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sectionRefs]);
  
  // Set up visibility observer for section animations
  useEffect(() => {
    const visibilityOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const visibilityCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('section-', '');
          // Add the section to visible sections for animations
          setVisibleSections(prev => ({
            ...prev,
            [id]: true
          }));
        }
      });
    };

    const visibilityObserver = new IntersectionObserver(visibilityCallback, visibilityOptions);
    
    // Observe all sections for visibility
    Object.keys(sectionRefs).forEach(section => {
      if (sectionRefs[section].current) {
        visibilityObserver.observe(sectionRefs[section].current);
      }
    });
    
    return () => {
      if (visibilityObserver) {
        visibilityObserver.disconnect();
      }
    };
  }, [sectionRefs]);
  
  // Scroll to section when hash changes or on initial load
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && sectionRefs[hash]?.current) {
      setTimeout(() => {
        sectionRefs[hash].current.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [sectionRefs]);
  
  // Scroll to section when nav item is clicked
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionRefs[sectionId]?.current) {
      sectionRefs[sectionId].current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Function to determine department color
  const getDepartmentColor = (department) => {
    switch(department) {
      case 'ECSE': return { bg: '#1e3a8a', light: 'rgba(30, 58, 138, 0.1)' };
      case 'SOM': return { bg: '#047857', light: 'rgba(4, 120, 87, 0.1)' };
      case 'SOL': return { bg: '#7e22ce', light: 'rgba(126, 34, 206, 0.1)' };
      case 'IMSOE': return { bg: '#0369a1', light: 'rgba(3, 105, 161, 0.1)' };
      case 'SDMC': return { bg: '#be123c', light: 'rgba(190, 18, 60, 0.1)' };
      case 'SODI': return { bg: '#84cc16', light: 'rgba(132, 204, 22, 0.1)' };
      case 'SOHM': return { bg: '#ea580c', light: 'rgba(234, 88, 12, 0.1)' };
      case 'CEI': return { bg: '#9333ea', light: 'rgba(147, 51, 234, 0.1)' };
      default: return { bg: '#475569', light: 'rgba(71, 85, 105, 0.1)' };
    }
  };
  
  // Check if a section has content
  const hasContent = (field) => {
    return faculty[field] && faculty[field].trim() !== '';
  };
  
  // Check if a section should be displayed
  const shouldDisplaySection = (sectionId) => {
    switch(sectionId) {
      case 'overview':
        return hasContent('overview');
      case 'education':
        return hasContent('education');
      case 'workExperience':
        return hasContent('workExperience');
      case 'publications':
        return hasContent('publications');
      case 'research':
        return hasContent('research');
      case 'projects':
        return faculty.projects && faculty.projects.length > 0;
      case 'contact':
        return true; // Always show contact section
      default:
        return false;
    }
  };
  
  const deptColor = getDepartmentColor(faculty.department);
  
  // Define sections for navigation
  const sections = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-user' },
    { id: 'education', label: 'Education', icon: 'fas fa-graduation-cap' },
    { id: 'workExperience', label: 'Experience', icon: 'fas fa-briefcase' },
    { id: 'publications', label: 'Publications', icon: 'fas fa-book' },
    { id: 'research', label: 'Research', icon: 'fas fa-flask' },
    { id: 'projects', label: 'Projects', icon: 'fas fa-tasks' },
    { id: 'contact', label: 'Contact', icon: 'fas fa-address-card' }
  ].filter(section => shouldDisplaySection(section.id));
  
  return (
    <>
      <ScrollProgress />
      <div 
        id="faculty-view-container"
        className="bg-white shadow-md rounded-lg overflow-hidden w-full opacity-0 translate-y-5 transition-all duration-500 ease-out"
      >
        {/* Professional header section - enhanced with gradient and refined layout */}
        <div className="relative">
          {/* Background header banner with gradient */}
          <div 
            className="h-48 bg-gradient-to-r relative overflow-hidden" 
            style={{
              background: `linear-gradient(to right, ${deptColor.bg}99, ${deptColor.bg})`
            }}
          >
            {/* Abstract pattern overlay */}
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
            
            {/* Faculty name overlay for mobile */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent md:hidden">
              <h1 className="text-2xl font-bold text-white">{faculty.name}</h1>
              <p className="text-white/90">{faculty.designation}</p>
            </div>
          </div>
          
          {/* Profile image and basic info container */}
          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col md:flex-row">
              {/* Profile image - with animation and enhanced shadow */}
              <div className="md:w-1/4 -mt-16 md:ml-10">
                <div 
                  className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <img 
                    src={faculty.image || "/img/default-faculty.png"} 
                    alt={faculty.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {e.target.src = inlineSVGFallback}}
                    onLoad={() => setIsImageLoaded(true)}
                  />
                </div>
              </div>
              
              {/* Faculty name and designation - enhanced styling */}
              <div className="md:w-3/4 pt-4 md:-mt-16 md:pt-0 md:pl-8">
                <div className="bg-white md:bg-transparent md:pt-20 p-4 md:p-0 rounded-lg shadow-md md:shadow-none">
                  <h1 className="text-3xl font-bold text-gray-900 hidden md:block">{faculty.name}</h1>
                  <div className="flex flex-wrap items-center mt-1">
                    <span 
                      className="text-xl font-semibold hidden md:block"
                      style={{ color: deptColor.bg }}
                    >
                      {faculty.designation}
                    </span>
                    <span className="mx-2 text-gray-400 hidden md:block">•</span>
                    <span 
                      className="text-gray-700 hidden md:block py-1 px-3 rounded-full text-sm"
                      style={{ backgroundColor: deptColor.light }}
                    >
                      {faculty.department}
                    </span>
                  </div>
                  
                  {/* Contact buttons row - enhanced styling with gradients */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {faculty.email && (
                      <a 
                        href={`mailto:${faculty.email}`} 
                        className="flex items-center px-3 py-1.5 rounded-full hover:shadow-md transition-all"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}
                      >
                        <i className="fas fa-envelope mr-2"></i>
                        <span className="text-sm">{faculty.email}</span>
                      </a>
                    )}
                    
                    {faculty.mobileNumber && (
                      <a 
                        href={`tel:${faculty.mobileNumber}`} 
                        className="flex items-center px-3 py-1.5 rounded-full hover:shadow-md transition-all"
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
                      >
                        <i className="fas fa-phone-alt mr-2"></i>
                        <span className="text-sm">{faculty.mobileNumber}</span>
                      </a>
                    )}
                    
                    {faculty.cabinLocation && (
                      <div 
                        className="flex items-center px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}
                      >
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        <span className="text-sm">{faculty.cabinLocation}</span>
                      </div>
                    )}
                    
                    {faculty.freeTimings && (
                      <div 
                        className="flex items-center px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed' }}
                      >
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
        
        {/* Main content area with sidebar navigation */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row">
            {/* Section navigation sidebar */}
            <div className="lg:w-1/4 mb-8 lg:mb-0 lg:pr-8">
              <div className="section-nav bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100 lg:sticky lg:top-24">
                <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200 text-gray-700">
                  Profile Sections
                </h2>
                <nav className="flex flex-col space-y-1">
                  {sections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`section-nav-item text-left px-4 py-2.5 rounded flex items-center transition-colors hover:bg-gray-100 ${
                        activeSection === section.id ? 'active font-medium' : 'text-gray-600'
                      }`}
                    >
                      <i className={`${section.icon} w-5 mr-3 text-center`}></i>
                      {section.label}
                    </button>
                  ))}
                </nav>

                {/* Contact information in sidebar for quick access */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                    Quick Contact
                  </h3>
                  
                  {faculty.email && (
                    <div className="mb-3">
                      <a 
                        href={`mailto:${faculty.email}`} 
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <i className="fas fa-envelope mr-2 text-blue-500"></i>
                        <span className="text-sm truncate">{faculty.email}</span>
                      </a>
                    </div>
                  )}
                  
                  {faculty.mobileNumber && (
                    <div className="mb-3">
                      <a 
                        href={`tel:${faculty.mobileNumber}`} 
                        className="flex items-center text-green-600 hover:text-green-800 transition-colors"
                      >
                        <i className="fas fa-phone-alt mr-2 text-green-500"></i>
                        <span className="text-sm">{faculty.mobileNumber}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Main content sections */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-lg shadow p-6">
                {/* Overview Section */}
                {hasContent('overview') && (
                  <section 
                    id="section-overview" 
                    ref={sectionRefs.overview}
                    className="mb-10 scroll-mt-24"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                      <i className="fas fa-user-circle text-primary-red mr-3"></i>
                      Faculty Overview
                    </h2>
                    <div className={`section-content prose max-w-none ql-content ${visibleSections.overview ? 'animate-fadeIn' : ''}`} 
                      dangerouslySetInnerHTML={renderHTML(faculty.overview)}>
                    </div>
                  </section>
                )}
                
                {/* Education Section */}
                {hasContent('education') && (
                  <section 
                    id="section-education" 
                    ref={sectionRefs.education}
                    className="mb-10 scroll-mt-24"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                      <i className="fas fa-graduation-cap text-primary-red mr-3"></i>
                      Education
                    </h2>
                    <div className={`section-content prose max-w-none ql-content ${visibleSections.education ? 'animate-fadeIn' : ''}`}
                      dangerouslySetInnerHTML={renderHTML(faculty.education)}>
                    </div>
                  </section>
                )}
                
                {/* Work Experience Section */}
                {hasContent('workExperience') && (
                  <section 
                    id="section-workExperience" 
                    ref={sectionRefs.workExperience}
                    className="mb-10 scroll-mt-24"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                      <i className="fas fa-briefcase text-primary-red mr-3"></i>
                      Work Experience
                    </h2>
                    <div className={`section-content prose max-w-none ql-content ${visibleSections.workExperience ? 'animate-fadeIn' : ''}`}
                      dangerouslySetInnerHTML={renderHTML(faculty.workExperience)}>
                    </div>
                  </section>
                )}
                
                {/* Publications Section */}
                {hasContent('publications') && (
                  <section 
                    id="section-publications" 
                    ref={sectionRefs.publications}
                    className="mb-10 scroll-mt-24"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                      <i className="fas fa-scroll text-primary-red mr-3"></i>
                      Academic Publications
                    </h2>
                    <div className={`section-content prose max-w-none ql-content ${visibleSections.publications ? 'animate-fadeIn' : ''}`}
                      dangerouslySetInnerHTML={renderHTML(faculty.publications)}>
                    </div>
                  </section>
                )}
                
                {/* Research Interests Section */}
                {hasContent('research') && (
                  <section 
                    id="section-research" 
                    ref={sectionRefs.research}
                    className="mb-10 scroll-mt-24"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                      <i className="fas fa-flask text-primary-red mr-3"></i>
                      Research Interests
                    </h2>
                    <div className={`section-content prose max-w-none ql-content ${visibleSections.research ? 'animate-fadeIn' : ''}`}
                      dangerouslySetInnerHTML={renderHTML(faculty.research)}>
                    </div>
                  </section>
                )}
                
                {/* Projects Section */}
                {faculty.projects && faculty.projects.length > 0 && (
                  <section 
                    id="section-projects" 
                    ref={sectionRefs.projects}
                    className="mb-10 scroll-mt-24"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                      <i className="fas fa-project-diagram text-primary-red mr-3"></i>
                      Research Projects
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {faculty.projects.map((project, index) => (
                        <div 
                          key={index} 
                          className={`bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group ${visibleSections.projects ? 'animate-fadeIn' : ''}`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {/* Colored accent based on status */}
                          <div 
                            className="absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2" 
                            style={{
                              backgroundColor: project.status === 'Completed' ? '#10b981' :
                                project.status === 'In Progress' ? '#3b82f6' :
                                project.status === 'On Hold' ? '#f59e0b' : '#6b7280'
                            }}
                          ></div>
                          
                          <div className="ml-3">
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
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                
                {/* Contact Section */}
                <section 
                  id="section-contact" 
                  ref={sectionRefs.contact}
                  className="scroll-mt-24"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                    <i className="fas fa-id-card text-primary-red mr-3"></i>
                    Contact Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-100 ${visibleSections.contact ? 'animate-fadeIn' : ''}`}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect with {faculty.name.split(' ')[0]}</h3>
                      
                      {faculty.emails && faculty.emails.length > 0 && (
                        <div className="mb-5">
                          <p className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Email Addresses:</p>
                          {faculty.emails.map((email, idx) => (
                            <div key={idx} className="flex items-center py-2 group">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                                <i className="fas fa-envelope text-blue-500"></i>
                              </div>
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
                          <div className="flex items-center py-2 group">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3 group-hover:bg-green-100 transition-colors">
                              <i className="fas fa-phone-alt text-green-500"></i>
                            </div>
                            <a href={`tel:${faculty.mobileNumber}`} className="text-blue-600 hover:underline">
                              {faculty.mobileNumber}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-100 ${visibleSections.contact ? 'animate-fadeIn' : ''}`} style={{ animationDelay: '150ms' }}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Office Information</h3>
                      
                      {faculty.cabinLocation && (
                        <div className="mb-5">
                          <p className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Office Location:</p>
                          <div className="flex items-center py-2 group">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-3 group-hover:bg-amber-100 transition-colors">
                              <i className="fas fa-map-marker-alt text-amber-500"></i>
                            </div>
                            <span>{faculty.cabinLocation}</span>
                          </div>
                        </div>
                      )}
                      
                      {faculty.freeTimings && (
                        <div className="mb-5">
                          <p className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Office Hours:</p>
                          <div className="flex items-center py-2 group">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-3 group-hover:bg-purple-100 transition-colors">
                              <i className="fas fa-clock text-purple-500"></i>
                            </div>
                            <span>{faculty.freeTimings}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
              
              {/* Floating back to top button */}
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 right-8 bg-primary-red text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-colors z-20 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                aria-label="Back to top"
                title="Back to top"
              >
                <i className="fas fa-arrow-up"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FacultyView;
