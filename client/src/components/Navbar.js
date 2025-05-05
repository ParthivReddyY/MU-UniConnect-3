import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../contexts/AuthContext';

// Enhanced NavLink component with dropdown support
const NavLink = memo(({ to, isActive, children, hasDropdown, dropdownContent }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Only display dropdown if it has content and we're on desktop
  const handleMouseEnter = () => {
    if (hasDropdown && window.innerWidth >= 768) {
      setShowDropdown(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (hasDropdown) {
      setShowDropdown(false);
    }
  };
  
  return (
    <div 
      className={`nav-item ${hasDropdown ? 'has-dropdown' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link 
        to={to} 
        className={`${isActive ? 'active' : ''}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {children}
        {hasDropdown && <i className="fas fa-chevron-down text-xs ml-1.5 transition-transform duration-300" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}></i>}
      </Link>
      
      {hasDropdown && showDropdown && (
        <>
          {/* Invisible connector to prevent hover gap issues */}
          <div className="dropdown-connector"></div>
          <div className="nav-dropdown">
            {dropdownContent}
          </div>
        </>
      )}
    </div>
  );
});

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, logout } = useAuth();

  // Optimized scroll handler with debounce concept
  const handleScroll = useCallback(() => {
    const shouldBeScrolled = window.scrollY > 50;
    if (shouldBeScrolled !== scrolled) {
      setScrolled(shouldBeScrolled);
    }
  }, [scrolled]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showProfileMenu && 
          !event.target.closest('.auth-section') && 
          !event.target.closest('.auth-section-mobile')) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Attach scroll listener with performance optimization
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const toggleMenu = () => {
    setMenuOpen(prevState => !prevState);
  };

  const isActive = (path) => location.pathname === path;

  // Auth button handler
  const handleAuthClick = () => {
    if (currentUser) {
      // Show dropdown menu for logged in users
      setShowProfileMenu(!showProfileMenu);
    } else {
      // Redirect to login page for logged out users
      navigate('/login');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  // Get role-specific class for badge
  const getRoleBadgeClass = (role) => {
    if (role === 'admin') return 'admin';
    if (role === 'faculty') return 'faculty';
    return '';
  };
  
  // Function for profile dropdown content - reused in both mobile and desktop
  const renderProfileDropdown = () => (
    <div className="profile-dropdown">
      <div className="profile-dropdown-header">
        <p className="name truncate">{currentUser.name}</p>
        <p className="email truncate">{currentUser.email}</p>
        <div className={`role-badge ${getRoleBadgeClass(currentUser.role)}`}>
          {currentUser.role}
        </div>
      </div>
      
      <Link 
        to="/dashboard" 
        className="block text-sm menu-item-dashboard"
        onClick={() => setShowProfileMenu(false)}
      >
        <i className="fas fa-tachometer-alt"></i> Dashboard
      </Link>
      
      <Link 
        to="/profile" 
        className="block text-sm menu-item-profile"
        onClick={() => setShowProfileMenu(false)}
      >
        <i className="fas fa-user-circle"></i> My Profile
      </Link>
      
      {currentUser.role === 'admin' && (
        <Link 
          to="/admin/dashboard" 
          className="block text-sm menu-item-admin"
          onClick={() => setShowProfileMenu(false)}
        >
          <i className="fas fa-shield-alt"></i> Admin Panel
        </Link>
      )}
      
      <button
        className="w-full text-left block text-sm sign-out-btn"
        onClick={handleLogout}
      >
        <i className="fas fa-sign-out-alt"></i> Sign out
      </button>
    </div>
  );

  // Common NavLinks configuration used in both mobile and desktop
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
              <i className="fas fa-flask text-green-600"></i>
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

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} role="banner">
      {/* DESKTOP NAVIGATION - Hidden on mobile */}
      <div className="desktop-navbar hidden md:flex justify-between items-center w-full max-w-7xl mx-auto">
        {/* Desktop Logo */}
        <div className="desktop-logo">
          <Link to="/">
            <img 
              src="/img/uniconnectTB.png" 
              alt="UniConnect Logo" 
              className="desktop-logo-image" 
              width="234"  /* Increased by 30% from 180 */
              height="59"  /* Increased by 30% from 45 */
            />
          </Link>
        </div>
        
        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links" aria-label="Main navigation">
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

        {/* Desktop Auth Button */}
        <div className="desktop-auth-section">
          <button 
            className="auth-icon-btn relative group" 
            onClick={handleAuthClick}
            title={currentUser ? "Account menu" : "Login"}
            aria-label={currentUser ? "Account menu" : "Login"}
          >
            {currentUser ? (
              <span className="w-full h-full flex items-center justify-center overflow-hidden">
                {currentUser.profileImage && currentUser.profileImage !== 'default-profile.png' ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover border-2 border-white"
                    src={currentUser.profileImage} 
                    alt={`${currentUser.name}'s profile`}
                  />
                ) : (
                  <i className="fas fa-user text-white"></i>
                )}
              </span>
            ) : (
              <i className="fas fa-user text-white"></i>
            )}
          </button>
          
          {/* Desktop profile dropdown */}
          {showProfileMenu && currentUser && renderProfileDropdown()}
        </div>
      </div>

      {/* MOBILE NAVIGATION - Hidden on desktop */}
      <div className="mobile-navbar md:hidden w-full">
        <div className={`mobile-header-container ${menuOpen ? 'menu-open' : ''}`}>
          {/* Top bar with logo and controls */}
          <div className="mobile-header-top">
            {/* Mobile Logo - Smaller than desktop */}
            <div className="mobile-logo">
              <Link to="/">
                <img 
                  src="/img/uniconnectTB.png" 
                  alt="UniConnect Logo" 
                  className="mobile-logo-image" 
                  width="140"
                  height="35" 
                />
              </Link>
            </div>
            
            {/* Right side controls */}
            <div className="mobile-controls">
              {/* Auth button on mobile */}
              <div className="mobile-auth-section">
                <button 
                  className="auth-icon-btn mobile-auth-btn"
                  onClick={handleAuthClick}
                  title={currentUser ? "Account menu" : "Login"}
                  aria-label={currentUser ? "Account menu" : "Login"}
                >
                  {currentUser ? (
                    <span className="flex items-center justify-center w-full h-full overflow-hidden">
                      {currentUser.profileImage && currentUser.profileImage !== 'default-profile.png' ? (
                        <img
                          className="h-7 w-7 rounded-full object-cover border-2 border-white"
                          src={currentUser.profileImage} 
                          alt={`${currentUser.name}'s profile`}
                        />
                      ) : (
                        <i className="fas fa-user text-white"></i>
                      )}
                    </span>
                  ) : (
                    <i className="fas fa-user text-white"></i>
                  )}
                </button>
                
                {/* Mobile profile dropdown */}
                {showProfileMenu && currentUser && renderProfileDropdown()}
              </div>
              
              {/* Mobile menu button */}
              <button 
                className="mobile-menu-button"
                onClick={toggleMenu} 
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} aria-hidden="true"></i>
              </button>
            </div>
          </div>

          {/* Mobile menu content - Only shown when menu is open */}
          <div 
            className={`mobile-menu ${menuOpen ? 'show' : ''}`} 
            id="mobile-navigation"
          >
            {/* Mobile Navigation Links */}
            <nav className="mobile-nav-links" aria-label="Mobile navigation">
              {navLinks.map((link, index) => (
                <Link 
                  key={`mobile-${index}`}
                  to={link.to}
                  className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
