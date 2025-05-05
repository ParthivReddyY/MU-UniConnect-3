import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../contexts/AuthContext';

// Optimized NavLink component with proper dropdown handling
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

function Navbar() {
  // State variables
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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

  // Overflow handling for body when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(prevState => !prevState);
  };

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

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} role="banner">
      {/* DESKTOP NAVBAR */}
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

      {/* MOBILE NAVBAR */}
      <div className="mobile-navbar md:hidden w-full">
        <div className={`mobile-header-container ${menuOpen ? 'menu-open' : ''}`}>
          {/* Top bar with logo and controls */}
          <div className="mobile-header-top">
            {/* Mobile Logo */}
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

          {/* Mobile menu content */}
          <div 
            className={`mobile-menu ${menuOpen ? 'show' : ''}`} 
            id="mobile-navigation"
          >
            {/* Mobile Navigation Links */}
            <nav className="mobile-nav-links" aria-label="Mobile navigation">
              {navLinks.map((link, index) => (
                <div key={`mobile-${index}`} className="mobile-nav-item">
                  {link.hasDropdown ? (
                    <div className="mobile-dropdown">
                      <div 
                        className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
                        onClick={() => {
                          // Toggle expanded state for this specific item
                          const item = document.getElementById(`mobile-dropdown-${index}`);
                          if (item) {
                            item.classList.toggle('expanded');
                          }
                        }}
                      >
                        <span>{link.label}</span>
                        <i className="fas fa-chevron-down ml-2"></i>
                      </div>
                      
                      <div id={`mobile-dropdown-${index}`} className="mobile-dropdown-content">
                        {/* Safe rendering of mobile dropdown content */}
                        <div className="px-4 py-2 space-y-2">
                          {React.Children.toArray(link.dropdownContent.props.children).map((section, sIdx) => {
                            // Safety check for section
                            if (!section || !section.props || !section.props.children) {
                              return null;
                            }
                            
                            // Get the section title safely
                            const sectionTitle = React.Children.toArray(section.props.children)[0];
                            const sectionTitleText = sectionTitle && sectionTitle.props && sectionTitle.props.children 
                              ? sectionTitle.props.children 
                              : `Section ${sIdx+1}`;
                            
                            // Get the links safely
                            const links = React.Children.toArray(section.props.children).slice(1);
                            
                            return (
                              <div key={sIdx} className="mb-4">
                                <h4 className="font-semibold text-sm text-gray-600 mb-2">
                                  {sectionTitleText}
                                </h4>
                                <div className="space-y-2">
                                  {links.map((item, iIdx) => {
                                    // Safety check for item
                                    if (!item || !item.props) {
                                      return null;
                                    }
                                    
                                    return (
                                      <Link
                                        key={iIdx}
                                        to={item.props.to || '/'}
                                        className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md text-sm"
                                        onClick={() => setMenuOpen(false)}
                                      >
                                        <div className="flex items-center">
                                          {item.props.children && item.props.children[0] && (
                                            <i className={item.props.children[0].props?.className || "fas fa-link"}></i>
                                          )}
                                          <span className="ml-3">
                                            {item.props.children && item.props.children[1] && 
                                             item.props.children[1].props && 
                                             item.props.children[1].props.children && 
                                             item.props.children[1].props.children[0] && 
                                             item.props.children[1].props.children[0].props
                                              ? item.props.children[1].props.children[0].props.children
                                              : `Link ${iIdx+1}`
                                            }
                                          </span>
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link 
                      to={link.to}
                      className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
                      onClick={() => setMenuOpen(false)}
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
      
      {/* Mobile menu backdrop */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
}

export default Navbar;
