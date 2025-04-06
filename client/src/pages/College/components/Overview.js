import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Overview = () => {
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);
  const [activeProgram, setActiveProgram] = useState('engineering');
  const [activeFacility, setActiveFacility] = useState(0);

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
    { label: "Founded", value: "2014", icon: "fas fa-calendar-day" },
    { label: "Campus Size", value: "130 Acres", icon: "fas fa-ruler-combined" },
    { label: "Students", value: "2,500+", icon: "fas fa-user-graduate" },
    { label: "Faculty", value: "300+", icon: "fas fa-chalkboard-teacher" },
  ];
  
  const academicPrograms = {
    engineering: {
      name: "Jacob School of Engineering",
      icon: "fas fa-cogs",
      color: "#e74c3c",
      programs: ["B.Tech. (Multiple Specializations)", "M.Tech.", "Ph.D."],
      description: "Our engineering programs combine theoretical knowledge with practical experience, preparing students for careers in various engineering disciplines."
    },
    management: {
      name: "School of Management",
      icon: "fas fa-chart-line",
      color: "#3498db",
      programs: ["BBA", "MBA", "Ph.D."],
      description: "The School of Management offers programs designed to develop future business leaders with innovative thinking and strategic management skills."
    },
    humanities: {
      name: "Humanities and Social Sciences",
      icon: "fas fa-book",
      color: "#27ae60",
      programs: ["Undergraduate Programs", "Postgraduate Programs"],
      description: "Our humanities programs foster critical thinking, cultural understanding, and effective communication skills across various disciplines."
    },
    law: {
      name: "School of Law",
      icon: "fas fa-gavel",
      color: "#8e44ad",
      programs: ["Undergraduate Programs", "Postgraduate Programs"],
      description: "The School of Law prepares students with comprehensive legal knowledge and ethical practices for careers in law and justice."
    },
    education: {
      name: "School of Education",
      icon: "fas fa-graduation-cap",
      color: "#f39c12",
      programs: ["Undergraduate Programs", "Postgraduate Programs"],
      description: "Our education programs develop skilled teachers and educational leaders who can make a difference in students' lives."
    }
  };

  const leadership = [
    {
      name: "Anand Mahindra",
      title: "Chairman of the Mahindra Group",
      description: "Played a pivotal role in the university's establishment, bringing his visionary leadership and commitment to education excellence.",
      image: "https://savedaughters.com/public/ckimages/ck_1681302159.jpg",
      achievements: ["30+ years of industry leadership", "Transformational business vision", "Philanthropic initiatives in education"]
    },
    {
      name: "Vineet Nayyar",
      title: "Co-Founder",
      description: "Instrumental in the university's initial growth and development, bringing extensive experience in management and governance.",
      image: "https://bsmedia.business-standard.com/_media/bs/img/article/2017-11/02/full/1509569397-3249.jpg?im=FeatureCrop,size=(826,465)",
      achievements: ["Corporate governance expert", "Leadership in technology sector", "Focus on academic innovation"]
    },
  ];

  const globalPartners = [
    {
      name: "University of Example 1",
      location: "United States",
      logo: "https://via.placeholder.com/100/3498db/ffffff?text=UE1",
      partnership: "Student Exchange, Research Collaboration"
    },
    {
      name: "University of Example 2", 
      location: "United Kingdom",
      logo: "https://via.placeholder.com/100/2ecc71/ffffff?text=UE2",
      partnership: "Joint Degree Programs, Faculty Exchange"
    },
    {
      name: "University of Example 3",
      location: "Australia",
      logo: "https://via.placeholder.com/100/e74c3c/ffffff?text=UE3",
      partnership: "Research Projects, Cultural Programs"
    }
  ];

  const campusFacilities = [
    {
      name: "Modern Infrastructure",
      icon: "fas fa-building",
      description: "State-of-the-art classrooms, lecture halls, and research facilities designed for optimal learning experiences.",
      image: "https://images.unsplash.com/photo-1594072702031-f0e2a602dd2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Library Resources",
      icon: "fas fa-book",
      description: "Extensive collection of books, journals, and digital resources with comfortable study spaces and research support.",
      image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Sports Facilities",
      icon: "fas fa-futbol",
      description: "Indoor and outdoor sports facilities including gymnasium, swimming pool, courts, and playing fields.",
      image: "https://images.unsplash.com/photo-1558443957-d056622df610?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Student Housing",
      icon: "fas fa-bed",
      description: "Modern hostel accommodations with comfortable rooms, dining facilities, and recreational spaces for resident students.",
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Cultural Centers",
      icon: "fas fa-theater-masks",
      description: "Dedicated spaces for cultural events, performances, and club activities to enrich student life beyond academics.",
      image: "https://images.unsplash.com/photo-1560523160-754a9e25c68f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const researchAreas = [
    { name: "Artificial Intelligence & Machine Learning", icon: "fas fa-robot", percentage: 85 },
    { name: "Sustainable Energy Solutions", icon: "fas fa-solar-panel", percentage: 75 },
    { name: "Biomedical Engineering", icon: "fas fa-heartbeat", percentage: 80 },
    { name: "Advanced Materials Science", icon: "fas fa-atom", percentage: 70 },
    { name: "Data Science & Analytics", icon: "fas fa-chart-network", percentage: 90 },
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
      className="space-y-12"
    >
      {/* Hero Section with University Name and Tagline */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-dark-gray bg-clip-text text-transparent bg-gradient-to-r from-primary-red to-primary-teal">
          Mahindra University
        </h1>
        <p className="text-xl md:text-2xl font-medium text-medium-gray">Shaping Future Leaders</p>
        
        {/* Quick Stats Banner */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {universityStats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center border-t-4"
              style={{ borderColor: index % 2 === 0 ? '#e74c3c' : '#3498db' }}
            >
              <span className="text-3xl md:text-4xl font-bold text-primary-teal mb-1">{stat.value}</span>
              <div className="flex items-center gap-2">
                <i className={`${stat.icon} text-primary-red`}></i>
                <span className="text-dark-gray font-medium">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* University Gallery with Caption Overlay */}
      <motion.div variants={itemVariants} className="w-full overflow-hidden rounded-2xl shadow-xl mb-12 bg-gray-800">
        <div className="relative aspect-[16/9] max-h-[600px]">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{ opacity: activeGalleryImage === index ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-3">{image.caption}</h2>
                <p className="text-white/80 text-lg max-w-2xl">
                  Experience the vibrant atmosphere of our campus, designed to inspire learning and innovation.
                </p>
              </div>
            </motion.div>
          ))}
          
          {/* Gallery Navigation */}
          <div className="absolute bottom-6 right-6 flex space-x-2 z-10">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveGalleryImage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeGalleryImage ? 'bg-white scale-125' : 'bg-white/40'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* About Section with Two-Column Layout */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
            <div className="bg-red-light p-2 rounded-lg mr-3">
              <i className="fas fa-university text-primary-red"></i>
            </div>
            About Mahindra University
          </h2>
          
          <p className="text-dark-gray text-lg mb-4 leading-relaxed">
            Established in 2014, Mahindra University is a leading private research university in Hyderabad, India, 
            founded by Mahindra Educational Institutions (Mahindra Group).
          </p>
          <p className="text-dark-gray text-lg mb-6 leading-relaxed">
            We are dedicated to delivering exceptional technology education and fostering interdisciplinary research, 
            with a vision to cultivate responsible citizens and future leaders.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <i className="fas fa-medal text-primary-red text-2xl mr-3"></i>
              <div>
                <h4 className="font-semibold">Excellence</h4>
                <p className="text-sm text-medium-gray">Committed to highest standards</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <i className="fas fa-lightbulb text-primary-red text-2xl mr-3"></i>
              <div>
                <h4 className="font-semibold">Innovation</h4>
                <p className="text-sm text-medium-gray">Fostering creative thinking</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <i className="fas fa-globe text-primary-red text-2xl mr-3"></i>
              <div>
                <h4 className="font-semibold">Global Perspective</h4>
                <p className="text-sm text-medium-gray">International collaboration</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <i className="fas fa-handshake text-primary-red text-2xl mr-3"></i>
              <div>
                <h4 className="font-semibold">Industry Connect</h4>
                <p className="text-sm text-medium-gray">Strong corporate partnerships</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vision and Mission */}
        <div className="bg-gradient-to-br from-primary-red/5 to-primary-teal/5 p-8 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
            <div className="bg-teal-light p-2 rounded-lg mr-3">
              <i className="fas fa-eye text-primary-teal"></i>
            </div>
            Vision & Mission
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-primary-red">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <i className="fas fa-bullseye text-primary-red mr-2"></i>
                Vision
              </h3>
              <p className="text-dark-gray leading-relaxed">
                To be recognized globally for excellence in education and to nurture young minds to become future leaders and innovators who contribute positively to society's advancement.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-primary-teal">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <i className="fas fa-compass text-primary-teal mr-2"></i>
                Mission
              </h3>
              <p className="text-dark-gray leading-relaxed">
                To provide world-class educational experience, foster research and development, and promote innovation and entrepreneurship that addresses the needs of society and prepares students for global challenges.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-primary-teal/70">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <i className="fas fa-star text-primary-teal/70 mr-2"></i>
                Values
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-teal-light text-primary-teal rounded-full text-sm">Integrity</span>
                <span className="px-3 py-1 bg-teal-light text-primary-teal rounded-full text-sm">Innovation</span>
                <span className="px-3 py-1 bg-teal-light text-primary-teal rounded-full text-sm">Excellence</span>
                <span className="px-3 py-1 bg-teal-light text-primary-teal rounded-full text-sm">Inclusivity</span>
                <span className="px-3 py-1 bg-teal-light text-primary-teal rounded-full text-sm">Sustainability</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Academic Programs Section */}
      <motion.section variants={itemVariants} className="bg-gray-50 rounded-2xl shadow-lg p-8 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">Academic Programs</h2>
        <p className="text-center text-medium-gray mb-8 max-w-3xl mx-auto">
          Explore our diverse range of programs, designed to equip students with the knowledge and skills for success in their chosen fields
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.keys(academicPrograms).map(key => (
            <button
              key={key}
              onClick={() => setActiveProgram(key)}
              className={`
                px-5 py-3 rounded-full font-medium text-sm flex items-center gap-2 transition-all duration-300
                ${activeProgram === key 
                  ? 'bg-gradient-to-r from-primary-red to-primary-teal text-white shadow-md scale-105' 
                  : 'bg-white text-dark-gray hover:bg-gray-100'}
              `}
            >
              <i className={`${academicPrograms[key].icon}`}></i>
              {academicPrograms[key].name}
            </button>
          ))}
        </div>
        
        <motion.div 
          key={activeProgram}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-primary-red to-primary-red/80 p-6 text-white flex flex-col justify-center">
              <div className="text-5xl mb-4">
                <i className={academicPrograms[activeProgram].icon}></i>
              </div>
              <h3 className="text-2xl font-bold mb-3">{academicPrograms[activeProgram].name}</h3>
              <p className="text-white/90 mb-6">
                {academicPrograms[activeProgram].description}
              </p>
              <button className="bg-white text-primary-red px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 self-start hover:bg-opacity-90 transition-colors">
                <i className="fas fa-info-circle"></i>
                Learn More
              </button>
            </div>
            <div className="md:w-2/3 p-6 md:p-8">
              <h4 className="text-xl font-semibold mb-4">Available Programs</h4>
              <ul className="space-y-4">
                {academicPrograms[activeProgram].programs.map((program, idx) => (
                  <li key={idx} className="flex items-start bg-gray-50 p-4 rounded-lg">
                    <div className="bg-primary-teal/10 text-primary-teal p-2 rounded-full mr-4">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div>
                      <h5 className="font-medium">{program}</h5>
                      <p className="text-sm text-medium-gray mt-1">
                        Comprehensive curriculum with focus on theoretical knowledge and practical applications.
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-lg font-medium mb-2">Entry Requirements</h4>
                <ul className="text-medium-gray">
                  <li className="flex items-center gap-2 mb-1">
                    <i className="fas fa-check-circle text-green-500"></i>
                    Strong academic record
                  </li>
                  <li className="flex items-center gap-2 mb-1">
                    <i className="fas fa-check-circle text-green-500"></i>
                    Entrance examination
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check-circle text-green-500"></i>
                    Interview process
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>
      
      {/* Leadership Section with Side by Side Leaders */}
      <motion.section variants={itemVariants} className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary-red to-primary-teal p-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">University Leadership</h2>
          <p className="text-white/80">
            Meet the visionaries guiding Mahindra University to excellence
          </p>
        </div>
        
        {/* Display leaders side-by-side instead of with tabs */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {leadership.map((leader, index) => (
              <div key={index} className="bg-gray-50 rounded-xl shadow-sm overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={leader.image} 
                    alt={leader.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                  <p className="text-primary-red font-medium mb-4">{leader.title}</p>
                  <p className="text-dark-gray mb-5 leading-relaxed">{leader.description}</p>
                  
                  <h4 className="text-lg font-medium mb-3">Key Achievements</h4>
                  <ul className="space-y-2">
                    {leader.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-center">
                        <i className="fas fa-award text-primary-teal mr-3"></i>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
      
      {/* Research and Innovation Section with Progress Bars */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <i className="fas fa-flask text-primary-red mr-3"></i>
            Research Excellence
          </h2>
          <p className="text-dark-gray mb-8">
            We are dedicated to fostering a vibrant research ecosystem and promoting a culture of innovation across multiple disciplines.
          </p>
          
          <div className="space-y-6">
            {researchAreas.map((area, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <i className={`${area.icon} text-primary-teal mr-2`}></i>
                    <span className="font-medium">{area.name}</span>
                  </div>
                  <span className="text-medium-gray">{area.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div 
                    className="bg-gradient-to-r from-primary-teal to-primary-red h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${area.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-red">250+</p>
              <p className="text-sm text-medium-gray">Research Papers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-red">15+</p>
              <p className="text-sm text-medium-gray">Patents Filed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-red">₹50M+</p>
              <p className="text-sm text-medium-gray">Research Grants</p>
            </div>
          </div>
        </div>
        
        {/* Global Collaborations */}
        <div className="bg-gray-50 rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <i className="fas fa-globe-americas text-primary-teal mr-3"></i>
            Global Collaborations
          </h2>
          <p className="text-dark-gray mb-8">
            We partner with leading international universities to provide our students with global exposure and opportunities.
          </p>
          
          <div className="space-y-6">
            {globalPartners.map((partner, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4"
              >
                <div className="flex-shrink-0">
                  <img src={partner.logo} alt={partner.name} className="w-16 h-16 rounded-lg object-cover" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-lg">{partner.name}</h4>
                  <p className="text-sm text-medium-gray mb-1">{partner.location}</p>
                  <p className="text-primary-teal text-sm">{partner.partnership}</p>
                </div>
                <div className="flex-shrink-0">
                  <button className="text-primary-red hover:underline">
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <button className="w-full mt-6 bg-primary-teal text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2">
            <i className="fas fa-handshake"></i>
            View All Partnerships
          </button>
        </div>
      </motion.section>
      
      {/* Campus Facilities Section with Image Cards */}
      <motion.section 
        variants={itemVariants}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 md:p-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">Campus Life & Facilities</h2>
        <p className="text-center text-medium-gray mb-8 max-w-3xl mx-auto">
          Experience a dynamic and supportive campus environment, with a wide range of facilities and activities
        </p>
        
        <div className="flex flex-nowrap overflow-x-auto gap-6 py-4 scrollbar-hide">
          {campusFacilities.map((facility, index) => (
            <div 
              key={index}
              className={`flex-shrink-0 w-[280px] group cursor-pointer`}
              onClick={() => setActiveFacility(index)}
            >
              <div className={`
                relative h-60 rounded-xl overflow-hidden shadow-md transition-all duration-300
                ${activeFacility === index ? 'ring-4 ring-primary-red' : ''}
              `}>
                <img 
                  src={facility.image} 
                  alt={facility.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <i className={`${facility.icon} text-white`}></i>
                      </div>
                      <h3 className="text-white font-semibold ml-2">{facility.name}</h3>
                    </div>
                    <p className="text-white/80 text-sm line-clamp-2">
                      {facility.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-center">
          {campusFacilities.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveFacility(index)}
              className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
                index === activeFacility ? 'bg-primary-red scale-125' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <motion.div 
          key={activeFacility}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-10 bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-red-light flex items-center justify-center mr-3">
              <i className={`${campusFacilities[activeFacility].icon} text-primary-red`}></i>
            </div>
            <h3 className="text-xl font-semibold">{campusFacilities[activeFacility].name}</h3>
          </div>
          <p className="text-dark-gray mb-4">{campusFacilities[activeFacility].description}</p>
          <button className="text-primary-red font-medium flex items-center gap-2 hover:underline">
            Learn more <i className="fas fa-arrow-right text-sm"></i>
          </button>
        </motion.div>
      </motion.section>
      
      {/* Contact Section */}
      <motion.section variants={itemVariants} className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 p-8">
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-5 rounded-xl flex items-start">
                <div className="bg-red-light rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0 mr-3">
                  <i className="fas fa-map-marker-alt text-primary-red"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Address:</h4>
                  <p className="text-dark-gray text-sm">Survey No: 62/1A, Bahadurpally, Jeedimetla, Hyderabad - 500043, Telangana, India</p>
                </div>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl flex items-start">
                <div className="bg-red-light rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0 mr-3">
                  <i className="fas fa-phone text-primary-red"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Contact:</h4>
                  <p className="text-dark-gray text-sm">+91 40 6722 9999</p>
                  <p className="text-dark-gray text-sm">+91 40 6722 8000</p>
                </div>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl flex items-start">
                <div className="bg-red-light rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0 mr-3">
                  <i className="fas fa-envelope text-primary-red"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Email:</h4>
                  <p className="text-dark-gray text-sm">info@mahindrauniversity.edu.in</p>
                  <p className="text-dark-gray text-sm">admissions@mahindrauniversity.edu.in</p>
                </div>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl flex items-start">
                <div className="bg-red-light rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0 mr-3">
                  <i className="fas fa-clock text-primary-red"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Office Hours:</h4>
                  <p className="text-dark-gray text-sm">Monday to Friday: 9:00 AM - 5:00 PM</p>
                  <p className="text-dark-gray text-sm">Saturday: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#3b5998] text-white rounded-lg hover:bg-opacity-90">
                <i className="fab fa-facebook-f"></i>
                Facebook
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1da1f2] text-white rounded-lg hover:bg-opacity-90">
                <i className="fab fa-twitter"></i>
                Twitter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg hover:bg-opacity-90">
                <i className="fab fa-linkedin-in"></i>
                LinkedIn
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#ff0000] text-white rounded-lg hover:bg-opacity-90">
                <i className="fab fa-youtube"></i>
                YouTube
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary-red to-primary-teal text-white p-8 flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-4">Request Information</h3>
            <p className="mb-6">Interested in learning more about our programs? Fill out the form to get in touch with our admissions team.</p>
            <button className="bg-white text-primary-red py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center">
              Contact Admissions
            </button>
            <div className="mt-8 pt-6 border-t border-white/20">
              <h4 className="font-medium mb-2">Download Resources</h4>
              <div className="space-y-3">
                <button className="flex items-center text-white hover:underline w-full text-left">
                  <i className="fas fa-file-pdf mr-2"></i>
                  University Brochure
                </button>
                <button className="flex items-center text-white hover:underline w-full text-left">
                  <i className="fas fa-file-pdf mr-2"></i>
                  Fee Structure
                </button>
                <button className="flex items-center text-white hover:underline w-full text-left">
                  <i className="fas fa-file-pdf mr-2"></i>
                  Application Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      
    </motion.div>
  );
};

export default Overview;
