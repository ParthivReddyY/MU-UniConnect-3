import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation, NavLink as RouterNavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// NavLink component with dropdown support
const NavLink = ({ to, children, isActive, hasDropdown, dropdownContent }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const linkRef = useRef(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    if (!showDropdown) return;
    
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !linkRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showDropdown]);

  return (
    <div className="nav-item" onMouseLeave={() => setShowDropdown(false)}>
      <RouterNavLink 
        to={to}
        ref={linkRef}
        className={`${isActive ? 'active' : ''}`}
        onMouseEnter={() => hasDropdown && setShowDropdown(true)}
        onClick={() => !hasDropdown && setShowDropdown(false)}
        aria-expanded={hasDropdown && showDropdown ? 'true' : 'false'}
        aria-haspopup={hasDropdown ? 'true' : undefined}
      >
        {children}
      </RouterNavLink>
      
      {hasDropdown && showDropdown && (
        <>
          <div className="dropdown-connector" aria-hidden="true"></div>
          <div className="nav-dropdown" ref={dropdownRef} role="menu">
            {dropdownContent}
          </div>
        </>
      )}
    </div>
  );
};

// MobileNavLink component
const MobileNavLink = ({ to, label, hasDropdown, dropdownContent, isActive, onClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const toggleDropdown = (e) => {
    e.preventDefault();
    setShowDropdown(prev => !prev);
  };
  
  const handleLinkClick = () => {
    // Close dropdown and run the onClick handler
    setShowDropdown(false);
    if (onClick) onClick();
  };
  
  return (
    <div className="mobile-nav-item">
      <div className="mobile-nav-link-wrapper">
        {hasDropdown ? (
          <button 
            className={`mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={toggleDropdown}
            aria-expanded={showDropdown ? 'true' : 'false'}
          >
            <span>{label}</span>
            <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`} aria-hidden="true"></i>
          </button>
        ) : (
          <RouterNavLink 
            to={to} 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            {label}
          </RouterNavLink>
        )}
      </div>
      
      {hasDropdown && (
        <div className={`mobile-dropdown-content ${showDropdown ? 'expanded' : ''}`}>
          {dropdownContent}
        </div>
      )}
    </div>
  );
};

// Mobile-specific component
const MobileNavbar = ({ navLinks, currentUser, isActive, handleAuthClick, handleLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  
  // Toggle mobile menu visibility
  const toggleMenu = () => {
    setShowMenu(prev => !prev);
    // Close profile dropdown when toggling menu
    if (showProfileDropdown) setShowProfileDropdown(false);
  };
  
  // Toggle profile dropdown
  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setShowProfileDropdown(prev => !prev);
  };
  
  // Close menu when clicking a link
  const handleNavLinkClick = () => {
    setShowMenu(false);
    setShowProfileDropdown(false);
  };
  
  // Handle clicking outside to close profile dropdown
  useEffect(() => {
    if (!showProfileDropdown) return;
    
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);
  
  // Transform dropdown content for mobile view
  const transformDropdownContent = (content) => {
    // Check if content is a React element
    if (!content || typeof content.type !== 'function') {
      return content;
    }
    
    // Clone the element to transform its children
    return React.cloneElement(content, {}, 
      React.Children.map(content.props.children, section => {
        if (!section || section.type !== 'div' || !section.props.className.includes('dropdown-section')) {
          return section;
        }
        
        return (
          <div className="mobile-dropdown-section">
            <h3 className="mobile-dropdown-title">
              {section.props.children.find(child => 
                child.type === 'h3' && child.props.className.includes('dropdown-title')
              )?.props.children}
            </h3>
            <div className="mobile-dropdown-links">
              {React.Children.map(section.props.children, child => {
                if (child.type === Link) {
                  return (
                    <Link 
                      to={child.props.to} 
                      className="mobile-dropdown-link" 
                      onClick={handleNavLinkClick}
                    >
                      <span className="mobile-dropdown-icon">
                        {child.props.children.find(c => c.type === 'i')}
                      </span>
                      <div className="mobile-dropdown-text">
                        <span className="mobile-dropdown-title-text">
                          {child.props.children.find(c => c.type === 'div')?.props.children[0]?.props.children}
                        </span>
                        <span className="mobile-dropdown-desc-text">
                          {child.props.children.find(c => c.type === 'div')?.props.children[1]?.props.children}
                        </span>
                      </div>
                    </Link>
                  );
                }
                return child;
              })}
            </div>
          </div>
        );
      })
    );
  };
  
  return (
    <div className="mobile-navbar md:hidden">
      <div className="mobile-header-container">
        <div className="mobile-header-top">
          <div className="mobile-logo">
            <Link to="/" aria-label="MU-UniConnect Home">
              <img 
                src="/img/uniconnectTB.png" 
                alt="UniConnect Logo" 
                className="mobile-logo-image" 
                width="180"
                height="45"
              />
            </Link>
          </div>
          
          <div className="mobile-controls">
            {/* Use consistent profile icon style for both logged-in and non-logged-in states */}
            <div className="mobile-auth-section relative">
              <button 
                ref={profileButtonRef}
                className="flex items-center focus:outline-none" 
                onClick={currentUser ? toggleProfileDropdown : handleAuthClick}
                aria-label={currentUser ? "Profile" : "Sign in"}
                aria-haspopup={currentUser ? "true" : "false"}
                aria-expanded={currentUser && showProfileDropdown ? 'true' : 'false'}
                title={currentUser ? "Profile" : "Login"}
                data-tooltip={currentUser ? "Profile" : "Login"}
              >
                <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  <span className="text-primary-red font-semibold text-base">
                    <i className="fas fa-user"></i>
                  </span>
                </div>
              </button>
              
              {currentUser && showProfileDropdown && (
                <div 
                  ref={profileDropdownRef}
                  className="mobile-profile-dropdown"
                  role="menu"
                >
                  <Link 
                    to="/profile" 
                    className="profile-dropdown-item"
                    onClick={() => setShowProfileDropdown(false)}
                    role="menuitem"
                  >
                    <i className="fas fa-user-circle"></i> 
                    <span>View Profile</span>
                  </Link>
                  
                  <Link 
                    to="/dashboard" 
                    className="profile-dropdown-item"
                    onClick={() => setShowProfileDropdown(false)}
                    role="menuitem"
                  >
                    <i className="fas fa-tachometer-alt"></i> 
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link 
                    to="/change-password" 
                    className="profile-dropdown-item"
                    onClick={() => setShowProfileDropdown(false)}
                    role="menuitem"
                  >
                    <i className="fas fa-key"></i> 
                    <span>Change Password</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="profile-dropdown-item profile-dropdown-item-logout"
                    role="menuitem"
                  >
                    <i className="fas fa-sign-out-alt"></i> 
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
            <button 
              className="mobile-menu-button"
              onClick={toggleMenu}
              aria-expanded={showMenu ? 'true' : 'false'}
              aria-label="Toggle navigation menu"
            >
              <i className={`fas fa-${showMenu ? 'times' : 'bars'}`} aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
      
      {showMenu && (
        <>
          <div className="mobile-menu-overlay" onClick={toggleMenu} aria-hidden="true"></div>
          <div className={`mobile-menu ${showMenu ? 'show' : ''}`} role="navigation">
            <nav className="mobile-nav-links" aria-label="Mobile navigation">
              {navLinks.map((link, index) => (
                <MobileNavLink 
                  key={`mobile-${index}`}
                  to={link.to} 
                  label={link.label}
                  isActive={isActive(link.to)}
                  hasDropdown={link.hasDropdown}
                  dropdownContent={link.hasDropdown ? transformDropdownContent(link.dropdownContent) : null}
                  onClick={handleNavLinkClick}
                />
              ))}
              
              {/* Remove the profile section from the hamburger menu since we now have a dropdown */}
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

// Desktop-specific component with shared state handling
const DesktopNavbar = ({ navLinks, currentUser, isActive, handleAuthClick, handleLogout }) => {
  const desktopNavRef = useRef(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // Handle clicking outside to close profile dropdown
  useEffect(() => {
    if (!showProfileDropdown) return;
    
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);
  
  return (
    <div className="desktop-navbar hidden md:flex" ref={desktopNavRef}>
      <div className="desktop-logo">
        <Link to="/" aria-label="MU-UniConnect Home">
          <img 
            src="/img/uniconnectTB.png" 
            alt="UniConnect Logo" 
            className="desktop-logo-image" 
            width="280"
            height="70"
          />
        </Link>
      </div>
      
      <nav className="desktop-nav-links mx-auto" aria-label="Main navigation">
        {navLinks.map((link, index) => (
          <NavLink 
            key={`desktop-${index}`}
            to={link.to} 
            isActive={isActive(link.to)}
            hasDropdown={link.hasDropdown}
            dropdownContent={link.dropdownContent}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Profile icon for both authenticated and non-authenticated users */}
      <div className="desktop-auth-section relative">
        <button 
          className="flex items-center space-x-2 focus:outline-none rounded-full hover:ring-2 hover:ring-red-100 transition-all duration-200 p-1"
          onClick={() => currentUser ? setShowProfileDropdown(!showProfileDropdown) : handleAuthClick()}
          aria-haspopup={currentUser ? "true" : "false"}
          aria-expanded={currentUser && showProfileDropdown ? 'true' : 'false'}
          title={currentUser ? "Profile" : "Login"}
          data-tooltip={currentUser ? "Profile" : "Login"}
        >
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <span className="text-primary-red font-semibold text-lg">
              <i className="fas fa-user"></i>
            </span>
          </div>
        </button>
        
        {currentUser && showProfileDropdown && (
          <div 
            ref={profileDropdownRef}
            className="profile-dropdown"
            role="menu"
          >
            <div className="flex flex-col">
              <Link 
                to="/profile" 
                className="profile-dropdown-item"
                onClick={() => setShowProfileDropdown(false)}
                role="menuitem"
              >
                <i className="fas fa-user-circle text-primary-red"></i> 
                <span>View Profile</span>
              </Link>
              
              <Link 
                to="/dashboard" 
                className="profile-dropdown-item"
                onClick={() => setShowProfileDropdown(false)}
                role="menuitem"
              >
                <i className="fas fa-tachometer-alt text-primary-red"></i> 
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to="/change-password" 
                className="profile-dropdown-item"
                onClick={() => setShowProfileDropdown(false)}
                role="menuitem"
              >
                <i className="fas fa-key text-primary-red"></i> 
                <span>Change Password</span>
              </Link>
              
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  handleLogout();
                }}
                className="profile-dropdown-item profile-dropdown-item-logout"
                role="menuitem"
              >
                <i className="fas fa-sign-out-alt"></i> 
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Navbar component with consolidated event handling and shared state
function Navbar() {
  // Shared state variables
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    const scrollThreshold = 50;
    const shouldBeScrolled = window.scrollY > scrollThreshold;
    
    if (shouldBeScrolled !== scrolled) {
      setScrolled(shouldBeScrolled);
    }
  }, [scrolled]);

  // Set up scroll listener
  useEffect(() => {
    handleScroll();
    
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  // Check if current path matches link
  const isActive = useCallback((path) => {
    if (path === '/' && location.pathname !== '/') {
      return false;
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Handle auth button click - direct to profile or login
  const handleAuthClick = () => {
    if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  // Handle logout with proper navigation
  const handleLogout = () => {
    const result = logout();
    if (result.success) {
      // Navigate to home page after logout
      navigate('/');
    }
  };

  // Navigation links data
  const navLinks = [
    {
      to: "/", 
      label: "Home",
      hasDropdown: false
    },
    {
      to: "/clubs-events", 
      label: "Clubs & Events",
      hasDropdown: true,
      dropdownContent: (
        <div className="dropdown-grid">
          <div className="dropdown-section">
            <h3 className="dropdown-title">Clubs</h3>
            <Link to="/clubs-events?filter=technical" className="dropdown-item">
              <i className="fas fa-laptop-code text-blue-600"></i>
              <div>
                <span>Technical Clubs</span>
                <span className="dropdown-description">Coding, Robotics & more</span>
              </div>
            </Link>
            <Link to="/clubs-events?filter=non-technical" className="dropdown-item">
              <i className="fas fa-lightbulb text-orange-600"></i>
              <div>
                <span>Non-Technical Clubs</span>
                <span className="dropdown-description">Business, Entrepreneurship & more</span>
              </div>
            </Link>
            <Link to="/clubs-events?filter=arts" className="dropdown-item">
              <i className="fas fa-music text-purple-600"></i>
              <div>
                <span>Cultural Clubs</span>
                <span className="dropdown-description">Music, Dance & Drama</span>
              </div>
            </Link>
            <Link to="/clubs-events?filter=sports" className="dropdown-item">
              <i className="fas fa-volleyball-ball text-green-600"></i>
              <div>
                <span>Sports Clubs</span>
                <span className="dropdown-description">Athletics & team sports</span>
              </div>
            </Link>
          </div>
          <div className="dropdown-section">
            <h3 className="dropdown-title">Events</h3>
            <Link to="/college?tab=bookings&section=events" className="dropdown-item">
              <i className="fas fa-calendar-day text-primary-red"></i>
              <div>
                <span>Upcoming Events</span>
                <span className="dropdown-description">Don't miss out</span>
              </div>
            </Link>
            <Link to="/clubs-events?type=featured" className="dropdown-item">
              <i className="fas fa-star text-amber-500"></i>
              <div>
                <span>Featured Events</span>
                <span className="dropdown-description">Highlights of the events</span>
              </div>
            </Link>
          </div>
        </div>
      )
    },
    {
      to: "/faculty", 
      label: "Faculty",
      hasDropdown: true,
      dropdownContent: (
        <div className="dropdown-grid">
          <div className="dropdown-section">
            <h3 className="dropdown-title">Faculty Directory</h3>
            <Link to="/faculty?department=engineering" className="dropdown-item">
              <i className="fas fa-cogs text-primary-red"></i>
              <div>
                <span>Engineering Faculty</span>
                <span className="dropdown-description">Meet our engineering professors</span>
              </div>
            </Link>
            <Link to="/faculty?department=science" className="dropdown-item">
              <i class="fas fa-flask text-green-600"></i>
              <div>
                <span>Science Faculty</span>
                <span className="dropdown-description">Physics, Chemistry & more</span>
              </div>
            </Link>
            <Link to="/faculty?department=humanities" className="dropdown-item">
              <i className="fas fa-book text-amber-600"></i>
              <div>
                <span>Humanities Faculty</span>
                <span className="dropdown-description">Languages, Arts & Social Sciences</span>
              </div>
            </Link>
          </div>
          <div className="dropdown-section">
            <h3 className="dropdown-title">Faculty Services</h3>
            <Link to={currentUser && (currentUser.role === 'faculty' || currentUser.role === 'admin') ? "/faculty-appointments" : "/college/bookings/faculty-appointment"} className="dropdown-item">
              <i className="fas fa-calendar-check text-primary-teal"></i>
              <div>
                <span>Faculty Appointments</span>
                <span className="dropdown-description">Schedule meetings</span>
              </div>
            </Link>
            {currentUser && currentUser.role === 'admin' && (
              <Link to="/faculty/research" className="dropdown-item">
                <i className="fas fa-microscope text-blue-600"></i>
                <div>
                  <span>Research Projects</span>
                  <span className="dropdown-description">Ongoing research work</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      )
    },
    {
      to: "/college", 
      label: "College",
      hasDropdown: true,
      dropdownContent: (
        <div className="dropdown-grid">
          <div className="dropdown-section">
            <h3 className="dropdown-title">College Information</h3>
            <Link to="/college?tab=general" className="dropdown-item">
              <i className="fas fa-university text-primary-red"></i>
              <div>
                <span>Overview</span>
                <span className="dropdown-description">About the university</span>
              </div>
            </Link>
            <Link to="/college?tab=news" className="dropdown-item">
              <i className="fas fa-newspaper text-blue-600"></i>
              <div>
                <span>News & Updates</span>
                <span className="dropdown-description">Latest announcements</span>
              </div>
            </Link>
            <Link to="/feedback" className="dropdown-item">
              <i className="fas fa-comment text-primary-teal"></i>
              <div>
                <span>Feedback</span>
                <span className="dropdown-description">Share your thoughts</span>
              </div>
            </Link>
          </div>
          <div className="dropdown-section">
            <h3 className="dropdown-title">Campus Services</h3>
            <Link to="/college?tab=calendar" className="dropdown-item">
              <i className="fas fa-calendar-alt text-purple-600"></i>
              <div>
                <span>Academic Calendar</span>
                <span className="dropdown-description">Important dates & events</span>
              </div>
            </Link>
            <Link to="/college?tab=bookings" className="dropdown-item">
              <i className="fas fa-ticket-alt text-amber-600"></i>
              <div>
                <span>Bookings</span>
                <span className="dropdown-description">Reserve facilities</span>
              </div>
            </Link>
            <Link to="/college?tab=hostel" className="dropdown-item">
              <i className="fas fa-home text-green-600"></i>
              <div>
                <span>Hostel Maintenance</span>
                <span className="dropdown-description">Lodge complaints</span>
              </div>
            </Link>
            <Link to="/college?tab=map" className="dropdown-item">
              <i className="fas fa-map-marked-alt text-primary-teal"></i>
              <div>
                <span>Campus Map</span>
                <span className="dropdown-description">Navigate the campus</span>
              </div>
            </Link>
          </div>
        </div>
      )
    }
  ];

  // Render the navbar with both desktop and mobile components
  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} role="banner">
      <DesktopNavbar 
        navLinks={navLinks}
        currentUser={currentUser}
        isActive={isActive}
        handleAuthClick={handleAuthClick}
        handleLogout={handleLogout}
      />
      <MobileNavbar 
        navLinks={navLinks}
        currentUser={currentUser}
        isActive={isActive}
        handleAuthClick={handleAuthClick}
        handleLogout={handleLogout}
      />
    </header>
  );
}

export default Navbar;