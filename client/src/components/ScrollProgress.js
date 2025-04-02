import React, { useState, useEffect } from 'react';

const ScrollProgress = ({ color = '#d32f2f' }) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
      
      setScrollPercentage(scrollPercentage);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(229, 231, 235, 0.3)',
        zIndex: 50,
      }}
    >
      <div 
        style={{
          height: '100%',
          width: `${scrollPercentage}%`,
          backgroundColor: color,
          transition: 'width 0.1s',
        }}
      />
    </div>
  );
};

export default ScrollProgress;
