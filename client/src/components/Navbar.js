import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../contexts/AuthContext';

// Optimized memoized navigation link component
const NavLink = memo(({ to, isActive, children }) => (
  <Link 
    to={to} 
    className={`${isActive ? 'active' : ''}`}
    aria-current={isActive ? 'page' : undefined}
  >
    {children}
  </Link>
));

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get auth context
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
      if (showProfileMenu && !event.target.closest('.auth-section')) {
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

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} role="banner">
      <div className={`header-container ${menuOpen ? 'menu-open' : ''}`}>
        {/* Top section with logo and mobile controls */}
        <div className="header-top">
          {/* Logo/Brand */}
          <div className="logo">
            <Link to="/">UniConnect</Link>
          </div>
          
          {/* Right side controls - visible on mobile */}
          <div className="mobile-controls">
            {/* Auth button on mobile */}
            <div className="auth-section-mobile">
              <button 
                className="auth-icon-btn relative mr-4"
                onClick={handleAuthClick}
                title={currentUser ? "Account menu" : "Login"}
              >
                {currentUser ? (
                  <span className="flex items-center justify-center overflow-hidden">
                    {currentUser.profileImage && currentUser.profileImage !== 'default-profile.png' ? (
                      <img
                        className="h-7 w-7 rounded-full object-cover"
                        src={currentUser.profileImage} 
                        alt={`${currentUser.name}'s profile`}
                      />
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                  </span>
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </button>
            </div>
            
            {/* Mobile menu button - now positioned to the right */}
            <button 
              className="mobile-menu-button"
              onClick={toggleMenu} 
              aria-expanded={menuOpen}
              aria-controls="navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {/* Bottom section with navigation and auth button */}
        <div className={`header-bottom ${menuOpen ? 'show' : ''}`} id="navigation">
          {/* Navigation Links */}
          <nav className="nav-links" aria-label="Main navigation">
            <NavLink to="/" isActive={isActive('/')}>Home</NavLink>
            <NavLink to="/clubs-events" isActive={isActive('/clubs-events')}>Clubs & Events</NavLink>
            <NavLink to="/faculty" isActive={isActive('/faculty')}>Faculty</NavLink>
            <NavLink to="/college" isActive={isActive('/college')}>College</NavLink>
          </nav>

          {/* Auth Button - desktop version */}
          <div className="auth-section desktop-only">
            <button 
              id="auth-button" 
              className="auth-icon-btn relative group" 
              onClick={handleAuthClick}
              title={currentUser ? "Account menu" : "Login or access account"}
            >
              {currentUser ? (
                <span className="w-full h-full flex items-center justify-center overflow-hidden">
                  {currentUser.profileImage && currentUser.profileImage !== 'default-profile.png' ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={currentUser.profileImage} 
                      alt={`${currentUser.name}'s profile`}
                    />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </span>
              ) : (
                <i className="fas fa-user"></i>
              )}
              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap top-full mt-1 right-0">
                {currentUser ? 'Profile' : 'Log In'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Profile dropdown menu - positioned appropriately */}
        {showProfileMenu && currentUser && (
          <div className="profile-dropdown">
            <div className="px-4 py-2 border-b border-light-gray">
              <p className="text-dark-gray font-semibold truncate">{currentUser.name}</p>
              <p className="text-medium-gray text-sm truncate">{currentUser.email}</p>
            </div>
            
            <div className="px-4 py-2 border-b border-light-gray">
              <p className="text-xs text-medium-gray uppercase">Role</p>
              <p className="text-sm text-dark-gray capitalize">{currentUser.role}</p>
            </div>
            
            <Link 
              to="/dashboard" 
              className="block px-4 py-2 text-sm text-dark-gray hover:bg-red-light"
              onClick={() => setShowProfileMenu(false)}
            >
              <i className="fas fa-tachometer-alt mr-2"></i> Dashboard
            </Link>
            
            <Link 
              to="/profile" 
              className="block px-4 py-2 text-sm text-dark-gray hover:bg-red-light"
              onClick={() => setShowProfileMenu(false)}
            >
              <i className="fas fa-user-circle mr-2"></i> My Profile
            </Link>
            
            {currentUser.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                className="block px-4 py-2 text-sm text-dark-gray hover:bg-red-light"
                onClick={() => setShowProfileMenu(false)}
              >
                <i className="fas fa-shield-alt mr-2"></i> Admin Panel
              </Link>
            )}
            
            <button
              className="w-full text-left block px-4 py-2 text-sm text-primary-red hover:bg-red-light"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt mr-2"></i> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
