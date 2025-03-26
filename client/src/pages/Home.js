import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import '../styles/Home.css';

function Home() {
  // Create refs for the slider elements
  const announcementSliderRef = useRef(null);
  const testimonialSliderRef = useRef(null);
  let autoScrollInterval = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    console.log("Home component mounted");
    
    // Add slider functionality for testimonials and announcements
    const initSliders = () => {
      // Initialize announcement auto-scroll
      initAnnouncementSlider();
      
      // Make testimonial slider responsive with keyboard navigation
      initTestimonialSlider();
    };
    
    // Function to initialize the announcement slider with auto-scroll
    const initAnnouncementSlider = () => {
      const slider = announcementSliderRef.current;
      if (!slider) return;
      
      // Clear any existing interval
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
      
      // Set up auto-scrolling
      let scrollPosition = 0;
      const scrollStep = 1; // Adjust scroll speed
      
      autoScrollInterval.current = setInterval(() => {
        // Skip if paused
        if (isPaused) return;
        
        // Get the first announcement item
        const firstItem = slider.querySelector('.announcement-item');
        if (!firstItem) return;
        
        const itemWidth = firstItem.offsetWidth + 40; // Width + gap
        
        // Increment scroll position
        scrollPosition += scrollStep;
        
        // When scrolled past the first item, reset position and move it to the end
        if (scrollPosition >= itemWidth) {
          scrollPosition = 0;
          
          // Clone and append the first item to the end, then remove the original
          const clone = firstItem.cloneNode(true);
          
          // Make sure the clone has event listeners
          const button = clone.querySelector('button');
          if (button) {
            button.addEventListener('click', (e) => {
              e.stopPropagation(); // Prevent triggering parent events
            });
          }
          
          slider.appendChild(clone);
          slider.removeChild(firstItem);
        }
        
        // Apply the scroll position
        slider.scrollLeft = scrollPosition;
      }, 30); // Adjust timing for smooth scrolling
    };
    
    // Function to make testimonial slider more accessible
    const initTestimonialSlider = () => {
      const slider = testimonialSliderRef.current;
      if (!slider) return;
      
      // Add keyboard navigation to testimonial cards
      const cards = slider.querySelectorAll('.testimonial-card');
      cards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Testimonial ${index + 1} of ${cards.length}`);
        
        // Add keyboard navigation
        card.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (index < cards.length - 1) {
              cards[index + 1].focus();
              cards[index + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (index > 0) {
              cards[index - 1].focus();
              cards[index - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        });
      });
    };
    
    initSliders();
    
    // Responsive handling for window resize
    const handleResize = () => {
      // Reinitialize slider on window resize for better responsive behavior
      if (window.innerWidth < 768) {
        // Mobile optimizations
        const slider = announcementSliderRef.current;
        if (slider) {
          slider.style.scrollSnapType = 'x mandatory';
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    // Clean up intervals on component unmount
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isPaused]);
  
  // Function to pause auto-scroll on hover/touch
  const handleAnnouncementMouseEnter = () => {
    setIsPaused(true);
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }
  };
  
  // Function to resume auto-scroll when hover/touch ends
  const handleAnnouncementMouseLeave = () => {
    setIsPaused(false);
    
    const slider = announcementSliderRef.current;
    if (!slider) return;
    
    // Set up auto-scrolling again
    let scrollPosition = slider.scrollLeft;
    const scrollStep = 1;
    
    autoScrollInterval.current = setInterval(() => {
      if (isPaused) return;
      
      const firstItem = slider.querySelector('.announcement-item');
      if (!firstItem) return;
      
      const itemWidth = firstItem.offsetWidth + 40;
      scrollPosition += scrollStep;
      
      if (scrollPosition >= itemWidth) {
        scrollPosition = 0;
        const clone = firstItem.cloneNode(true);
        
        // Make sure the clone has event listeners
        const button = clone.querySelector('button');
        if (button) {
          button.addEventListener('click', (e) => {
            e.stopPropagation();
          });
        }
        
        slider.appendChild(clone);
        slider.removeChild(firstItem);
      }
      
      slider.scrollLeft = scrollPosition;
    }, 30);
  };
  
  // Toggle pause/play for the announcement slider
  const toggleAnnouncementPause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <div className="home-page container-fluid">
      {/* Hero Section - Full Width */}
      <section className="hero full-width relative min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-r from-primary-teal to-blue-600 text-white py-32 md:py-36">
        <div className="absolute inset-0 bg-black bg-opacity-20 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight drop-shadow-md">MU-UniConnect</h1>
          <p className="text-xl md:text-2xl font-medium mb-6 drop-shadow">Connecting Campus Life at Mahindra University</p>
          <p className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">One platform to access faculty information, club activities, events, and university resources</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#features" className="bg-primary-red text-white font-semibold px-6 py-3 rounded-lg transform transition hover:scale-105 hover:bg-secondary-red hover:shadow-lg">Explore Features</a>
            <Link to="/clubs-events" className="bg-white text-primary-red font-semibold px-6 py-3 rounded-lg transform transition hover:scale-105 hover:bg-opacity-90 hover:shadow-lg">Upcoming Events</Link>
          </div>
        </div>
      </section>

      {/* Announcement Banner - Full Width */}
      <section className="bg-red-light py-3 overflow-hidden">
        <div className="content-container px-4">
          <div 
            className="announcement-slider relative"
            ref={announcementSliderRef}
            onMouseEnter={handleAnnouncementMouseEnter}
            onMouseLeave={handleAnnouncementMouseLeave}
            onTouchStart={handleAnnouncementMouseEnter}
            onTouchEnd={handleAnnouncementMouseLeave}
            aria-label="Announcements"
          >
            <div className="announcement-item flex items-center gap-2 md:gap-3 whitespace-nowrap px-2 md:px-4 py-1 min-w-[280px]">
              <i className="fas fa-bell text-primary-red text-sm md:text-base"></i>
              <span className="text-dark-gray text-sm md:text-base truncate flex-1">New Faculty Research Publication Awards announced - Check eligibility now</span>
              <button 
                type="button" 
                className="text-primary-red font-semibold hover:underline bg-transparent border-0 cursor-pointer text-sm md:text-base whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >Learn More</button>
            </div>
            <div className="announcement-item flex items-center gap-2 md:gap-3 whitespace-nowrap px-2 md:px-4 py-1 min-w-[280px]">
              <i className="fas fa-calendar-check text-primary-red text-sm md:text-base"></i>
              <span className="text-dark-gray text-sm md:text-base truncate flex-1">Registration for Annual Techfest "Mahindra Ecolectica" is now open - Early bird discounts available</span>
              <button 
                type="button" 
                className="text-primary-red font-semibold hover:underline bg-transparent border-0 cursor-pointer text-sm md:text-base whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >Register Now</button>
            </div>
            <div className="announcement-item flex items-center gap-2 md:gap-3 whitespace-nowrap px-2 md:px-4 py-1 min-w-[280px]">
              <i className="fas fa-award text-primary-red text-sm md:text-base"></i>
              <span className="text-dark-gray text-sm md:text-base truncate flex-1">Mahindra University ranks among Top Engineering Institutes in Hyderabad - See our achievements</span>
              <button 
                type="button" 
                className="text-primary-red font-semibold hover:underline bg-transparent border-0 cursor-pointer text-sm md:text-base whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >View Rankings</button>
            </div>
          </div>
          
          {/* Controls for announcement slider - shown on all devices now */}
          <div className="announcement-controls flex justify-end mt-2">
            <button 
              type="button" 
              onClick={toggleAnnouncementPause} 
              className="text-xs text-primary-red py-1 px-2 rounded hover:bg-red-100 transition-colors"
              aria-label={isPaused ? "Resume announcements" : "Pause announcements"}
            >
              <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'} mr-1`}></i> 
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 bg-white">
        <div className="content-container px-4 md:px-6">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-center text-dark-gray mb-12 md:mb-14">Platform Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature cards */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-red-light w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-users text-2xl text-primary-red"></i>
              </div>
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">Faculty Directory</h3>
              <p className="text-medium-gray mb-6 leading-relaxed">Comprehensive database of faculty members with their expertise, publications, and contact information</p>
              <Link to="/faculty" className="feature-link inline-flex items-center text-primary-red font-semibold">
                Browse Faculty <i className="fas fa-arrow-right ml-2 transition-transform"></i>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-red-light w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-calendar-alt text-2xl text-primary-red"></i>
              </div>
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">Events Calendar</h3>
              <p className="text-medium-gray mb-6 leading-relaxed">Stay updated with all campus events, workshops, seminars, and activities</p>
              <Link to="/clubs-events" className="feature-link inline-flex items-center text-primary-red font-semibold">
                View Events <i className="fas fa-arrow-right ml-2 transition-transform"></i>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-red-light w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-graduation-cap text-2xl text-primary-red"></i>
              </div>
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">College Resources</h3>
              <p className="text-medium-gray mb-6 leading-relaxed">Access important college information, departments, and academic resources</p>
              <Link to="/college" className="feature-link inline-flex items-center text-primary-red font-semibold">
                Explore Resources <i className="fas fa-arrow-right ml-2 transition-transform"></i>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-red-light w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-project-diagram text-2xl text-primary-red"></i>
              </div>
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">Club Activities</h3>
              <p className="text-medium-gray mb-6 leading-relaxed">Discover and join various student clubs, organizations, and special interest groups</p>
              <Link to="/clubs-events" className="feature-link inline-flex items-center text-primary-red font-semibold">
                Join Clubs <i className="fas fa-arrow-right ml-2 transition-transform"></i>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-red-light w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-newspaper text-2xl text-primary-red"></i>
              </div>
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">Campus News</h3>
              <p className="text-medium-gray mb-6 leading-relaxed">Stay informed with the latest news, announcements, and updates from around the campus</p>
              <button type="button" className="feature-link inline-flex items-center text-primary-red font-semibold">
                Read News <i className="fas fa-arrow-right ml-2 transition-transform"></i>
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-red-light w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-chalkboard-teacher text-2xl text-primary-red"></i>
              </div>
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">Academic Calendar</h3>
              <p className="text-medium-gray mb-6 leading-relaxed">Important dates, exam schedules, and holiday information for the academic year</p>
              <button type="button" className="feature-link inline-flex items-center text-primary-red font-semibold">
                View Calendar <i className="fas fa-arrow-right ml-2 transition-transform"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-off-white">
        <div className="content-container px-4 md:px-6">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-center text-dark-gray mb-12 md:mb-14">What Our Community Says</h2>
          <div className="testimonials-slider px-2" ref={testimonialSliderRef} tabIndex="0">
            <div className="testimonial-card bg-white rounded-xl shadow-md p-6">
              <div className="w-20 h-20 rounded-full border-3 border-light-gray overflow-hidden mb-5">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23c0c0c0'/%3E%3Cpath d='M30,80 Q50,60 70,80' fill='%23c0c0c0'/%3E%3C/svg%3E" alt="Student testimonial" className="w-full h-full object-cover" />
              </div>
              <p className="text-medium-gray italic mb-5 leading-relaxed">"MU-UniConnect has transformed how I engage with campus activities. I never miss an important event now!"</p>
              <div className="flex flex-col">
                <strong className="text-dark-gray font-semibold block">Aditya Kumar</strong>
                <span className="text-medium-gray text-sm">Computer Science Engineering, 3rd Year</span>
              </div>
            </div>
            
            <div className="testimonial-card bg-white rounded-xl shadow-md p-6">
              <div className="w-20 h-20 rounded-full border-3 border-light-gray overflow-hidden mb-5">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23c0c0c0'/%3E%3Cpath d='M30,85 q20,-25 40,0' fill='%23c0c0c0'/%3E%3C/svg%3E" alt="Faculty testimonial" className="w-full h-full object-cover" />
              </div>
              <p className="text-medium-gray italic mb-5 leading-relaxed">"As a faculty member, the platform makes it easy to share research opportunities and connect with interested students."</p>
              <div className="flex flex-col">
                <strong className="text-dark-gray font-semibold block">Dr. Vidushi Sharma</strong>
                <span className="text-medium-gray text-sm">Associate Professor, Dept. of Mechanical Engineering</span>
              </div>
            </div>
            
            <div className="testimonial-card bg-white rounded-xl shadow-md p-6">
              <div className="w-20 h-20 rounded-full border-3 border-light-gray overflow-hidden mb-5">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23c0c0c0'/%3E%3Cpath d='M30,85 q20,-25 40,0' fill='%23c0c0c0'/%3E%3C/svg%3E" alt="Club leader testimonial" className="w-full h-full object-cover" />
              </div>
              <p className="text-medium-gray italic mb-5 leading-relaxed">"Our club membership increased by 70% after we started promoting our activities through MU-UniConnect!"</p>
              <div className="flex flex-col">
                <strong className="text-dark-gray font-semibold block">Neha Reddy</strong>
                <span className="text-medium-gray text-sm">President, AI/ML Club</span>
              </div>
            </div>
          </div>
          
          {/* Add testimonial navigation controls for better accessibility */}
          <div className="testimonial-controls flex justify-center gap-4 mt-4">
            <button 
              className="w-3 h-3 rounded-full bg-medium-gray opacity-50 hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label="View first testimonial"
              onClick={() => {
                const firstCard = testimonialSliderRef.current?.querySelector('.testimonial-card');
                if (firstCard) {
                  firstCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  firstCard.focus();
                }
              }}
            ></button>
            <button 
              className="w-3 h-3 rounded-full bg-medium-gray opacity-50 hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label="View second testimonial"
              onClick={() => {
                const cards = testimonialSliderRef.current?.querySelectorAll('.testimonial-card');
                if (cards && cards.length > 1) {
                  cards[1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  cards[1].focus();
                }
              }}
            ></button>
            <button 
              className="w-3 h-3 rounded-full bg-medium-gray opacity-50 hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label="View third testimonial"
              onClick={() => {
                const cards = testimonialSliderRef.current?.querySelectorAll('.testimonial-card');
                if (cards && cards.length > 2) {
                  cards[2].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  cards[2].focus();
                }
              }}
            ></button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section full-width bg-gradient-to-r from-primary-teal to-blue-600 text-white py-12 md:py-16">
        <div className="content-container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">150+</span>
              <span className="text-lg text-white text-opacity-90">Faculty Members</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">40+</span>
              <span className="text-lg text-white text-opacity-90">Campus Clubs</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">80+</span>
              <span className="text-lg text-white text-opacity-90">Annual Events</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">4000+</span>
              <span className="text-lg text-white text-opacity-90">Students Connected</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">12+</span>
              <span className="text-lg text-white text-opacity-90">Academic Departments</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">90%</span>
              <span className="text-lg text-white text-opacity-90">Placement Rate</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Latest News Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="content-container px-4 md:px-6">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-center text-dark-gray mb-12 md:mb-14">Latest Campus Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
            <div className="news-card rounded-xl overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='500' height='300' fill='%23f0f0f0'/%3E%3Ctext x='250' y='150' font-size='36' text-anchor='middle' fill='%23666'%3ENews%3C/text%3E%3C/svg%3E" alt="News" className="w-full h-full object-cover transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-primary-red text-white rounded-md p-2 text-center z-10">
                  <span className="block text-2xl font-bold">15</span>
                  <span className="block text-sm">Oct</span>
                </div>
              </div>
              <div className="p-6">
                <span className="inline-block bg-red-light text-primary-red text-xs font-semibold px-3 py-1 rounded-md mb-3">Research</span>
                <h3 className="text-xl font-semibold text-dark-gray mb-3 leading-tight">MU Research Team Secures Major Grant</h3>
                <p className="text-medium-gray mb-5">The School of Engineering has secured a ₹3 crore grant for Smart Mobility research and innovation.</p>
                <button type="button" className="news-link inline-flex items-center text-primary-red font-semibold">
                  Read More <i className="fas fa-long-arrow-alt-right ml-2"></i>
                </button>
              </div>
            </div>
            
            <div className="news-card rounded-xl overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Crect x='50' y='50' width='400' height='200' fill='%23e0e0e0'/%3E%3Ctext x='250' y='150' font-size='32' text-anchor='middle' alignment-baseline='middle' font-family='Arial, sans-serif' fill='%23666666'%3EEvent News%3C/text%3E%3C/svg%3E" alt="Event news" className="w-full h-full object-cover transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-primary-red text-white rounded-md p-2 text-center z-10">
                  <span className="block text-2xl font-bold">12</span>
                  <span className="block text-sm">Oct</span>
                </div>
              </div>
              <div className="p-6">
                <span className="inline-block bg-red-light text-primary-red text-xs font-semibold px-3 py-1 rounded-md mb-3">Event</span>
                <h3 className="text-xl font-semibold text-dark-gray mb-3 leading-tight">Mahindra Ecolectica 2023 Dates Announced</h3>
                <p className="text-medium-gray mb-5">Mark your calendars for Mahindra Ecolectica 2023, the biggest technical and cultural extravaganza of the year, happening next month.</p>
                <button type="button" className="news-link inline-flex items-center text-primary-red font-semibold">
                  Read More <i className="fas fa-long-arrow-alt-right ml-2"></i>
                </button>
              </div>
            </div>
            
            <div className="news-card rounded-xl overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Crect x='75' y='50' width='150' height='100' fill='%23cccccc'/%3E%3Cpolygon points='150,25 75,125 225,125' fill='%23bbbbbb'/%3E%3Ctext x='150' y='170' font-size='16' text-anchor='middle' font-family='Arial' fill='%23555555'%3EAcademic News%3C/text%3E%3C/svg%3E" alt="Academic news" className="w-full h-full object-cover transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-primary-red text-white rounded-md p-2 text-center z-10">
                  <span className="block text-2xl font-bold">08</span>
                  <span className="block text-sm">Oct</span>
                </div>
              </div>
              <div className="p-6">
                <span className="inline-block bg-red-light text-primary-red text-xs font-semibold px-3 py-1 rounded-md mb-3">Academic</span>
                <h3 className="text-xl font-semibold text-dark-gray mb-3 leading-tight">New International Exchange Program Launched</h3>
                <p className="text-medium-gray mb-5">Students can now apply for semester exchange programs with partner universities in France, Germany, and Singapore.</p>
                <button type="button" className="news-link inline-flex items-center text-primary-red font-semibold">
                  Read More <i className="fas fa-long-arrow-alt-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="text-center">
            <button type="button" className="px-6 py-3 border-2 border-dark-gray text-dark-gray font-semibold rounded-lg hover:bg-dark-gray hover:text-white transition-colors">View All News</button>
          </div>
        </div>
      </section>

      {/* About University Section */}
      <section className="py-16 md:py-20 bg-teal-light">
        <div className="content-container px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 min-w-0 lg:min-w-[300px]">
              <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-6">About Mahindra University</h2>
              <p className="text-medium-gray mb-5 leading-relaxed">Mahindra University stands as a premier institution of higher education in Hyderabad, committed to academic excellence and holistic development. Founded by the Mahindra Group with a vision to nurture future leaders, our campus fosters innovation, research, and entrepreneurship.</p>
              <p className="text-medium-gray mb-8 leading-relaxed">With state-of-the-art facilities and distinguished faculty, we provide an immersive learning environment that prepares students for global challenges and opportunities in engineering, management, law, and more.</p>
              <div className="flex flex-wrap gap-4 md:gap-5 mb-8">
                <div className="flex items-center gap-3 text-primary-teal font-semibold">
                  <i className="fas fa-medal text-accent-gold text-xl"></i>
                  <span>NAAC Accredited</span>
                </div>
                <div className="flex items-center gap-3 text-primary-teal font-semibold">
                  <i className="fas fa-trophy text-accent-gold text-xl"></i>
                  <span>Top Engineering Institute</span>
                </div>
                <div className="flex items-center gap-3 text-primary-teal font-semibold">
                  <i className="fas fa-globe-asia text-accent-gold text-xl"></i>
                  <span>Global Partnerships</span>
                </div>
              </div>
              <Link to="/college" className="inline-block px-6 py-3 bg-transparent text-primary-red border-2 border-primary-red font-semibold rounded-lg hover:bg-red-light transition-colors">Learn More About MU</Link>
            </div>
            <div className="flex-1 min-w-0 lg:min-w-[300px] h-[300px] md:h-[360px] w-full rounded-xl overflow-hidden shadow-xl">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f0f0f0'/%3E%3Cpath d='M300,100 L150,300 L450,300 Z' fill='%23d0d0d0'/%3E%3Crect x='250' y='300' width='100' height='75' fill='%23d0d0d0'/%3E%3Ctext x='300' y='200' font-size='36' text-anchor='middle' fill='%23666'%3ECampus%3C/text%3E%3C/svg%3E" alt="Mahindra University Campus" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Campus Gallery */}
      <section className="py-16 md:py-20 bg-dark-gray text-white">
        <div className="content-container px-4 md:px-6">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-center text-white mb-12 md:mb-14">Campus Life Highlights</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
            <div className="relative h-48 rounded-lg overflow-hidden cursor-pointer group">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e6e6e6'/%3E%3Crect x='50' y='50' width='200' height='100' fill='%23d0d0d0'/%3E%3Ctext x='150' y='175' font-size='16' text-anchor='middle' fill='%23666'%3ECampus%3C/text%3E%3C/svg%3E" alt="Campus Building" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="gallery-overlay absolute bottom-0 left-0 right-0 p-5 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                <h3 className="font-medium">Modern Infrastructure</h3>
              </div>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden cursor-pointer group">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='100%25' height='100%25' fill='%23e6e6e6'/%3E%3Crect x='75' y='50' width='150' height='100' fill='%23cccccc'/%3E%3Cpolygon points='150,25 75,125 225,125' fill='%23bbbbbb'/%3E%3Ctext x='150' y='170' font-size='16' text-anchor='middle' font-family='Arial' fill='%23555555'%3EDigital Library%3C/text%3E%3C/svg%3E" alt="Library" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="gallery-overlay absolute bottom-0 left-0 right-0 p-5 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                <h3 className="font-medium">Digital Library</h3>
              </div>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden cursor-pointer group">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='100%25' height='100%25' fill='%23e6e6e6'/%3E%3Crect x='75' y='50' width='150' height='100' fill='%23cccccc'/%3E%3Cpolygon points='150,25 75,125 225,125' fill='%23bbbbbb'/%3E%3Ctext x='150' y='170' font-size='16' text-anchor='middle' font-family='Arial' fill='%23555555'%3ESports Facilities%3C/text%3E%3C/svg%3E" alt="Sports Complex" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="gallery-overlay absolute bottom-0 left-0 right-0 p-5 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                <h3 className="font-medium">Sports Facilities</h3>
              </div>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden cursor-pointer group">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='100%25' height='100%25' fill='%23e6e6e6'/%3E%3Crect x='75' y='50' width='150' height='100' fill='%23cccccc'/%3E%3Cpolygon points='150,25 75,125 225,125' fill='%23bbbbbb'/%3E%3Ctext x='150' y='170' font-size='16' text-anchor='middle' font-family='Arial' fill='%23555555'%3EResearch Labs%3C/text%3E%3C/svg%3E" alt="Lab" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="gallery-overlay absolute bottom-0 left-0 right-0 p-5 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                <h3 className="font-medium">Research Labs</h3>
              </div>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden cursor-pointer group">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='100%25' height='100%25' fill='%23e6e6e6'/%3E%3Crect x='75' y='50' width='150' height='100' fill='%23cccccc'/%3E%3Cpolygon points='150,25 75,125 225,125' fill='%23bbbbbb'/%3E%3Ctext x='150' y='170' font-size='16' text-anchor='middle' font-family='Arial' fill='%23555555'%3ECultural Events%3C/text%3E%3C/svg%3E" alt="Cultural Event" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="gallery-overlay absolute bottom-0 left-0 right-0 p-5 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                <h3 className="font-medium">Cultural Events</h3>
              </div>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden cursor-pointer group">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='100%25' height='100%25' fill='%23e6e6e6'/%3E%3Crect x='75' y='50' width='150' height='100' fill='%23cccccc'/%3E%3Cpolygon points='150,25 75,125 225,125' fill='%23bbbbbb'/%3E%3Ctext x='150' y='170' font-size='16' text-anchor='middle' font-family='Arial' fill='%23555555'%3EStudent Housing%3C/text%3E%3C/svg%3E" alt="Hostel" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="gallery-overlay absolute bottom-0 left-0 right-0 p-5 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                <h3 className="font-medium">Student Housing</h3>
              </div>
            </div>
          </div>
          <div className="text-center">
            <button type="button" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors">View Full Gallery</button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary-red to-secondary-red text-white text-center">
        <div className="content-container px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Ready to Connect with Campus Life?</h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 opacity-90">Join MU-UniConnect today to stay informed about university activities, connect with faculty, and engage with campus organizations.</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
            <Link to="/signup" className="px-6 md:px-8 py-3 md:py-4 bg-white text-primary-teal font-semibold rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 text-base md:text-lg">Sign Up</Link>
            <a href="#features" className="px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition text-base md:text-lg">Explore Features</a>
          </div>
          <div className="mt-8">
            <p className="text-lg mb-3">Also available on:</p>
            <div className="flex justify-center gap-6">
              <i className="fab fa-android text-2xl md:text-3xl hover:scale-110 transform transition cursor-pointer"></i>
              <i className="fab fa-apple text-2xl md:text-3xl hover:scale-110 transform transition cursor-pointer"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-dark-gray text-off-white py-12 md:py-16 pb-0 md:pb-0">
        <div className="content-container px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-2">
            <div>
              <img src="/logo.png" alt="MU-UniConnect Logo" className="max-w-[150px] mb-4" />
              <p className="text-light-gray text-sm">Connecting campus. Building community.</p>
            </div>
            
            <div>
              <h4 className="text-xl text-white font-semibold mb-6 pb-2 border-b border-primary-red inline-block">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-light-gray hover:text-white hover:underline transition">Home</Link></li>
                <li><Link to="/faculty" className="text-light-gray hover:text-white hover:underline transition">Faculty</Link></li>
                <li><Link to="/clubs-events" className="text-light-gray hover:text-white hover:underline transition">Clubs & Events</Link></li>
                <li><Link to="/college" className="text-light-gray hover:text-white hover:underline transition">College</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl text-white font-semibold mb-6 pb-2 border-b border-primary-red inline-block">Contact</h4>
              <div className="space-y-4">
                <p className="flex items-center text-light-gray">
                  <i className="fas fa-map-marker-alt text-primary-red mr-3 w-5"></i> Mahindra University, Hyderabad
                </p>
                <p className="flex items-center text-light-gray">
                  <i className="fas fa-envelope text-primary-red mr-3 w-5"></i> info@uniconnect.mahindra.edu
                </p>
                <p className="flex items-center text-light-gray">
                  <i className="fas fa-phone text-primary-red mr-3 w-5"></i> (040) 6722-0000
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl text-white font-semibold mb-6 pb-2 border-b border-primary-red inline-block">Follow Us</h4>
              <div className="flex gap-4">
                <button type="button" aria-label="Facebook" className="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-10 text-white hover:bg-primary-red hover:-translate-y-1 transition-all">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button type="button" aria-label="Twitter" className="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-10 text-white hover:bg-primary-red hover:-translate-y-1 transition-all">
                  <i className="fab fa-twitter"></i>
                </button>
                <button type="button" aria-label="Instagram" className="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-10 text-white hover:bg-primary-red hover:-translate-y-1 transition-all">
                  <i className="fab fa-instagram"></i>
                </button>
                <button type="button" aria-label="LinkedIn" className="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-10 text-white hover:bg-primary-red hover:-translate-y-1 transition-all">
                  <i className="fab fa-linkedin-in"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* Footer bottom border with minimal padding */}
          <hr className="border-t border-gray-700" />
        </div>
      </footer>
    </div>
  );
}

export default Home;
