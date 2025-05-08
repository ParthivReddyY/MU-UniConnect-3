import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import '../styles/Home.css';
import { useAuth } from '../contexts/AuthContext'; 
import { getFeaturedNews } from '../services/newsService'; 
import api from '../utils/axiosConfig';
import CampusHighlightForm from '../components/CampusHighlightForm';
import CampusHighlightDetail from '../components/CampusHighlightDetail';

function Home() {
  // Navigation hook for redirection
  const navigate = useNavigate();
  
  // Create refs for the slider elements
  const announcementSliderRef = useRef(null);
  const testimonialSliderRef = useRef(null);
  let autoScrollInterval = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Get current user status from auth context
  const { currentUser } = useAuth();

  // State for news data
  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  // State for announcements
  const [announcements, setAnnouncements] = useState([]);  // Start with an empty array instead of default announcements
  
  // State for gallery modal
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Statistics state
  const [stats, setStats] = useState({
    facultyCount: '0',
    clubsCount: '0',
    eventsCount: '0',
    studentsCount: '0',
    schoolsCount: '0',
    isLoading: true
  });

  // State for campus highlights
  const [campusHighlights, setCampusHighlights] = useState([]);
  const [highlightsLoading, setHighlightsLoading] = useState(true);
  const [highlightsError, setHighlightsError] = useState(null);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [showHighlightDetail, setShowHighlightDetail] = useState(false);

  // Fallback gallery images in case API fails - wrapped in useMemo to prevent recreation on every render
  const fallbackGalleryImages = React.useMemo(() => [
    {
      id: 1,
      title: 'Modern Infrastructure',
      description: 'State-of-the-art academic buildings with cutting-edge facilities',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1746&q=80',
      link: '/college?tab=facilities',
      icon: 'fas fa-building'
    },
    {
      id: 2,
      title: 'Digital Library',
      description: 'Extensive collection of digital and print resources for research and learning',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      link: '/college?tab=library',
      icon: 'fas fa-book'
    },
    {
      id: 3,
      title: 'Sports Facilities',
      description: 'Olympic-sized swimming pool, indoor stadium, and outdoor sports fields',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1693&q=80',
      link: '/college?tab=sports',
      icon: 'fas fa-futbol'
    },
    {
      id: 4,
      title: 'Research Labs',
      description: 'Advanced research laboratories equipped with the latest technology',
      image: 'https://images.unsplash.com/photo-1581093458791-9f5bf5abf940?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      link: '/college?tab=research',
      icon: 'fas fa-flask'
    },
    {
      id: 5,
      title: 'Cultural Events',
      description: 'Vibrant campus life with regular cultural programs and celebrations',
      image: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
      link: '/clubs-events?category=cultural',
      icon: 'fas fa-music'
    },
    {
      id: 6,
      title: 'Student Housing',
      description: 'Modern, comfortable residential facilities for students',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80',
      link: '/college?tab=housing',
      icon: 'fas fa-home'
    },
  ], []);
  
  // State to track the current scroll position
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Function to handle announcement button clicks
  const handleAnnouncementClick = React.useCallback((link) => {
    navigate(link);
  }, [navigate]);
  
  // Function to start auto-scrolling with the current position
  const startAutoScroll = React.useCallback((slider, totalScrollWidth) => {
    const scrollStep = 1; // Adjust scroll speed
    let currentPosition = scrollPosition;
    
    autoScrollInterval.current = setInterval(() => {
      if (isPaused) return;
      
      // Increment scroll position
      currentPosition += scrollStep;
      
      // When scrolled past all items, reset seamlessly
      if (currentPosition >= totalScrollWidth) {
        // Reset to the beginning without animation
        currentPosition = 0;
        slider.scrollTo({
          left: currentPosition,
          behavior: 'auto' // Use 'auto' for instant reset
        });
      } else {
        // Apply the scroll position
        slider.scrollLeft = currentPosition;
        // Update the state with current position
        setScrollPosition(currentPosition);
      }
    }, 30); // Adjust timing for smooth scrolling
  }, [isPaused, scrollPosition]);
  
  // Function to open image in modal
  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowModal(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };
  
  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'unset'; // Re-enable scrolling
  };
  
  // Add event listener for Escape key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);
  
  useEffect(() => {
    console.log("Home component mounted");
    
    // Fetch announcements from API if available
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/api/announcements');
        console.log("Announcements API response:", response?.data);
        
        // Check for announcements in response - more flexible condition checking
        if (response?.data) {
          // Handle different response formats
          let announcementsArray = [];
          
          if (response.data.announcements && Array.isArray(response.data.announcements)) {
            // Standard format with success flag
            announcementsArray = response.data.announcements;
          } else if (Array.isArray(response.data)) {
            // Direct array in response data
            announcementsArray = response.data;
          }
          
          if (announcementsArray.length > 0) {
            // Format the announcements properly
            const fetchedAnnouncements = announcementsArray.map(announcement => ({
              id: announcement._id || announcement.id || Date.now() + Math.random().toString(),
              icon: announcement.icon || 'bell',
              text: announcement.text || announcement.message || announcement.content || '',
              buttonText: announcement.buttonText || announcement.action || 'Learn More',
              link: announcement.link || '/college?tab=news'
            }));
            console.log("Processed announcements:", fetchedAnnouncements);
            setAnnouncements(fetchedAnnouncements);
          } else {
            console.log("No announcements found in response");
            setAnnouncements([]);
          }
        } else {
          console.log("Invalid response format from announcements API");
          setAnnouncements([]);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
        // Set empty array on error
        setAnnouncements([]);
      }
    };

    // Try to fetch announcements
    fetchAnnouncements();
    
    // Add slider functionality for testimonials and announcements
    const initSliders = () => {
      // Initialize announcement auto-scroll
      initAnnouncementSlider();
      
      // Make testimonial slider responsive with keyboard navigation
      initTestimonialSlider();
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
  }, [isPaused, navigate]);
  
  // Function to initialize the announcement slider with auto-scroll
  const initAnnouncementSlider = React.useCallback(() => {
    const slider = announcementSliderRef.current;
    if (!slider) return;
    
    // Clear any existing interval
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }
    
    // Clone all announcement items initially for continuous scrolling
    const announceItems = slider.querySelectorAll('.announcement-item');
    if (announceItems.length === 0) return;
    
    // Clear existing clones first
    const existingClones = slider.querySelectorAll('.announcement-clone');
    existingClones.forEach(clone => clone.remove());
    
    // Clone all items and append to the end for seamless looping
    announceItems.forEach(item => {
      const clone = item.cloneNode(true);
      clone.classList.add('announcement-clone');
      
      // Make sure clone has proper event listeners
      const button = clone.querySelector('button');
      if (button) {
        const link = button.getAttribute('data-link');
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          if (link) handleAnnouncementClick(link);
        });
      }
      
      slider.appendChild(clone);
    });
    
    // Calculate total scroll width
    const totalItems = announceItems.length;
    const firstItemWidth = announceItems[0].offsetWidth + 12; // Width + gap
    const totalScrollWidth = totalItems * firstItemWidth;
    
    startAutoScroll(slider, totalScrollWidth);
  }, [handleAnnouncementClick, startAutoScroll]); // Add missing dependencies
  
  // Function to pause auto-scroll on hover/touch
  const handleAnnouncementMouseEnter = () => {
    // Store current scroll position
    const currentPos = announcementSliderRef.current?.scrollLeft || 0;
    setScrollPosition(currentPos);
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
    
    // Get all announcement items including clones
    const announceItems = slider.querySelectorAll('.announcement-item');
    if (announceItems.length === 0) return;
    
    // Calculate number of original items (total items / 2 since we cloned them)
    const totalOriginalItems = Math.ceil(announceItems.length / 2);
    const firstItemWidth = announceItems[0].offsetWidth + 12; // Width + gap
    const totalScrollWidth = totalOriginalItems * firstItemWidth;
    
    // Resume from current position
    startAutoScroll(slider, totalScrollWidth);
  };
  
  // Toggle pause/play for the announcement slider
  const toggleAnnouncementPause = () => {
    setIsPaused(prev => !prev);
  };

  // Function to make testimonial slider more accessible
  const initTestimonialSlider = React.useCallback(() => {
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
  }, []);
  
  // Fetch news data from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);
        
        // Get featured news first - these are typically the most important ones
        const response = await getFeaturedNews();
        
        if (response && Array.isArray(response.news)) {
          // Sort news by date (newest first) in case they aren't already sorted
          const sortedNews = response.news.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          // Take the first 3 news items or less if fewer are available
          setNewsData(sortedNews.slice(0, 3));
        } else {
          setNewsError("No news data available");
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsError("Failed to fetch latest news");
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []); // Empty dependency array means this runs once on component mount

  // Fetch statistics data from various APIs
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Start with loading state
        setStats(prevStats => ({ ...prevStats, isLoading: true }));
        
        // Fetch faculty count
        const facultyResponse = await api.get('/api/faculty');
        const facultyCount = facultyResponse?.data?.length || 0;
        
        // Fetch clubs count
        const clubsResponse = await api.get('/api/clubs');
        const clubsCount = clubsResponse?.data?.clubs?.length || 0;
        
        // Fetch events (both university events and club events)
        const universityEventsResponse = await api.get('/api/events/university');
        const universityEventsCount = universityEventsResponse?.data?.events?.length || 0;
        
        // Calculate club events by iterating through clubs
        let clubEventsCount = 0;
        if (clubsResponse?.data?.clubs) {
          clubsResponse.data.clubs.forEach(club => {
            if (club.events && Array.isArray(club.events)) {
              clubEventsCount += club.events.length;
            }
          });
        }
        
        // Get total events count
        const eventsCount = universityEventsCount + clubEventsCount;
        
        // Count schools from academicDataUtils.js
        // We already know there are 11 academic schools from the data
        const schoolsCount = 11;
        
        // Fetch student count directly from MongoDB through the API
        let studentsCount = 0;
        try {
          // Call our new stats API endpoint that will return all user counts
          const usersResponse = await api.get('/api/auth/stats');
          
          if (usersResponse?.data?.success && usersResponse?.data?.studentCount) {
            studentsCount = usersResponse.data.studentCount;
            console.log(`Fetched student count from API: ${studentsCount}`);
          } else {
            console.log('Stats endpoint returned invalid data format');
            studentsCount = 2500; // Fallback value
          }
        } catch (error) {
          console.error('Error fetching student count from MongoDB:', error);
          // Fallback to an approximation if API fails
          studentsCount = 2500;
        }
        
        // Update all statistics at once
        setStats({
          facultyCount: facultyCount.toString(),
          clubsCount: clubsCount.toString(),
          eventsCount: eventsCount.toString(),
          studentsCount: studentsCount.toString(),
          schoolsCount: schoolsCount.toString(),
          isLoading: false
        });
        
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Keep using default values in case of error
        setStats(prevStats => ({ ...prevStats, isLoading: false }));
      }
    };
    
    fetchStats();
  }, []);

  // Fetch Campus Highlights from API
  const fetchCampusHighlights = React.useCallback(async () => {
    setHighlightsLoading(true);
    try {
      const response = await api.get('/api/campus-highlights');
      if (response.data && response.data.highlights) {
        setCampusHighlights(response.data.highlights);
        console.log('Fetched campus highlights:', response.data.highlights);
      } else {
        console.log('No highlights found in API response, using fallback data');
        setCampusHighlights(fallbackGalleryImages);
      }
    } catch (error) {
      console.error('Error fetching campus highlights:', error);
      setHighlightsError(error);
      // Use fallback data on error
      setCampusHighlights(fallbackGalleryImages);
    } finally {
      setHighlightsLoading(false);
    }
  }, [fallbackGalleryImages]); // Include fallbackGalleryImages in dependencies since it's used inside

  useEffect(() => {
    fetchCampusHighlights();
  }, [fetchCampusHighlights]); // Include fetchCampusHighlights in the dependency array

  // Function to open the highlight detail modal
  const openHighlightDetail = (highlight) => {
    setSelectedHighlight(highlight);
    setShowHighlightDetail(true);
  };
  
  // Function to close the highlight detail modal
  const closeHighlightDetail = () => {
    setShowHighlightDetail(false);
    setTimeout(() => setSelectedHighlight(null), 300); // Clear data after animation
  };

  return (
    <div className="home-page container-fluid">
      {/* Hero Section with Video Background - Full Width */}
      <section className="hero full-width relative min-h-[100vh] h-auto flex flex-col items-center justify-center overflow-hidden text-white">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          <video 
            className="absolute min-w-full min-h-full"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ 
              objectFit: 'cover', 
              width: '100%',
              height: '100%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <source src="https://res.cloudinary.com/dmny4ymqp/video/upload/v1746422364/My_Movie_3_qusqvn.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="absolute bottom-12 left-0 right-0 z-10 w-full">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#features" className="bg-primary-red text-white font-semibold px-6 py-3 rounded-lg transform transition hover:scale-105 hover:bg-secondary-red hover:shadow-lg">Explore Features</a>
            <Link to="/clubs-events" className="bg-white text-primary-red font-semibold px-6 py-3 rounded-lg transform transition hover:scale-105 hover:bg-opacity-90 hover:shadow-lg">Upcoming Events</Link>
          </div>
        </div>
      </section>

      {/* Announcement Banner - Full Width */}
      <section className="bg-red-light py-0.5 overflow-hidden">
        <div className="content-container px-0">
          <div 
            className="announcement-slider relative"
            ref={announcementSliderRef}
            onMouseEnter={handleAnnouncementMouseEnter}
            onMouseLeave={handleAnnouncementMouseLeave}
            onTouchStart={handleAnnouncementMouseEnter}
            onTouchEnd={handleAnnouncementMouseLeave}
            aria-label="Announcements"
          >
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-item flex items-center gap-2 md:gap-3 whitespace-nowrap px-2 md:px-4 py-1 min-w-[280px]">
                  <i className={`fas fa-${announcement.icon} text-primary-red text-sm md:text-base`}></i>
                  <span className="text-dark-gray text-sm md:text-base truncate flex-1">{announcement.text}</span>
                  <button 
                    type="button" 
                    className="text-primary-red font-semibold hover:underline bg-transparent border-0 cursor-pointer text-sm md:text-base whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnnouncementClick(announcement.link);
                    }}
                    data-link={announcement.link}
                  >
                    {announcement.buttonText}
                  </button>
                </div>
              ))
            ) : (
              // Display a scrolling "No announcements" message
              <div className="announcement-item flex items-center gap-2 md:gap-3 whitespace-nowrap px-2 md:px-4 py-1 min-w-[280px] animate-pulse">
                <i className="fas fa-info-circle text-primary-red text-sm md:text-base"></i>
                <span className="text-dark-gray text-sm md:text-base truncate flex-1">No announcements at this time</span>
                <span className="text-primary-red font-semibold text-sm md:text-base whitespace-nowrap opacity-0">
                  ‎ {/* Invisible character to maintain layout */}
                </span>
              </div>
            )}
          </div>
          
          {announcements.length > 0 && (
            <div className="announcement-controls flex justify-end mt-0 px-4">
              <button 
                type="button" 
                onClick={toggleAnnouncementPause} 
                className="text-[10px] text-primary-red py-0 px-1.5 rounded hover:bg-red-100 transition-colors"
                aria-label={isPaused ? "Resume announcements" : "Pause announcements"}
              >
                <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'} mr-0.5`}></i> 
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
          )}
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
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">Campus Calendars</h3>
              <p className="text-medium-gray mb-6 leading-relaxed">Stay updated with academic schedules, campus events, workshops, seminars, and activities</p>
              <Link to="/college/academic-calendar" className="feature-link inline-flex items-center text-primary-red font-semibold">
                View Calendars <i className="fas fa-arrow-right ml-2 transition-transform"></i>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-red-light w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-bookmark text-2xl text-primary-red"></i>
              </div>
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">Booking System</h3>
              <p className="text-medium-gray mb-6 leading-relaxed">Reserve faculty appointments, presentation slots, and campus facilities with our streamlined system</p>
              <Link to="/college/bookings?tab=bookings" className="feature-link inline-flex items-center text-primary-red font-semibold">
                Make Bookings <i className="fas fa-arrow-right ml-2 transition-transform"></i>
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
              <Link to="/college?tab=news" className="feature-link inline-flex items-center text-primary-red font-semibold">
                Read News <i className="fas fa-arrow-right ml-2 transition-transform"></i>
              </Link>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">
                {stats.isLoading ? (
                  <div className="inline-block w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : parseInt(stats.facultyCount) > 0 ? (
                  stats.facultyCount
                ) : (
                  "300+"
                )}
              </span>
              <span className="text-lg text-white text-opacity-90">Faculty Members</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">
                {stats.isLoading ? (
                  <div className="inline-block w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : parseInt(stats.clubsCount) > 0 ? (
                  stats.clubsCount
                ) : (
                  "40+"
                )}
              </span>
              <span className="text-lg text-white text-opacity-90">Campus Clubs</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">
                {stats.isLoading ? (
                  <div className="inline-block w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : parseInt(stats.eventsCount) > 0 ? (
                  stats.eventsCount
                ) : (
                  "80+"
                )}
              </span>
              <span className="text-lg text-white text-opacity-90">Annual Events</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">
                {stats.isLoading ? (
                  <div className="inline-block w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : parseInt(stats.studentsCount) > 0 ? (
                  stats.studentsCount
                ) : (
                  "2500+"
                )}
              </span>
              <span className="text-lg text-white text-opacity-90">Students Enrolled</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold mb-2 leading-none">
                {stats.isLoading ? (
                  <div className="inline-block w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : parseInt(stats.schoolsCount) > 0 ? (
                  stats.schoolsCount
                ) : (
                  "11"
                )}
              </span>
              <span className="text-lg text-white text-opacity-90">Academic Schools</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Latest News Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="content-container px-4 md:px-6">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-center text-dark-gray mb-12 md:mb-14">Latest Campus Updates</h2>
          
          {newsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
            </div>
          ) : newsError ? (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4">{newsError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-secondary-red transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                {newsData.length > 0 ? (
                  newsData.map((news, index) => {
                    // Parse the date string to extract day and month
                    const dateObj = new Date(news.createdAt);
                    const day = dateObj.getDate();
                    const month = dateObj.toLocaleString('default', { month: 'short' });
                    
                    return (
                      <div 
                        key={`news-${news._id || index}`} 
                        className="news-card rounded-xl overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={news.image || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='500' height='300' fill='%23f0f0f0'/%3E%3Ctext x='250' y='150' font-size='36' text-anchor='middle' fill='%23666'%3ENews%3C/text%3E%3C/svg%3E`} 
                            alt={news.title} 
                            className="w-full h-full object-cover transition-transform duration-500" 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='500' height='300' fill='%23f0f0f0'/%3E%3Ctext x='250' y='150' font-size='36' text-anchor='middle' fill='%23666'%3ENews%3C/text%3E%3C/svg%3E`;
                            }}
                          />
                          <div className="absolute top-4 left-4 bg-primary-red text-white rounded-md p-2 text-center z-10">
                            <span className="block text-2xl font-bold">{day}</span>
                            <span className="block text-sm">{month}</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <span className="inline-block bg-red-light text-primary-red text-xs font-semibold px-3 py-1 rounded-md mb-3">
                            {news.categoryLabel || news.category}
                          </span>
                          <h3 className="text-xl font-semibold text-dark-gray mb-3 leading-tight">{news.title}</h3>
                          <p className="text-medium-gray mb-5">{news.excerpt}</p>
                          <Link 
                            to={`/college?tab=news&id=${news._id}`}
                            className="news-link inline-flex items-center text-primary-red font-semibold"
                          >
                            Read More <i className="fas fa-long-arrow-alt-right ml-2"></i>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-1 md:col-span-3 text-center py-10">
                    <p className="text-gray-600">No news items available at the moment.</p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <Link 
                  to="/college?tab=news" 
                  className="px-6 py-3 border-2 border-dark-gray text-dark-gray font-semibold rounded-lg hover:bg-dark-gray hover:text-white transition-colors"
                >
                  View All News
                </Link>
              </div>
            </>
          )}
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
              <img src="https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp" alt="Mahindra University Campus" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Campus Gallery Preview */}
      <section id="campus-highlights" className="py-16 md:py-20 bg-dark-gray text-white">
        <div className="content-container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center mb-8 md:mb-10 text-center">
            <h2 className="section-title text-3xl md:text-4xl font-bold text-white mb-4">
              <span className="relative">
                Campus Life Highlights
              </span>
            </h2>
          </div>
          
          <p className="text-center text-light-gray max-w-3xl mx-auto mb-10 leading-relaxed">
            Take a glimpse of campus life at Mahindra University. From modern facilities to vibrant cultural experiences, here's a preview of what our campus offers.
          </p>
          
          {highlightsLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : highlightsError ? (
            <div className="text-center text-light-gray py-10">
              <p className="mb-4">Unable to load campus highlights.</p>
              <button 
                className="px-4 py-2 bg-primary-red text-white rounded-lg"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Show only first 3 highlights on home page */}
              {campusHighlights.slice(0, 3).map((item) => (
                <div key={item._id || item.id} className="group relative h-[280px] rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e6e6e6'/%3E%3Crect x='50' y='50' width='200' height='100' fill='%23d0d0d0'/%3E%3Ctext x='150' y='175' font-size='16' text-anchor='middle' fill='%23666'%3E${encodeURIComponent(item.title)}%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary-red bg-opacity-80 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
                    <i className={`${item.icon} text-white`}></i>
                  </div>

                  {/* Edit button for admins */}
                  {currentUser && currentUser.role === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingHighlight(item);
                        setShowHighlightModal(true);
                      }}
                      className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white flex items-center justify-center transform transition-transform duration-300 hover:scale-110 z-20"
                      title="Edit highlight"
                    >
                      <i className="fas fa-edit text-primary-red"></i>
                    </button>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5 transform transition-transform duration-300">
                    <h3 className="font-semibold text-xl text-white mb-1">{item.title}</h3>
                    <p className="text-light-gray text-sm mb-3">{item.description}</p>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => openHighlightDetail(item)}
                        className="bg-primary-red hover:bg-secondary-red transition-colors px-3 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        <i className="fas fa-info-circle text-xs"></i> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Updated CTA section for the complete gallery */}
          <div className="text-center flex flex-col items-center mt-12">
            <Link 
              to="/college?tab=overview#campus-highlights" 
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors inline-flex items-center gap-2"
            >
              View Complete Campus Gallery <i className="fas fa-arrow-right"></i>
            </Link>
            <p className="text-light-gray text-sm mt-4 max-w-lg mx-auto">
              Discover our full gallery with comprehensive campus highlights, facilities, and cultural experiences in the College section.
            </p>
          </div>
        </div>
      </section>

      {/* Image View Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              aria-label="Close modal"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
            <div className="flex flex-col items-center">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.title || "Campus highlight"} 
                className="max-h-[70vh] max-w-full object-contain"
              />
              <div className="text-white text-center mt-4">
                <h3 className="text-xl font-semibold">{selectedImage.title}</h3>
                <p className="text-gray-300 mt-2">{selectedImage.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Campus Highlight Modal */}
      {showHighlightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingHighlight ? 'Edit Campus Highlight' : 'Add Campus Highlight'}
                </h2>
                <button 
                  onClick={() => setShowHighlightModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <CampusHighlightForm 
                highlight={editingHighlight} 
                onClose={() => setShowHighlightModal(false)}
                onSuccess={() => {
                  setShowHighlightModal(false);
                  // Refresh the highlights list
                  fetchCampusHighlights();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Highlight Detail Modal */}
      {showHighlightDetail && selectedHighlight && (
        <CampusHighlightDetail 
          highlight={selectedHighlight} 
          onClose={closeHighlightDetail} 
        />
      )}

      {/* Call to Action Section - Only show for non-logged in users */}
      {!currentUser && (
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary-red to-secondary-red text-white text-center">
          <div className="content-container px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Ready to Connect with Campus Life?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 opacity-90">Join MU-UniConnect today to stay informed about university activities, connect with faculty, and engage with campus organizations.</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
              <Link to="/signup" className="px-6 md:px-8 py-3 md:py-4 bg-white text-primary-teal font-semibold rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 text-base md:text-lg">Sign Up</Link>
              <a href="#features" className="px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition text-base md:text-lg">Explore Features</a>
            </div>
            <div className="mt-8">
            </div>
          </div>
        </section>
      )}

      {/* Footer Section */}
      <footer className="bg-white text-gray-800 py-12 md:py-16 pb-0 md:pb-0">
        <div className="content-container px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-2">
            <div>
              <img 
                src="/img/uniconnectTB.png" 
                alt="MU-UniConnect Logo" 
                className="max-w-[150px] mb-4"
                width="150"
                height="38" 
              />
              <p className="text-gray-600 text-sm">Connecting campus. Building community.</p>
            </div>
            
            <div>
              <h4 className="text-xl text-gray-900 font-semibold mb-6 pb-2 border-b border-primary-red inline-block">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-600 hover:text-primary-red hover:underline transition">Home</Link></li>
                <li><Link to="/faculty" className="text-gray-600 hover:text-primary-red hover:underline transition">Faculty</Link></li>
                <li><Link to="/clubs-events" className="text-gray-600 hover:text-primary-red hover:underline transition">Clubs & Events</Link></li>
                <li><Link to="/college" className="text-gray-600 hover:text-primary-red hover:underline transition">College</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl text-gray-900 font-semibold mb-6 pb-2 border-b border-primary-red inline-block">Contact</h4>
              <div className="space-y-4">
                <p className="flex items-center text-gray-600">
                  <i className="fas fa-map-marker-alt text-primary-red mr-3 w-5"></i> Mahindra University, Hyderabad
                </p>
                <p className="flex items-center text-gray-600">
                  <i className="fas fa-envelope text-primary-red mr-3 w-5"></i> info@uniconnect.mahindra.edu
                </p>
                <p className="flex items-center text-gray-600">
                  <i className="fas fa-phone text-primary-red mr-3 w-5"></i> (040) 6722-0000
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl text-gray-900 font-semibold mb-6 pb-2 border-b border-primary-red inline-block">Follow Us</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/MahindraUni" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-primary-red hover:bg-primary-red hover:text-white hover:-translate-y-1 transition-all">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://x.com/MahindraUni" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-primary-red hover:bg-primary-red hover:text-white hover:-translate-y-1 transition-all">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://www.instagram.com/mahindrauni/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-primary-red hover:bg-primary-red hover:text-white hover:-translate-y-1 transition-all">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://www.linkedin.com/school/mahindra-unversity/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-primary-red hover:bg-primary-red hover:text-white hover:-translate-y-1 transition-all">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="https://www.youtube.com/c/MahindraecolecentraleEduIn14/featured" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-primary-red hover:bg-primary-red hover:text-white hover:-translate-y-1 transition-all">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
          
          {/* Footer bottom border with minimal padding */}
          <hr className="border-t border-gray-200" />
        </div>
      </footer>
    </div>
  );
}

export default Home;
