import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../contexts/AuthContext';

// Optimized NavLink component with proper dropdown handling - used only for desktop
const NavLink = memo(({ to, isActive, children, hasDropdown, dropdownContent }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
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
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  return (
    <div 
      ref={dropdownRef}
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
        {hasDropdown && (
          <i 
            className="fas fa-chevron-down text-xs ml-1.5 transition-transform duration-300" 
            style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}
          />
        )}
      </Link>
      
      {hasDropdown && showDropdown && (
        <>
          <div className="dropdown-connector" />
          <div className="nav-dropdown">
            {dropdownContent}
          </div>
        </>
      )}
    </div>
  );
});

// Create a new MobileNavbar component
const MobileNavbar = ({ navLinks, currentUser, isActive, handleAuthClick, showProfileMenu, renderProfileDropdown }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedDropdowns, setExpandedDropdowns] = useState({});
  
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  // Toggle specific dropdown section
  const toggleDropdown = (index) => {
    setExpandedDropdowns(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Body overflow control when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="mobile-navbar md:hidden">
      <div className="mobile-header-container shadow-sm">
        {/* Mobile Top Bar */}
        <div className="mobile-header-top flex justify-between items-center py-2 px-4">
          {/* Logo */}
          <div className="mobile-logo">
            <Link to="/" aria-label="MU-UniConnect Home">
              <img 
                src="/img/uniconnectTB.png" 
                alt="UniConnect Logo" 
                className="mobile-logo-image" 
                width="168"
                height="42"
              />
            </Link>
          </div>

          {/* Controls */}
          <div className="mobile-controls flex items-center gap-3">
            {/* Auth Button */}
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
            
            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-button"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={toggleMobileMenu} aria-hidden="true" />
        )}
        
        <div 
          id="mobile-menu"
          className={`mobile-menu ${mobileMenuOpen ? 'show' : ''}`}
        >
          <nav className="mobile-nav-links">
            {navLinks.map((link, index) => (
              <div key={`mobile-${index}`} className="mobile-nav-item">
                {link.hasDropdown ? (
                  <>
                    <button 
                      className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
                      onClick={() => toggleDropdown(index)}
                      aria-expanded={expandedDropdowns[index]}
                    >
                      <span>{link.label}</span>
                      <i className={`fas fa-chevron-down transition-transform ${expandedDropdowns[index] ? 'rotate-180' : ''}`}></i>
                    </button>
                    
                    <div 
                      className={`mobile-dropdown-content ${expandedDropdowns[index] ? 'expanded' : ''}`}
                    >
                      {React.Children.toArray(link.dropdownContent.props.children).map((section, sIdx) => {
                        if (!section || !section.props || !section.props.children) return null;
                        
                        const sectionTitle = React.Children.toArray(section.props.children).find(
                          child => child.type === 'h3' || (child.props && child.props.className === 'dropdown-title')
                        );
                        
                        const sectionLinks = React.Children.toArray(section.props.children).filter(
                          child => child.type === Link || (child.props && child.props.to)
                        );
                        
                        return (
                          <div key={sIdx} className="mobile-dropdown-section">
                            {sectionTitle && (
                              <h4 className="mobile-dropdown-title">
                                {sectionTitle.props.children}
                              </h4>
                            )}
                            
                            <div className="mobile-dropdown-links">
                              {sectionLinks.map((item, lIdx) => {
                                if (!item || !item.props) return null;
                                
                                // Extract icon and text content from the dropdown item
                                const icon = React.Children.toArray(item.props.children).find(
                                  child => child.type === 'i' || (child.props && child.props.className && child.props.className.includes('fa-'))
                                );
                                
                                const content = React.Children.toArray(item.props.children).find(
                                  child => child.type === 'div' || (child.props && child.props.children)
                                );
                                
                                const title = content ? React.Children.toArray(content.props.children).find(
                                  child => child.type === 'span' && (!child.props.className || !child.props.className.includes('dropdown-description'))
                                ) : null;
                                
                                const description = content ? React.Children.toArray(content.props.children).find(
                                  child => child.props && child.props.className && child.props.className.includes('dropdown-description')
                                ) : null;
                                
                                return (
                                  <Link
                                    key={lIdx}
                                    to={item.props.to}
                                    className="mobile-dropdown-link"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {icon && <span className="mobile-dropdown-icon">{icon}</span>}
                                    <span className="mobile-dropdown-text">
                                      <span className="mobile-dropdown-title-text">{title ? title.props.children : 'Link'}</span>
                                      {description && (
                                        <span className="mobile-dropdown-desc-text">{description.props.children}</span>
                                      )}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <Link 
                    to={link.to}
                    className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

// Create a new DesktopNavbar component
const DesktopNavbar = ({ navLinks, currentUser, isActive, handleAuthClick, showProfileMenu, renderProfileDropdown }) => {
  return (
    <div className="desktop-navbar hidden md:flex justify-between items-center w-full max-w-7xl mx-auto">
      {/* Desktop Logo */}
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
          className="auth-icon-btn relative" 
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
  );
};

// Main Navbar component that includes both mobile and desktop versions
function Navbar() {
  // Shared state variables
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Optimized scroll handler with proper throttling
  const handleScroll = useCallback(() => {
    const scrollThreshold = 50;
    const shouldBeScrolled = window.scrollY > scrollThreshold;
    
    if (shouldBeScrolled !== scrolled) {
      setScrolled(shouldBeScrolled);
    }
  }, [scrolled]);

  // Handle clicking outside profile menu
  useEffect(() => {
    if (!showProfileMenu) return;
    
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current && 
        !profileMenuRef.current.contains(event.target) &&
        !event.target.closest('.auth-icon-btn')
      ) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Set up scroll listener
  useEffect(() => {
    // Initial check
    handleScroll();
    
    // Throttled scroll event
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

  // Handle auth button click
  const handleAuthClick = () => {
    if (currentUser) {
      setShowProfileMenu(prev => !prev);
    } else {
      navigate('/login');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  // Get role-specific badge class
  const getRoleBadgeClass = (role) => {
    if (role === 'admin') return 'admin';
    if (role === 'faculty') return 'faculty';
    return '';
  };
  
  // Profile dropdown content
  const renderProfileDropdown = () => (
    <div className="profile-dropdown" ref={profileMenuRef}>
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

  // Render the navbar with both desktop and mobile components
  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} role="banner">
      <DesktopNavbar 
        navLinks={navLinks}
        currentUser={currentUser}
        isActive={isActive}
        handleAuthClick={handleAuthClick}
        showProfileMenu={showProfileMenu}
        renderProfileDropdown={renderProfileDropdown}
      />
      
      <MobileNavbar 
        navLinks={navLinks}
        currentUser={currentUser}
        isActive={isActive}
        handleAuthClick={handleAuthClick}
        showProfileMenu={showProfileMenu}
        renderProfileDropdown={renderProfileDropdown}
      />
    </header>
  );
}

export default Navbar;
