import React, { useState, useEffect, useRef, useMemo } from 'react';
import { renderHTML } from '../utils/editorUtils';
import ScrollProgress from './ScrollProgress';
import { Link } from 'react-router-dom';

const FacultyView = ({ faculty, onBack, onEdit, onDelete }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileNav, setShowMobileNav] = useState(false);
  // Add new state for project tabs
  const [projectTab, setProjectTab] = useState('ongoing');
  
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
  const sectionNavRef = useRef(null);
  
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
          setActiveTab(id);
          
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
  
  // Scroll to section when hash changes or when tab is clicked
  const scrollToSection = (sectionId) => {
    if (sectionRefs[sectionId]?.current) {
      sectionRefs[sectionId].current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setActiveTab(sectionId);
      // Hide mobile nav after clicking
      setShowMobileNav(false);
    }
  };
  
  // Handle scroll event to make section nav sticky
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
      
      // Make section nav sticky after hero section
      const heroSection = document.getElementById('faculty-hero');
      if (heroSection && sectionNavRef.current) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight - 100;
        
        if (window.scrollY > heroBottom) {
          sectionNavRef.current.classList.add('sticky-nav');
          sectionNavRef.current.classList.add('shadow-md');
        } else {
          sectionNavRef.current.classList.remove('sticky-nav');
          sectionNavRef.current.classList.remove('shadow-md');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if a section has content
  const hasContent = (field) => {
    return faculty[field] && faculty[field].trim() !== '';
  };
  
  // Get available content sections
  const contentSections = [
    {id: 'overview', title: 'Overview', icon: 'user', show: hasContent('overview')},
    {id: 'education', title: 'Education', icon: 'graduation-cap', show: hasContent('education')},
    {id: 'workExperience', title: 'Experience', icon: 'briefcase', show: hasContent('workExperience')},
    {id: 'publications', title: 'Publications', icon: 'scroll', show: hasContent('publications')},
    {id: 'research', title: 'Research', icon: 'flask', show: hasContent('research')},
    {id: 'projects', title: 'Projects', icon: 'project-diagram', show: faculty.projects && faculty.projects.length > 0}
  ].filter(section => section.show);

  // Define primary colors with hard-coded values - no CSS variables
  const RED = '#D32F2F'; // Primary red
  const RED_TRANSPARENT = 'rgba(211, 47, 47, 0.1)'; // Red with opacity
  
  return (
    <>
      {/* Direct color value for ScrollProgress */}
      <ScrollProgress color="#D32F2F" />
      
      <div 
        id="faculty-view-container"
        className="opacity-0 translate-y-5 transition-all duration-500 ease-out"
        style={{ 
          background: `linear-gradient(to bottom, #f5f7fa, #ffffff, #f5f7fa)`
        }}
      >
        {/* Hero Section - Hard-coded red colors */}
        <section 
          id="faculty-hero" 
          className="relative w-full"
          style={{ 
            backgroundColor: '#D32F2F', // Changed back to red (#D32F2F) from white
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            paddingBottom: '6rem' // Increased padding for the design element
          }}
        >
          {/* Glassmorphism overlay - Adjusted for red background */}
          <div className="absolute inset-0 backdrop-blur-sm z-[1] bg-gradient-to-r from-red-800/10 to-red-600/10"></div>

          {/* Hero content container with upgraded styling */}
          <div className="w-full px-4 py-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 max-w-[1800px] mx-auto">
              {/* Faculty Image Column - with white background and card effect */}
              <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 relative rounded-full overflow-hidden 
                  border-4 border-white/50 flex-shrink-0 transition-all duration-500 animate-fadeIn
                  shadow-[0_0_25px_rgba(255,255,255,0.3)] backdrop-blur-md bg-white/90"
              >
                <img 
                  src={faculty.image || "/img/default-faculty.png"} 
                  alt={faculty.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {e.target.src = inlineSVGFallback}}
                  onLoad={() => setIsImageLoaded(true)}
                />
                {!isImageLoaded && (
                  <div className="absolute inset-0 bg-gray-600 animate-pulse flex items-center justify-center">
                    <svg className="w-20 h-20 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                {/* Department tag - Hard-coded red color */}
                <div 
                  className="absolute bottom-3 right-0 px-4 py-1 rounded-l-full font-semibold text-xs uppercase tracking-wider shadow-lg backdrop-blur-md"
                  style={{ 
                    backgroundColor: 'rgba(209, 213, 219, 0.8)', // Grey background
                    color: '#D32F2F', // Direct red hex
                    border: '1px solid rgba(229, 231, 235, 0.3)',
                  }}
                >
                  {faculty.department}
                </div>
              </div>
              
              {/* Faculty Info Column - Updated with grey colors */}
              <div className="text-center lg:text-left flex-1 backdrop-blur-sm bg-gray-800/30 rounded-xl p-6 border border-gray-500/20 shadow-lg">
                {/* Navigation buttons at the top of the info column */}
                {onBack && (
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                    <button
                      onClick={onBack}
                      className="flex items-center px-4 py-2 rounded-full bg-white/20 text-white hover:bg-white/30 hover:translate-x-[-5px] transition-all duration-300 ease-in-out shadow-sm font-medium text-sm w-full md:w-auto mb-2 md:mb-0 backdrop-blur-sm"
                    >
                      <i className="fas fa-arrow-left mr-2"></i> Back to Faculty Directory
                    </button>
                    
                    <div className="flex gap-2">
                      {onEdit && (
                        <button 
                          onClick={onEdit}
                          className="px-4 py-2 rounded-full font-medium transition-all bg-white/20 text-white hover:bg-white/30 shadow-sm backdrop-blur-sm"
                        >
                          <i className="fas fa-edit mr-1"></i> Edit
                        </button>
                      )}
                      
                      {onDelete && (
                        <button 
                          onClick={onDelete}
                          className="px-4 py-2 rounded-full font-medium transition-all bg-red-500/50 text-white hover:bg-red-500/70 shadow-sm backdrop-blur-sm"
                        >
                          <i className="fas fa-trash mr-1"></i> Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Faculty name and title */}
                <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                  <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{faculty.name}</h1>
                  <h2 className="text-xl sm:text-2xl font-light text-white opacity-90 mb-6">{faculty.designation}</h2>
                </div>
                

                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                  {faculty.email && (
                    <a 
                      href={`mailto:${faculty.email}`}
                      className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full hover:bg-white transition-all shadow-md hover:shadow-lg hover:-translate-y-1 border border-white/50"
                    >
                      <i className="fas fa-envelope mr-2" style={{ color: '#D32F2F' }}></i>
                      Email
                    </a>
                  )}
                  {faculty.mobileNumber && (
                    <a 
                      href={`tel:${faculty.mobileNumber}`}
                      className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full hover:bg-white transition-all shadow-md hover:shadow-lg hover:-translate-y-1 border border-white/50"
                    >
                      <i className="fas fa-phone-alt mr-2" style={{ color: '#D32F2F' }}></i>
                      Call
                    </a>
                  )}
                  {/* Add Book Appointment Button */}
                  <Link 
                    to={`/college/bookings/faculty-appointment?faculty=${encodeURIComponent(JSON.stringify(faculty))}`}
                    className="inline-flex items-center px-4 py-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full hover:bg-red-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-1 border border-red-400/50"
                  >
                    <i className="fas fa-calendar-check mr-2"></i>
                    Book Appointment
                  </Link>
                  <button 
                    onClick={() => {
                      if (window.print) window.print();
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gray-700/40 backdrop-blur-sm text-white rounded-full hover:bg-gray-700/60 transition-all shadow-md hover:shadow-lg hover:-translate-y-1 border border-gray-500/30"
                  >
                    <i className="fas fa-print mr-2"></i>
                    Print Profile
                  </button>
                </div>
                
                {/* Contact Cards Grid - With grey color scheme */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                  {/* Email Card */}
                  {faculty.email && (
                    <div className="bg-gray-700/30 backdrop-filter backdrop-blur-lg rounded-lg p-4 flex items-start hover:bg-gray-700/40 transition-all hover:-translate-y-1 border border-gray-500/30 shadow-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-600/40 flex items-center justify-center mr-3 flex-shrink-0 border border-gray-400/30">
                        <i className="fas fa-envelope text-white"></i>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-white text-opacity-70 text-xs uppercase tracking-wider font-semibold mb-1">Email</p>
                        <a href={`mailto:${faculty.email}`} className="text-white hover:underline text-sm truncate block">{faculty.email}</a>
                      </div>
                    </div>
                  )}
                  
                  {/* Mobile Card */}
                  {faculty.mobileNumber && (
                    <div className="bg-gray-700/30 backdrop-filter backdrop-blur-lg rounded-lg p-4 flex items-start hover:bg-gray-700/40 transition-all hover:-translate-y-1 border border-gray-500/30 shadow-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-600/40 flex items-center justify-center mr-3 flex-shrink-0 border border-gray-400/30">
                        <i className="fas fa-phone-alt text-white"></i>
                      </div>
                      <div>
                        <p className="text-white text-opacity-70 text-xs uppercase tracking-wider font-semibold mb-1">Phone</p>
                        <a href={`tel:${faculty.mobileNumber}`} className="text-white hover:underline text-sm">{faculty.mobileNumber}</a>
                      </div>
                    </div>
                  )}
                  
                  {/* Cabin Location Card */}
                  {faculty.cabinLocation && (
                    <div className="bg-gray-700/30 backdrop-filter backdrop-blur-lg rounded-lg p-4 flex items-start hover:bg-gray-700/40 transition-all hover:-translate-y-1 border border-gray-500/30 shadow-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-600/40 flex items-center justify-center mr-3 flex-shrink-0 border border-gray-400/30">
                        <i className="fas fa-map-marker-alt text-white"></i>
                      </div>
                      <div>
                        <p className="text-white text-opacity-70 text-xs uppercase tracking-wider font-semibold mb-1">Office</p>
                        <p className="text-white text-sm">{faculty.cabinLocation}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Office Hours Card */}
                  {faculty.freeTimings && (
                    <div className="bg-gray-700/30 backdrop-filter backdrop-blur-lg rounded-lg p-4 flex items-start hover:bg-gray-700/40 transition-all hover:-translate-y-1 border border-gray-500/30 shadow-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-600/40 flex items-center justify-center mr-3 flex-shrink-0 border border-gray-400/30">
                        <i className="fas fa-clock text-white"></i>
                      </div>
                      <div>
                        <p className="text-white text-opacity-70 text-xs uppercase tracking-wider font-semibold mb-1">Office Hours</p>
                        <p className="text-white text-sm">{faculty.freeTimings}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative bottom design with triangular pattern */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden z-10">
            {/* Gray triangular pattern */}
            <svg 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none" 
              className="absolute bottom-0 left-0 w-full"
              style={{ height: '70px' }}
            >
              <path 
                d="M1200 0L0 0 598.97 114.72 1200 0z" 
                fill="#f3f4f6" 
                className="shadow-inner"
              ></path>
            </svg>
            
            {/* Smaller triangular pattern overlay with darker gray */}
            <svg 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none" 
              className="absolute bottom-0 left-0 w-full"
              style={{ height: '40px', opacity: 0.7 }}
            >
              <path 
                d="M1200 0L0 0 598.97 114.72 1200 0z" 
                fill="#e5e7eb"
              ></path>
            </svg>
            
            {/* White base to ensure clean transition */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-2 bg-white" 
              style={{ 
                marginBottom: "-1px",
                zIndex: 15 // Ensure this is above other elements
              }}
            ></div>
          </div>
        </section>

        {/* Section Navigation - Updated with glassmorphism */}
        <div 
          className="w-full transition-all duration-300 z-20 backdrop-blur-md bg-white/80"
          ref={sectionNavRef}
          style={{
            borderBottom: '1px solid rgba(237, 242, 247, 0.7)'
          }}
        >
          <div className="w-full max-w-[1800px] mx-auto relative">
            {/* Mobile navigation toggle */}
            <div className="md:hidden flex justify-between items-center p-4">
              <span className="font-semibold text-gray-700">
                {activeTab === 'overview' ? 'Faculty Overview' :
                 activeTab === 'education' ? 'Education' :
                 activeTab === 'workExperience' ? 'Experience' :
                 activeTab === 'publications' ? 'Publications' :
                 activeTab === 'research' ? 'Research' :
                 activeTab === 'projects' ? 'Projects' : 'Faculty Profile'}
              </span>
              <button 
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="px-3 py-1 bg-gray-100 rounded-md flex items-center"
              >
                <i className={`fas fa-${showMobileNav ? 'times' : 'bars'} mr-2`}></i>
                {showMobileNav ? 'Close' : 'Menu'}
              </button>
            </div>
            
            {/* Mobile dropdown menu */}
            <div className={`md:hidden ${showMobileNav ? 'block' : 'hidden'} bg-white border-t border-gray-100 absolute w-full shadow-lg z-30`}>
              <ul className="py-2">
                {contentSections.map(section => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-4 py-3 flex items-center ${activeTab === section.id ? 'bg-gray-100' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3" 
                        style={{
                          backgroundColor: activeTab === section.id ? RED_TRANSPARENT : 'rgb(243 244 246)',
                          color: activeTab === section.id ? RED : 'rgb(107 114 128)'
                        }}
                      >
                        <i className={`fas fa-${section.icon}`}></i>
                      </div>
                      <span className={activeTab === section.id ? 'font-medium' : ''}>{section.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Desktop nav tabs - Hard-coded red colors */}
            <div className="hidden md:flex overflow-x-auto flex-nowrap px-4">
              {contentSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-5 py-4 font-medium text-sm flex items-center whitespace-nowrap relative transition-colors ${
                    activeTab === section.id ? '' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  style={{
                    color: activeTab === section.id ? '#D32F2F' : '',
                  }}
                >
                  <i className={`fas fa-${section.icon} mr-2`}></i>
                  {section.title}
                  {activeTab === section.id && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5" 
                      style={{ backgroundColor: '#D32F2F' }}
                    ></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Sections - Full width with glassmorphism */}
        <div className="w-full py-8">
          <div className="max-w-[1800px] mx-auto px-4 md:px-6">

            {/* Overview Section - Glassmorphism design */}
            {hasContent('overview') && (
              <section 
                id="section-overview" 
                ref={sectionRefs.overview}
                className="mb-16 scroll-mt-24 w-full"
              >
                <div className="backdrop-blur-xl bg-white/60 rounded-xl shadow-lg border border-white/30 p-8 w-full glass-section">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200/50 flex items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }} // Direct light red background
                    >
                      <i className="fas fa-user" style={{ color: '#D32F2F' }}></i> {/* Direct red color */}
                    </div>
                    Faculty Overview
                  </h2>
                  <div className={`prose prose-lg max-w-none ql-content ${visibleSections.overview ? 'animate-fadeIn' : ''}`} 
                    dangerouslySetInnerHTML={renderHTML(faculty.overview)}>
                  </div>
                </div>
              </section>
            )}
            
            {/* Education Section - Glassmorphism design */}
            {hasContent('education') && (
              <section 
                id="section-education" 
                ref={sectionRefs.education}
                className="mb-16 scroll-mt-24 w-full"
              >
                <div className="backdrop-blur-xl bg-white/60 rounded-xl shadow-lg border border-white/30 p-8 w-full glass-section">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200/50 flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                      <i className="fas fa-graduation-cap" style={{ color: '#D32F2F' }}></i>
                    </div>
                    Education
                  </h2>
                  <div className={`prose prose-lg max-w-none ql-content ${visibleSections.education ? 'animate-fadeIn' : ''}`}
                    dangerouslySetInnerHTML={renderHTML(faculty.education)}>
                  </div>
                </div>
              </section>
            )}
            
            {/* Work Experience Section - Glassmorphism design */}
            {hasContent('workExperience') && (
              <section 
                id="section-workExperience" 
                ref={sectionRefs.workExperience}
                className="mb-16 scroll-mt-24 w-full"
              >
                <div className="backdrop-blur-xl bg-white/60 rounded-xl shadow-lg border border-white/30 p-8 w-full glass-section">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200/50 flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                      <i className="fas fa-briefcase" style={{ color: '#D32F2F' }}></i>
                    </div>
                    Work Experience
                  </h2>
                  <div className={`prose prose-lg max-w-none ql-content ${visibleSections.workExperience ? 'animate-fadeIn' : ''}`}
                    dangerouslySetInnerHTML={renderHTML(faculty.workExperience)}>
                  </div>
                </div>
              </section>
            )}
            
            {/* Publications Section - Glassmorphism design */}
            {hasContent('publications') && (
              <section 
                id="section-publications" 
                ref={sectionRefs.publications}
                className="mb-16 scroll-mt-24 w-full"
              >
                <div className="backdrop-blur-xl bg-white/60 rounded-xl shadow-lg border border-white/30 p-8 w-full glass-section">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200/50 flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                      <i className="fas fa-scroll" style={{ color: '#D32F2F' }}></i>
                    </div>
                    Academic Publications
                  </h2>
                  <div className={`prose prose-lg max-w-none ql-content ${visibleSections.publications ? 'animate-fadeIn' : ''}`}
                    dangerouslySetInnerHTML={renderHTML(faculty.publications)}>
                  </div>
                </div>
              </section>
            )}
            
            {/* Research Interests Section - Glassmorphism design */}
            {hasContent('research') && (
              <section 
                id="section-research" 
                ref={sectionRefs.research}
                className="mb-16 scroll-mt-24 w-full"
              >
                <div className="backdrop-blur-xl bg-white/60 rounded-xl shadow-lg border border-white/30 p-8 w-full glass-section">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200/50 flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                      <i className="fas fa-flask" style={{ color: '#D32F2F' }}></i>
                    </div>
                    Research Interests
                  </h2>
                  <div className={`prose prose-lg max-w-none ql-content ${visibleSections.research ? 'animate-fadeIn' : ''}`}
                    dangerouslySetInnerHTML={renderHTML(faculty.research)}>
                  </div>
                </div>
              </section>
            )}
            
            {/* Projects Section - Modified to use full-width vertical layout */}
            {faculty.projects && faculty.projects.length > 0 && (
              <section 
                id="section-projects" 
                ref={sectionRefs.projects}
                className="mb-16 scroll-mt-24 w-full"
              >
                <div className="relative w-full bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 0 10 L 40 10 M 10 0 L 10 40" stroke="currentColor" strokeWidth="1" fill="none" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Main content container */}
                  <div className="relative p-8 md:p-12">
                    {/* Section header with new styling */}
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center justify-center px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-4">
                        <i className="fas fa-project-diagram mr-2"></i>
                        Faculty Projects
                      </div>
                      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                        Current Working Projects
                      </h2>
                      <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-300 rounded-full mx-auto mt-4"></div>
                    </div>

                    {/* Project type selector with new pill design */}
                    <div className="flex justify-center mb-12">
                      <div className="inline-flex p-1 bg-white rounded-xl shadow-md">
                        <button 
                          onClick={() => setProjectTab('ongoing')}
                          className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            projectTab === 'ongoing' 
                              ? 'text-white' 
                              : 'text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          {projectTab === 'ongoing' && (
                            <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-lg shadow-md animate-fadeIn"></span>
                          )}
                          <span className="relative flex items-center">
                            Ongoing
                          </span>
                        </button>
                        <button 
                          onClick={() => setProjectTab('completed')}
                          className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            projectTab === 'completed' 
                              ? 'text-white' 
                              : 'text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          {projectTab === 'completed' && (
                            <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-lg shadow-md animate-fadeIn"></span>
                          )}
                          <span className="relative flex items-center">
                            <i className="fas fa-check-circle mr-2"></i>
                            Completed
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Vertical stack layout for projects - CHANGED FROM HORIZONTAL TO VERTICAL */}
                    <div className="space-y-8">
                      {faculty.projects
                        .filter(project => {
                          if (projectTab === 'ongoing') {
                            return ['In Progress', 'On Hold', 'Planning'].includes(project.status);
                          } else {
                            return project.status === 'Completed';
                          }
                        })
                        .map((project, index) => (
                          <div 
                            key={index} 
                            className={`w-full bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-2 ${
                              visibleSections.projects ? 'animate-fadeIn' : 'opacity-0'
                            }`}
                            style={{ 
                              animationDelay: `${index * 150}ms`,
                              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' 
                            }}
                          >
                            <div className="flex flex-col lg:flex-row">
                              {/* Left side colored status indicator */}
                              <div className={`
                                w-full h-2 lg:h-auto lg:w-2
                                ${project.status === 'Completed' ? 'bg-gradient-to-r lg:bg-gradient-to-b from-green-500 to-green-400' : 
                                  project.status === 'In Progress' ? 'bg-gradient-to-r lg:bg-gradient-to-b from-blue-500 to-blue-400' : 
                                  project.status === 'On Hold' ? 'bg-gradient-to-r lg:bg-gradient-to-b from-amber-500 to-amber-400' :
                                  'bg-gradient-to-r lg:bg-gradient-to-b from-gray-400 to-gray-300'}
                              `}></div>
                              
                              {/* Main content area */}
                              <div className="p-6 flex-1">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 hover:text-red-600 transition-colors">
                                      {project.title}
                                    </h3>
                                    {project.timeline && (
                                      <div className="text-sm text-gray-500 flex items-center mb-4">
                                        <i className="far fa-calendar-alt mr-2"></i>
                                        <span className="font-medium">{project.timeline}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className={`
                                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mt-2 lg:mt-0
                                    ${project.status === 'Completed' ? 'bg-green-100' : 
                                      project.status === 'In Progress' ? 'bg-blue-100' : 
                                      project.status === 'On Hold' ? 'bg-amber-100' :
                                      'bg-gray-100'}
                                  `}>
                                    <i className={`
                                      text-lg 
                                      ${project.status === 'Completed' ? 'fas fa-check text-green-500' : 
                                        project.status === 'In Progress' ? 'fas fa-cog fa-spin text-blue-500' : 
                                        project.status === 'On Hold' ? 'fas fa-pause text-amber-500' :
                                        'fas fa-lightbulb text-gray-500'}
                                    `}></i>
                                  </div>
                                </div>
                                
                                {/* Project description */}
                                <div className="prose prose-lg max-w-none mb-6 text-gray-600">
                                  <p className="leading-relaxed">{project.description || 'No description provided.'}</p>
                                </div>
                                
                                {/* Project footer */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                  <span className={`
                                    inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                                    ${project.status === 'Completed' ? 'bg-green-50 text-green-700' : 
                                      project.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 
                                      project.status === 'On Hold' ? 'bg-amber-50 text-amber-700' :
                                      'bg-gray-50 text-gray-700'}
                                  `}>
                                    <i className={`mr-1
                                      ${project.status === 'Completed' ? 'fas fa-flag-checkered' : 
                                        project.status === 'In Progress' ? 'fas fa-spinner fa-spin' : 
                                        project.status === 'On Hold' ? 'fas fa-hand-paper' :
                                        'fas fa-lightbulb'}
                                    `}></i>
                                    {project.status}
                                  </span>
                                  
                                  {/* Progress indicator removed */}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    {/* No projects message when filtered results are empty */}
                    {faculty.projects.filter(p => 
                      projectTab === 'ongoing' 
                        ? ['In Progress', 'On Hold', 'Planning'].includes(p.status)
                        : p.status === 'Completed'
                    ).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                          <i className="fas fa-folder-open text-gray-300 text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No {projectTab === 'ongoing' ? 'ongoing' : 'completed'} projects</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          {projectTab === 'ongoing' 
                            ? 'There are currently no ongoing or on hold projects. Check back later for updates.'
                            : 'No completed projects found. Ongoing projects will appear here once completed.'}
                        </p>
                        <button 
                          onClick={() => setProjectTab(projectTab === 'ongoing' ? 'completed' : 'ongoing')}
                          className="mt-6 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors flex items-center"
                        >
                          <i className="fas fa-exchange-alt mr-2"></i>
                          View {projectTab === 'ongoing' ? 'completed' : 'ongoing'} projects instead
                        </button>
                      </div>
                    )}
                    
                    {/* Contact call-to-action section remains unchanged */}
                    <div className="relative mt-16 bg-gradient-to-br from-red-50 via-white to-red-50 rounded-lg overflow-hidden">
                      {/* Decorative background elements */}
                      <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-red-100 opacity-50"></div>
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-red-100 opacity-50"></div>
                        <div className="absolute top-1/4 right-1/4 w-20 h-20 rounded-full bg-red-100 opacity-30"></div>
                      </div>
                      
                      <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center md:items-stretch gap-8">
                        <div className="w-full md:w-1/3 flex flex-col items-center md:items-start md:border-r border-gray-100 pr-8">
                          <div className="bg-white w-20 h-20 flex items-center justify-center rounded-xl shadow-lg mb-5 transform rotate-6">
                            <i className="fas fa-lightbulb text-red-500 text-3xl"></i>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center md:text-left">Collaborate on Research</h3>
                          <p className="text-gray-600 text-center md:text-left">
                            Join {faculty.name}'s research team and contribute to groundbreaking projects in your field of interest.
                          </p>
                        </div>
                        
                        <div className="flex-1 space-y-6">
                          <h4 className="font-medium text-gray-800 border-b border-gray-100 pb-2 mb-4">How to get involved:</h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {faculty.email && (
                              <a href={`mailto:${faculty.email}`} className="flex items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="bg-red-50 w-12 h-12 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-100 transition-colors">
                                  <i className="fas fa-envelope text-red-500"></i>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-800 mb-1">Contact via Email</h5>
                                  <span className="text-sm text-gray-500">{faculty.email}</span>
                                </div>
                                <i className="fas fa-chevron-right ml-auto opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all text-red-400"></i>
                              </a>
                            )}
                            
                            {faculty.mobileNumber && (
                              <a href={`tel:${faculty.mobileNumber}`} className="flex items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                                  <i className="fas fa-phone-alt text-blue-500"></i>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-800 mb-1">Call Directly</h5>
                                  <span className="text-sm text-gray-500">{faculty.mobileNumber}</span>
                                </div>
                                <i className="fas fa-chevron-right ml-auto opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all text-blue-400"></i>
                              </a>
                            )}
                            
                            {faculty.cabinLocation && (
                              <a href="#faculty-hero" onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('faculty-hero').scrollIntoView({behavior: 'smooth'});
                              }} className="flex items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-100 transition-colors">
                                  <i className="fas fa-map-marker-alt text-green-500"></i>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-800 mb-1">Office Location</h5>
                                  <span className="text-sm text-gray-500">{faculty.cabinLocation}</span>
                                </div>
                                <i className="fas fa-chevron-right ml-auto opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all text-green-400"></i>
                              </a>
                            )}
                            
                            {faculty.freeTimings && (
                              <a href="#faculty-hero" onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('faculty-hero').scrollIntoView({behavior: 'smooth'});
                              }} className="flex items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-100 transition-colors">
                                  <i className="fas fa-clock text-purple-500"></i>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-800 mb-1">Office Hours</h5>
                                  <span className="text-sm text-gray-500">{faculty.freeTimings}</span>
                                </div>
                                <i className="fas fa-chevron-right ml-auto opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all text-purple-400"></i>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Floating back to top button - modified to use red color */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-8 right-8 backdrop-blur-xl text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all z-20 focus:outline-none focus:ring-4 ${scrollPosition > 300 ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
          style={{ 
            backgroundColor: 'rgba(211, 47, 47, 0.8)', // Direct rgba red
            boxShadow: '0 0 15px rgba(211, 47, 47, 0.3)', // Red shadow
          }}
          aria-label="Back to top"
          title="Back to top"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      </div>
      
      <style jsx>{`
        /* Custom animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.7s ease-out forwards;
        }
        
        /* Sticky navigation styling */
        .sticky-nav {
          position: sticky;
          top: 0;
          z-index: 40;
        }
        
        /* Glass effect hover animation */
        .glass-section {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .glass-section:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Enhanced glassmorphism effects for header */
        .glass-header {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
        }

        /* Hide scrollbar for clean UI */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* New pulse animation for icons */
        @keyframes pulse-gentle {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .pulse-animation {
          animation: pulse-gentle 2s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};

export default FacultyView;
