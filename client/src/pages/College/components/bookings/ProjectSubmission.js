import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProjectSubmission = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="relative overflow-hidden bg-white rounded-2xl shadow-lg"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 opacity-90" />
      
      <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md rounded-full p-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      
      <div className="relative p-7 z-10 h-full flex flex-col">
        <h3 className="text-2xl font-bold mb-2 text-white">Project Submission</h3>
        
        <div className="my-4 bg-white/20 backdrop-blur-md h-px w-16" />
        
        <p className="text-white/90 mb-6 flex-grow">
          Submit your academic projects, research papers, and assignments through our 
          digital portal with easy tracking and feedback.
        </p>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center text-white/90 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Supports multiple file formats</span>
          </div>
          
          <motion.button 
            className="w-full py-3 px-4 rounded-xl font-medium bg-white text-emerald-600 shadow-md hover:shadow-lg transition-all"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.03 : 1 }}
          >
            Submit Project
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectSubmission;
