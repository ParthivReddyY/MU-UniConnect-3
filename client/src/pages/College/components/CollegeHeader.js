import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const CollegeHeader = () => {
  const { scrollY } = useScroll();
  
  // Remove opacity transform to keep the image visible when scrolling
  // Only keep the scale transform for parallax effect
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  
  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden">
      {/* Parallax Background Image - removed opacity transform */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center will-change-transform" 
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')`,
          scale,
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
      
      {/* Content - changed z-index from z-20 to z-1 */}
      <div className="relative z-1 h-full flex flex-col justify-center items-center text-center px-4">
        <motion.div style={{ opacity: useTransform(scrollY, [0, 300], [1, 0]) }}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Mahindra University</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Nurturing young minds to become leaders of tomorrow
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://admission.mahindrauniversity.edu.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-primary-red hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center"
            >
              <i className="fas fa-user-plus mr-2"></i>
              Apply Now
            </a>
            <a 
              href="https://www.mahindrauniversity.edu.in/sites/virtual-tour-of-mu-campus.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 font-medium px-6 py-3 rounded-lg transition-colors flex items-center"
            >
              <i className="fas fa-video mr-2"></i>
              Watch Campus Tour
            </a>
          </div>
        </motion.div>
      </div>
      
      {/* Curved bottom - changed z-index from z-20 to z-1 */}
      <div className="absolute bottom-0 left-0 right-0 z-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#f9fafb">
          <path d="M0,96L60,85.3C120,75,240,53,360,53.3C480,53,600,75,720,74.7C840,75,960,53,1080,48C1200,43,1320,53,1380,58.7L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default CollegeHeader;
