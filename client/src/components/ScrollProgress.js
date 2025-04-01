import React, { useState, useEffect } from 'react';

/**
 * ScrollProgress component
 * Shows a scroll progress bar at the top of the page
 */
const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      // Calculate how much the user has scrolled
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (scrollHeight) {
        setScrollProgress((scrollTop / scrollHeight) * 100);
      } else {
        setScrollProgress(0);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', updateScrollProgress);
    
    // Clean up event listener on component unmount
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 w-full h-1 bg-transparent z-50"
      style={{ zIndex: 9999 }}
    >
      <div
        className="h-full bg-primary-red transition-all duration-300 ease-out"
        style={{ width: `${scrollProgress}%` }}
      ></div>
    </div>
  );
};

export default ScrollProgress;
