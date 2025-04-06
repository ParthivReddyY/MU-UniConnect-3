import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Overview = () => {
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);
  const [showFullStats, setShowFullStats] = useState(false);

  const galleryImages = [
    {
      src: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      alt: "University Campus",
      caption: "Main Academic Building"
    },
    {
      src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      alt: "Library",
      caption: "Central Library"
    },
    {
      src: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      alt: "Innovation Lab",
      caption: "Innovation & Research Center"
    }
  ];

  const universityStats = [
    { label: "Founded", value: "2020", icon: "fas fa-calendar-day" },
    { label: "Campus Size", value: "130 Acres", icon: "fas fa-ruler-combined" },
    { label: "Students", value: "2,500+", icon: "fas fa-user-graduate" },
    { label: "Faculty", value: "300+", icon: "fas fa-chalkboard-teacher" },
    { label: "Courses", value: "40+", icon: "fas fa-book-open" },
    { label: "Labs", value: "50+", icon: "fas fa-flask" },
    { label: "Startups Incubated", value: "15+", icon: "fas fa-rocket" },
    { label: "Research Papers", value: "250+", icon: "fas fa-newspaper" }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold mb-2 text-dark-gray">Mahindra University</h2>
        <p className="text-primary-red font-semibold text-lg mb-6">Education for the Future</p>
      </motion.div>
      
      {/* University Gallery */}
      <motion.div variants={itemVariants} className="overflow-hidden rounded-xl shadow-md mb-8">
        <div className="relative h-80 md:h-96">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === activeGalleryImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h3 className="text-white text-xl font-medium">{image.caption}</h3>
              </div>
            </div>
          ))}
          
          {/* Gallery Navigation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveGalleryImage(index)}
                className={`w-2.5 h-2.5 rounded-full ${
                  index === activeGalleryImage ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Previous/Next buttons */}
          <button
            onClick={() => setActiveGalleryImage((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous image"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            onClick={() => setActiveGalleryImage((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            aria-label="Next image"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4 text-primary-red flex items-center">
              <i className="fas fa-university mr-2"></i> About Mahindra University
            </h3>
            <p className="mb-4 text-dark-gray">
              Mahindra University (MU) is a multi-disciplinary university that aims to educate future citizens for and of a better world. 
              MU is envisaged as a world-class academic institution that will foster the next generation of scientists, leaders, innovators 
              and entrepreneurs, to help solve the complex challenges of the 21st century.
            </p>
            <p className="mb-4 text-dark-gray">
              Set up as part of the Mahindra Educational Institutions (MEI), a not-for-profit subsidiary of Tech Mahindra, 
              Mahindra University is spread across a vibrant 130-acre campus in Hyderabad.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4 text-primary-red flex items-center">
              <i className="fas fa-lightbulb mr-2"></i> Vision & Mission
            </h3>
            <div className="space-y-4">
              <div className="bg-red-light rounded-lg p-4 border-l-4 border-primary-red">
                <h4 className="font-medium text-lg mb-1 flex items-center">
                  <i className="fas fa-eye mr-2 text-primary-red"></i> Vision
                </h4>
                <p className="text-dark-gray">
                  To be recognized globally for excellence in education and to nurture young minds to become future leaders and innovators.
                </p>
              </div>
              
              <div className="bg-teal-light rounded-lg p-4 border-l-4 border-primary-teal">
                <h4 className="font-medium text-lg mb-1 flex items-center">
                  <i className="fas fa-bullseye mr-2 text-primary-teal"></i> Mission
                </h4>
                <p className="text-dark-gray">
                  To provide world-class educational experience, foster research and development, and promote innovation and 
                  entrepreneurship that addresses the needs of society.
                </p>
              </div>
            </div>
          </div>
          
          {/* University Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4 text-primary-red flex items-center">
              <i className="fas fa-chart-bar mr-2"></i> University at a Glance
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {universityStats.slice(0, showFullStats ? universityStats.length : 4).map((stat, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-light text-primary-red mb-2">
                    <i className={stat.icon}></i>
                  </div>
                  <p className="font-bold text-lg md:text-xl">{stat.value}</p>
                  <p className="text-sm text-medium-gray">{stat.label}</p>
                </div>
              ))}
            </div>
            
            {universityStats.length > 4 && (
              <button 
                onClick={() => setShowFullStats(!showFullStats)} 
                className="text-primary-red hover:underline text-sm font-medium flex items-center mx-auto mt-4"
              >
                {showFullStats ? 'Show Less' : 'Show More'}
                <i className={`fas fa-chevron-${showFullStats ? 'up' : 'down'} ml-1`}></i>
              </button>
            )}
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4 text-primary-red flex items-center">
              <i className="fas fa-info-circle mr-2"></i> Essential Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-red-light rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0 mr-3">
                  <i className="fas fa-map-marker-alt text-primary-red"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Address:</h4>
                  <p className="text-dark-gray text-sm">Survey No: 62/1A, Bahadurpally, Jeedimetla, Hyderabad - 500043, Telangana, India</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-red-light rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0 mr-3">
                  <i className="fas fa-phone text-primary-red"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Contact:</h4>
                  <p className="text-dark-gray text-sm">+91 40 6722 9999</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-red-light rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0 mr-3">
                  <i className="fas fa-envelope text-primary-red"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Email:</h4>
                  <p className="text-dark-gray text-sm">info@mahindrauniversity.edu.in</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-red-light rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0 mr-3">
                  <i className="fas fa-globe text-primary-red"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Website:</h4>
                  <a href="https://www.mahindrauniversity.edu.in" target="_blank" rel="noreferrer" className="text-primary-red hover:underline text-sm">
                    www.mahindrauniversity.edu.in
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4 text-primary-red flex items-center">
              <i className="fas fa-link mr-2"></i> Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/academic-calendar" className="group flex items-center p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-light text-primary-teal mr-3 group-hover:bg-primary-teal group-hover:text-white transition-colors">
                    <i className="fas fa-calendar-alt"></i>
                  </span>
                  <span className="text-primary-teal group-hover:text-dark-gray">Academic Calendar</span>
                </a>
              </li>
              <li>
                <a href="/admission-process" className="group flex items-center p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-light text-primary-teal mr-3 group-hover:bg-primary-teal group-hover:text-white transition-colors">
                    <i className="fas fa-user-plus"></i>
                  </span>
                  <span className="text-primary-teal group-hover:text-dark-gray">Admission Process</span>
                </a>
              </li>
              <li>
                <a href="/fee-structure" className="group flex items-center p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-light text-primary-teal mr-3 group-hover:bg-primary-teal group-hover:text-white transition-colors">
                    <i className="fas fa-rupee-sign"></i>
                  </span>
                  <span className="text-primary-teal group-hover:text-dark-gray">Fee Structure</span>
                </a>
              </li>
              <li>
                <a href="/scholarships" className="group flex items-center p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-light text-primary-teal mr-3 group-hover:bg-primary-teal group-hover:text-white transition-colors">
                    <i className="fas fa-award"></i>
                  </span>
                  <span className="text-primary-teal group-hover:text-dark-gray">Scholarships</span>
                </a>
              </li>
              <li>
                <a href="/campus-facilities" className="group flex items-center p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-light text-primary-teal mr-3 group-hover:bg-primary-teal group-hover:text-white transition-colors">
                    <i className="fas fa-building"></i>
                  </span>
                  <span className="text-primary-teal group-hover:text-dark-gray">Campus Facilities</span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Virtual Tour Button */}
          <div className="bg-gradient-to-r from-primary-teal to-primary-red text-white rounded-xl p-6 text-center">
            <h3 className="text-xl font-semibold mb-3">Virtual Campus Tour</h3>
            <p className="mb-4 text-white/90">Experience our campus virtually before visiting in person</p>
            <button className="bg-white text-primary-red font-medium px-6 py-2 rounded-lg hover:shadow-lg transition-shadow flex items-center mx-auto">
              <i className="fas fa-vr-cardboard mr-2"></i>
              Start Tour
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Overview;
