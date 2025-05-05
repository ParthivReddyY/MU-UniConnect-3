import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Overview = () => {
  const [activeProgram, setActiveProgram] = useState('engineering');
  const [activeFacility, setActiveFacility] = useState(0);
  const [activeLeader, setActiveLeader] = useState(0); // Add state for carousel
  const [activePartnersPage, setActivePartnersPage] = useState(0);
  const carouselTimerRef = useRef(null);
  const partnersCarouselRef = useRef(null);

  const universityStats = [
    { label: "Founded", value: "2014", icon: "fas fa-calendar-day" },
    { label: "Campus Size", value: "130 Acres", icon: "fas fa-ruler-combined" },
    { label: "Students", value: "2,500+", icon: "fas fa-user-graduate" },
    { label: "Faculty", value: "300+", icon: "fas fa-chalkboard-teacher" },
  ];
  
  const academicPrograms = {
    engineering: {
      name: "Mahindra Ecole School of Engineering",
      icon: "fas fa-cogs",
      color: "#e74c3c",
      programs: {
        btech: [
          "AI (Artificial Intelligence)",
          "Biotechnology",
          "Computational Biology",
          "CSE (Computer Science and Engineering)",
          "Civil Engineering",
          "CM (Computation and Mathematics)",
          "ECM (Electronics and Computer Engineering)",
          "Mechanical Engineering (ME)",
          "Mechatronics (MT)",
          "Nanotechnology",
          "ECE (Electronics and Communication Engineering)",
          "Aerospace Engineering",
          "Electronic and Computer Engineering",
          "VLSI Design and Technology",
          "5 Year MTECH-Computer Science and Engineering",
          "5 Year Integrated MTECH-Biotechnology"
        ],
        mtech: [
          "Autonomous Electric Vehicles (A-EV's)",
          "Computer-Aided Structural Engineering",
          "AI and Data Science",
          "Systems Engineering",
          "VLSI Design and Embedded Systems",
          "Smart Grid and Energy Storage Technologies",
          "Robotics",
          "Transportation Engineering",
          "Computational Mechanics",
          "Biomedical Data Science"
        ],
        phd: [
          "Physics",
          "Civil Engineering",
          "Electrical and Computer Engineering",
          "Mathematics",
          "Mechanical and Aerospace Engineering",
          "Humanities and Social Sciences",
          "Life Sciences"
        ]
      },
      description: "Our engineering programs combine theoretical knowledge with practical experience, preparing students for careers in various engineering disciplines."
    },
    management: {
      name: "School of Management",
      icon: "fas fa-chart-line",
      color: "#3498db",
      programs: {
        bba: [
          "Applied Economics and Finance",
          "Digital Technologies",
          "Computational Business Analytics"
        ],
        mba: ["Master of Business Administration"],
        phd: [
          "Ph.D. in Economics",
          "Ph.D. in Finance",
          "Ph.D. in Decision Sciences",
          "Ph.D. in Marketing",
          "Ph.D. in Management (Strategy, Entrepreneurship, Organizational Behaviour, HRM)",
          "Ph.D. in Information Science and Technology"
        ]
      },
      description: "The School of Management offers programs designed to develop future business leaders with innovative thinking and strategic management skills."
    },
    law: {
      name: "School of Law",
      icon: "fas fa-gavel",
      color: "#8e44ad",
      programs: {
        undergraduate: [
          "BA.LL.B.",
          "B.B.A.LL.B.",
          "3-Years LL.B. (Hons) with specializations in Corporate Law, Business Laws, Criminal Law, and more",
          "B.Tech.-LL.B. (Hons): Integrated Dual-Degree Program"
        ],
        phd: [
          "Ph.D. in Constitutional Law and Administrative Law",
          "Ph.D. in Corporate Law and Business Law",
          "Ph.D. in International Law",
          "Ph.D. in Technology Law",
          "Ph.D. in Air and Space Law",
          "Ph.D. in Maritime and Defence Law"
        ]
      },
      description: "The School of Law prepares students with comprehensive legal knowledge and ethical practices for careers in law and justice."
    },
    education: {
      name: "Indira Mahindra School of Education",
      icon: "fas fa-graduation-cap",
      color: "#f39c12",
      programs: {
        masters: ["Master of Arts (M.A.) in Education"],
        phd: [
          "Ph.D. in School Education",
          "Ph.D. in Higher Education",
          "Ph.D. in Sociology of Education",
          "Ph.D. in Educational Leadership and Management",
          "Ph.D. in Psychology of Education",
          "Ph.D. in Educational Innovations",
          "Ph.D. in History Of Education",
          "Ph.D. in Economics Of Education",
          "Ph.D. in Teacher Education",
          "Ph.D. in Educational Policy Studies",
          "Ph.D. in Political Contexts Of Education",
          "Ph.D. in Curriculum and Pedagogical Studies",
          "Ph.D. in Technology and Education"
        ]
      },
      description: "Our education programs develop skilled teachers and educational leaders who can make a difference in students' lives."
    },
    media: {
      name: "School of Digital Media and Communication",
      icon: "fas fa-camera-retro",
      color: "#2ecc71",
      programs: {
        undergraduate: [
          "B.Tech (Computation and Media)",
          "Bachelor of Journalism and Mass Communication"
        ],
        masters: ["MA in Journalism and Mass Communication"],
        phd: [
          "Ph.D. in Journalism Studies",
          "Ph.D. in Media Studies",
          "Ph.D. in Mass Communication",
          "Ph.D. in Film and Television Studies",
          "Ph.D. in Strategic Communication",
          "Ph.D. in Media and Communication Management",
          "Ph.D. in History, Technology and Systems Of Media and Communication",
          "Ph.D. in Ethics, Policies and Laws of Mediated Communication",
          "Ph.D. in Human and Machine-Interface Communication"
        ]
      },
      description: "The School of Digital Media and Communication offers cutting-edge programs at the intersection of technology, media, and communication."
    },
    design: {
      name: "School of Design Innovation",
      icon: "fas fa-pencil-ruler",
      color: "#e67e22",
      programs: {
        undergraduate: ["B.Des in Design Innovation"],
        masters: ["M.Des in Design Innovation"],
        phd: [
          "Ph.D. in Design Thinking",
          "Ph.D. in Online and Scalable Design Education",
          "Ph.D. in Design For Sustainability",
          "Ph.D. in Design For Empathy in HCI"
        ]
      },
      description: "The School of Design Innovation nurtures creative problem-solvers with a focus on user-centered and sustainable design principles."
    },
    hospitality: {
      name: "School of Hospitality Management",
      icon: "fas fa-concierge-bell",
      color: "#9b59b6",
      programs: {
        undergraduate: ["4-Yr B.Sc. (Hons.) Culinary and Hospitality Management"]
      },
      description: "Our Hospitality Management program combines culinary arts with hospitality business skills for careers in the global hospitality industry."
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
      name: "Cornell University – SC Johnson College of Business",
      location: "Ithaca, New York, USA",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450441/sc_rwj9ii.jpg",
      courses: ["MBA", "Master of Professional Studies in Management"],
      website: "business.cornell.edu"
    },
    {
      name: "Virginia Tech",
      location: "Blacksburg, Virginia, USA",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450441/VT_gn3g1l.jpg",
      courses: ["Bachelor of Science in Computer Engineering", "MBA"],
      website: "vt.edu"
    },
    {
      name: "CentraleSupélec",
      location: "Gif-sur-Yvette, Île-de-France, France",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450441/cs_pmco9g.jpg",
      courses: ["Master in Engineering", "MSc in Artificial Intelligence"],
      website: "centralesupelec.fr"
    },
    {
      name: "Frankfurt University of Applied Sciences",
      location: "Frankfurt am Main, Germany",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746451456/aps_sc_alzxqx.svg",
      courses: ["Bachelor in International Business Administration", "MSc in Information Technology"],
      website: "frankfurt-university.de"
    },
    {
      name: "Babson College",
      location: "Wellesley, Massachusetts, USA",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450441/babson_dyslgm.jpg",
      courses: ["Bachelor of Science in Business Administration", "MBA"],
      website: "babson.edu"
    },
    {
      name: "University of Florida",
      location: "Gainesville, Florida, USA",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450445/Uni_of_Florida_lfebda.jpg",
      courses: ["Bachelor of Science in Mechanical Engineering", "MBA"],
      website: "ufl.edu"
    },
    {
      name: "University of Agder",
      location: "Kristiansand and Grimstad, Norway",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450442/uni_of_agder-9-600x160_oalisr.png",
      courses: ["MSc in Information and Communication Technology", "MSc in Business Administration"],
      website: "uia.no"
    },
    {
      name: "La Trobe University",
      location: "Melbourne (Bundoora), Victoria, Australia",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450443/latrobe-600x172_m570hz.png",
      courses: ["Bachelor of Nursing", "Master of Business Analytics"],
      website: "latrobe.edu.au"
    },
    {
      name: "The University of Melbourne",
      location: "Melbourne, Victoria, Australia",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450444/melbourne-600x600_iofeap.png",
      courses: ["Doctor of Medicine (MD)", "Master of Engineering"],
      website: "unimelb.edu.au"
    },
    {
      name: "Frankfurt School of Finance & Management",
      location: "Frankfurt am Main, Germany",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450442/frank_pigthy.jpg",
      courses: ["Bachelor in Business Administration", "Master in Finance"],
      website: "frankfurt-school.de"
    },
    {
      name: "Southern Illinois University",
      location: "Carbondale, Illinois, USA",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450445/SIU_no6mgl.png",
      courses: ["Bachelor of Science in Aviation Management", "Master of Computer Science"],
      website: "siu.edu"
    },
    {
      name: "Oklahoma State University",
      location: "Stillwater, Oklahoma, USA",
      logo: "https://res.cloudinary.com/dmny4ymqp/image/upload/v1746450443/OSU_m68wb4.png",
      courses: ["Bachelor of Science in Aerospace Engineering", "MBA"],
      website: "okstate.edu"
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

  // Function to navigate to next leader in carousel
  const nextLeader = () => {
    setActiveLeader((prev) => (prev + 1) % leadership.length);
  };

  // Function to navigate to previous leader in carousel
  const prevLeader = () => {
    setActiveLeader((prev) => (prev === 0 ? leadership.length - 1 : prev - 1));
  };

  // Auto-rotate the carousel every 6 seconds
  useEffect(() => {
    // Start the timer
    carouselTimerRef.current = setInterval(() => {
      nextLeader();
    }, 6000); // 6 seconds
    
    // Cleanup the timer on component unmount
    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, []); // Empty dependency array ensures this only runs once on mount
  
  // Reset the timer whenever the user manually changes the slide
  const handleManualNavigation = (action) => {
    // Clear the existing timer
    if (carouselTimerRef.current) {
      clearInterval(carouselTimerRef.current);
    }
    
    // Perform the navigation action
    action();
    
    // Restart the timer
    carouselTimerRef.current = setInterval(() => {
      nextLeader();
    }, 6000);
  };

  // Calculate the number of pages for the partners carousel (3 partners per page)
  const totalPartnerPages = Math.ceil(globalPartners.length / 3);
  
  // Function to navigate to next page in the partners carousel
  const nextPartnersPage = () => {
    setActivePartnersPage((prev) => (prev + 1) % totalPartnerPages);
  };

  // Function to navigate to previous page in the partners carousel
  const prevPartnersPage = () => {
    setActivePartnersPage((prev) => (prev === 0 ? totalPartnerPages - 1 : prev - 1));
  };
  
  // Auto-rotate the partners carousel every 8 seconds
  useEffect(() => {
    // Start the timer
    partnersCarouselRef.current = setInterval(() => {
      nextPartnersPage();
    }, 8000); // 8 seconds
    
    // Cleanup the timer on component unmount
    return () => {
      if (partnersCarouselRef.current) {
        clearInterval(partnersCarouselRef.current);
      }
    };
  }, []); // Empty dependency array ensures this only runs once on mount
  
  // Reset the partners carousel timer whenever the user manually changes the slide
  const handlePartnersNavigation = (action) => {
    // Clear the existing timer
    if (partnersCarouselRef.current) {
      clearInterval(partnersCarouselRef.current);
    }
    
    // Perform the navigation action
    action();
    
    // Restart the timer
    partnersCarouselRef.current = setInterval(() => {
      nextPartnersPage();
    }, 8000);
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
              <p className="text-white/90">
                {academicPrograms[activeProgram].description}
              </p>
            </div>
            <div className="md:w-2/3 p-6 md:p-8 overflow-y-auto max-h-[600px]">
              <h4 className="text-xl font-semibold mb-4">Available Programs</h4>
              <div className="space-y-6">
                {Object.keys(academicPrograms[activeProgram].programs).map((level, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary-teal/10 text-primary-teal p-2 rounded-full mr-4">
                        {level === 'btech' && <i className="fas fa-laptop-code"></i>}
                        {level === 'mtech' && <i className="fas fa-microchip"></i>}
                        {level === 'phd' && <i className="fas fa-atom"></i>}
                        {level === 'bba' && <i className="fas fa-chart-bar"></i>}
                        {level === 'mba' && <i className="fas fa-briefcase"></i>}
                        {level === 'undergraduate' && <i className="fas fa-user-graduate"></i>}
                        {level === 'masters' && <i className="fas fa-scroll"></i>}
                      </div>
                      <h5 className="font-medium capitalize text-lg">
                        {level === 'phd' ? 'Ph.D. Programs' : 
                         level === 'btech' ? 'B.Tech. Programs' :
                         level === 'mtech' ? 'M.Tech. Programs' :
                         level === 'bba' ? 'BBA Programs' :
                         level === 'mba' ? 'MBA Programs' :
                         level === 'undergraduate' ? 'Undergraduate Programs' :
                         level === 'masters' ? 'Master\'s Programs' : level}
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-12">
                      {academicPrograms[activeProgram].programs[level].map((program, i) => (
                        <div key={i} className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                          <span className="text-medium-gray">{program}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>
      
      {/* Leadership Section with Carousel */}
      <motion.section variants={itemVariants} className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary-red to-primary-teal p-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">University Leadership</h2>
          <p className="text-white/80">
            Meet the visionaries guiding Mahindra University to excellence
          </p>
        </div>
        
        {/* Carousel display for leadership */}
        <div className="p-8 relative">
          <div className="relative overflow-hidden">
            <motion.div 
              key={activeLeader}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="bg-gray-50 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="md:flex">
                {/* Fixed size image container */}
                <div className="md:w-2/5">
                  <div className="h-64 md:h-80 overflow-hidden bg-gray-200">
                    <img 
                      src={leadership[activeLeader].image} 
                      alt={leadership[activeLeader].name} 
                      className="w-full h-full object-cover object-top" 
                    />
                  </div>
                </div>
                <div className="p-6 md:w-3/5">
                  <h3 className="text-2xl font-bold mb-1">{leadership[activeLeader].name}</h3>
                  <p className="text-primary-red font-medium mb-4">{leadership[activeLeader].title}</p>
                  <p className="text-dark-gray mb-5 leading-relaxed">{leadership[activeLeader].description}</p>
                  
                  <h4 className="text-lg font-medium mb-3">Key Achievements</h4>
                  <ul className="space-y-2">
                    {leadership[activeLeader].achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-center">
                        <i className="fas fa-award text-primary-teal mr-3"></i>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Carousel navigation buttons */}
          <button 
            onClick={() => handleManualNavigation(prevLeader)}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
          >
            <i className="fas fa-chevron-left text-primary-red"></i>
          </button>
          <button 
            onClick={() => handleManualNavigation(nextLeader)}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
          >
            <i className="fas fa-chevron-right text-primary-red"></i>
          </button>
          
          {/* Carousel indicators */}
          <div className="flex justify-center mt-6">
            {leadership.map((_, index) => (
              <button
                key={index}
                onClick={() => handleManualNavigation(() => setActiveLeader(index))}
                className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
                  index === activeLeader ? 'bg-primary-red scale-125' : 'bg-gray-300'
                }`}
                aria-label={`View ${leadership[index].name}`}
              />
            ))}
          </div>
          
          {/* Leader counter */}
          <div className="absolute bottom-8 right-8 bg-primary-teal/10 text-primary-teal px-3 py-1 rounded-full text-sm font-medium">
            {activeLeader + 1} of {leadership.length}
          </div>
        </div>
      </motion.section>
      
      {/* Global Collaborations - Updated to carousel display */}
      <motion.section variants={itemVariants} className="bg-gray-50 rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-3 flex items-center">
          <i className="fas fa-globe-americas text-primary-teal mr-3"></i>
          Global Collaborations
        </h2>
        <p className="text-center text-medium-gray mb-8">
          We partner with leading international universities to provide our students with global exposure and opportunities.
        </p>
        
        {/* Partners carousel container */}
        <div className="relative">
          {/* Carousel display for partners */}
          <div className="overflow-hidden">
            <motion.div 
              key={activePartnersPage}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {globalPartners
                .slice(activePartnersPage * 3, (activePartnersPage + 1) * 3)
                .map((partner, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="h-40 overflow-hidden bg-gray-100">
                      <img 
                        src={partner.logo} 
                        alt={partner.name} 
                        className="w-full h-full object-contain p-2" 
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-1 text-primary-red">{partner.name}</h4>
                      <div className="flex items-center mb-2 text-sm text-medium-gray">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {partner.location}
                      </div>
                      <h5 className="font-medium text-sm mb-1">Available Courses:</h5>
                      <ul className="text-sm text-medium-gray">
                        {partner.courses.map((course, idx) => (
                          <li key={idx} className="flex items-start mb-1">
                            <i className="fas fa-graduation-cap mt-1 mr-2 text-primary-teal"></i>
                            <span>{course}</span>
                          </li>
                        ))}
                      </ul>
                      <a 
                        href={`https://${partner.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="mt-3 text-primary-teal hover:underline flex items-center text-sm"
                      >
                        <i className="fas fa-globe mr-1"></i> {partner.website}
                      </a>
                    </div>
                  </div>
                ))}
            </motion.div>
          </div>
          
          {/* Carousel navigation buttons */}
          <button 
            onClick={() => handlePartnersNavigation(prevPartnersPage)}
            className="absolute -left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
            aria-label="Previous partners"
          >
            <i className="fas fa-chevron-left text-primary-red"></i>
          </button>
          <button 
            onClick={() => handlePartnersNavigation(nextPartnersPage)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
            aria-label="Next partners"
          >
            <i className="fas fa-chevron-right text-primary-red"></i>
          </button>
          
          {/* Carousel indicators */}
          <div className="flex justify-center mt-6">
            {[...Array(totalPartnerPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePartnersNavigation(() => setActivePartnersPage(index))}
                className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
                  index === activePartnersPage ? 'bg-primary-teal scale-125' : 'bg-gray-300'
                }`}
                aria-label={`Go to partner page ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* View all button - changed to show all collaborations */}
        <div className="mt-8">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h4 className="text-lg font-bold mb-4 text-center">All Global Collaborations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {globalPartners.map((partner, index) => (
                <a 
                  key={index} 
                  href={`https://${partner.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="w-10 h-10 object-contain mr-3"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-sm line-clamp-1">{partner.name}</p>
                    <span className="text-primary-teal text-xs group-hover:underline">{partner.website}</span>
                  </div>
                  <i className="fas fa-external-link-alt text-xs text-medium-gray ml-1"></i>
                </a>
              ))}
            </div>
          </div>
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
              <a href="https://www.facebook.com/MahindraUni" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#3b5998] text-white rounded-lg hover:bg-opacity-90">
                <i className="fab fa-facebook-f"></i>
                Facebook
              </a>
              <a href="https://x.com/MahindraUni" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#1da1f2] text-white rounded-lg hover:bg-opacity-90">
                <i className="fab fa-twitter"></i>
                X (Twitter)
              </a>
              <a href="https://www.linkedin.com/school/mahindra-unversity/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg hover:bg-opacity-90">
                <i className="fab fa-linkedin-in"></i>
                LinkedIn
              </a>
              <a href="https://www.youtube.com/c/MahindraecolecentraleEduIn14/featured" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#ff0000] text-white rounded-lg hover:bg-opacity-90">
                <i className="fab fa-youtube"></i>
                YouTube
              </a>
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
