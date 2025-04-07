import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../CSS/clubs-events.css'; // Still importing for animations and complex styles

const ClubsEvents = () => {
  // State for clubs data
  const [clubsData, setClubsData] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useAuth();

  // Initial clubs data
  useEffect(() => {
    // This would be fetched from an API in a real application
    const initialClubs = [
      { 
        name: "Robotics Club", 
        image: "/api/placeholder/150/150?text=Robotics",
        description: "Building and programming robots, exploring automation and artificial intelligence.",
        instagram: "mu_robotics",
        email: "robotics@mahindra.edu.in",
        location: "Engineering Block, Lab 204",
        category: "technical"
      },
      { 
        name: "Synolo Club", 
        image: "/api/placeholder/150/150?text=Synolo",
        description: "Fostering innovation and creativity through interdisciplinary collaboration and project-based learning.",
        instagram: "mu_synolo",
        email: "synolo@mahindra.edu.in",
        location: "Innovation Hub, Room 301",
        category: "technical"
      },
      {
        name: "Music Club",
        image: "/api/placeholder/150/150?text=Music",
        description: "Explore your musical talents and perform together.",
        instagram: "mu_music",
        email: "music@mahindra.edu.in",
        location: "Arts Center, Room 101",
        category: "non-technical"
      },
      {
        name: "Dance Club",
        image: "/api/placeholder/150/150?text=Dance",
        description: "Express yourself through movement and choreography.",
        instagram: "mu_dance",
        email: "dance@mahindra.edu.in",
        location: "Arts Center, Dance Studio",
        category: "non-technical"
      },
      {
        name: "Art Club",
        image: "/api/placeholder/150/150?text=Art",
        description: "Explore various art forms and techniques.",
        instagram: "mu_art",
        email: "art@mahindra.edu.in",
        location: "Arts Center, Studio 204",
        category: "non-technical"
      },
      {
        name: "Science Club",
        image: "/api/placeholder/150/150?text=Science",
        description: "Discover the wonders of science through experiments.",
        instagram: "mu_science",
        email: "science@mahindra.edu.in",
        location: "Science Building, Lab 105",
        category: "technical"
      },
      {
        name: "Sports Club",
        image: "/api/placeholder/150/150?text=Sports",
        description: "Stay active and competitive in various sports.",
        instagram: "mu_sports",
        email: "sports@mahindra.edu.in",
        location: "Sports Complex, Office 12",
        category: "non-technical"
      },
      { 
        name: "AI/ML Club", 
        image: "/api/placeholder/150/150?text=AI/ML",
        description: "Exploring artificial intelligence and machine learning technologies and applications.",
        instagram: "mu_aiml",
        email: "aiml@mahindra.edu.in",
        location: "Technology Center, Room 303",
        category: "technical"
      },
      { 
        name: "Cybersecurity Club", 
        image: "/api/placeholder/150/150?text=CyberSec",
        description: "Learning about cybersecurity principles, ethical hacking, and data protection.",
        instagram: "mu_cybersec",
        email: "cybersecurity@mahindra.edu.in",
        location: "Engineering Block, Lab 210",
        category: "technical"
      },
      { 
        name: "IoT Club", 
        image: "/api/placeholder/150/150?text=IoT",
        description: "Building projects related to Internet of Things and connected devices.",
        instagram: "mu_iot",
        email: "iot@mahindra.edu.in",
        location: "Technology Center, Room 305",
        category: "technical"
      }
    ];

    setClubsData(initialClubs);
    
    // Try to load saved data from localStorage
    const savedClubsData = localStorage.getItem('clubsData');
    const savedClubDetails = localStorage.getItem('clubDetails');
    
    if (savedClubsData && savedClubDetails) {
      try {
        setClubsData(JSON.parse(savedClubsData));
        // We'll handle club details in ClubDetail component
      } catch (error) {
        console.error("Error loading saved clubs data:", error);
      }
    }
  }, []);

  // Save updated clubs data to localStorage
  const saveToLocalStorage = (updatedClubsData) => {
    localStorage.setItem('clubsData', JSON.stringify(updatedClubsData));
  };

  // Handle adding a new club
  const handleAddClub = (formData) => {
    const newClub = {
      name: formData.clubName,
      image: `/api/placeholder/150/150?text=${encodeURIComponent(formData.clubName)}`,
      description: formData.clubDescription,
      category: formData.clubCategory,
      email: formData.clubEmail || `${formData.clubName.toLowerCase().replace(/\s+/g, '')}@mahindra.edu.in`,
      location: formData.clubLocation || "Main Campus",
      instagram: `mu_${formData.clubName.toLowerCase().replace(/\s+/g, '')}`
    };

    const updatedClubsData = [newClub, ...clubsData];
    setClubsData(updatedClubsData);
    saveToLocalStorage(updatedClubsData);
    setShowModal(false);
  };

  // Delete a club
  const handleDeleteClub = (clubName) => {
    if (window.confirm(`Are you sure you want to delete ${clubName}?`)) {
      const updatedClubsData = clubsData.filter(club => club.name !== clubName);
      setClubsData(updatedClubsData);
      saveToLocalStorage(updatedClubsData);
      setSelectedClub(null);
    }
  };

  // Club form submission
  const handleFormSubmit = (event) => {
    event.preventDefault();
    
    const formData = {
      clubName: event.target.clubName.value,
      clubDescription: event.target.clubDescription.value,
      clubCategory: event.target.clubCategory.value,
      clubEmail: event.target.clubEmail.value,
      clubLocation: event.target.clubLocation.value
    };

    // Validate required fields
    if (!formData.clubName || !formData.clubDescription || !formData.clubCategory) {
      alert("Please fill in all required fields");
      return;
    }

    handleAddClub(formData);
  };

  // Render the club grid
  const renderClubs = () => {
    return clubsData.map((club, index) => (
      <div 
        key={index}
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 h-full flex flex-col"
        onClick={() => setSelectedClub(club)}
      >
        <div className="overflow-hidden bg-gray-100 relative w-full" style={{paddingTop: '66.67%'}}>
          <img 
            src={club.image} 
            alt={`${club.name} logo`}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <h3 className="px-5 pt-5 pb-2 text-lg font-semibold text-gray-800">{club.name}</h3>
        <p className="px-5 pb-5 text-gray-600 text-sm line-clamp-3 flex-grow">{club.description}</p>
      </div>
    ));
  };

  return (
    <div className="-mt-20 w-full bg-gray-50 min-h-screen pb-8">
      {/* Hero Header Section with background image - Full Width */}
      <header className="w-full bg-cover bg-center pt-28 pb-16 px-6 text-center text-white relative" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80")'
        }}>
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">MAHINDRA UNIVERSITY CLUBS</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto drop-shadow">Discover and Join Our Vibrant Club Community</p>
        </div>
      </header>

      {/* Description Section - Full Width with contained content */}
      <div className="w-full bg-white border-b border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary-red mb-4">Welcome to Our Club Community</h2>
          <p className="text-lg text-gray-700 max-w-3xl mb-8 leading-relaxed">Explore diverse clubs that cater to your interests and passions. Join a community of like-minded individuals, develop new skills, and make lasting connections.</p>
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-12 mb-10">
            <div className="flex items-center gap-3">
              <i className="fas fa-users text-2xl text-primary-red"></i>
              <span className="text-lg text-gray-800">{clubsData.length}+ Active Clubs</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-calendar-alt text-2xl text-primary-red"></i>
              <span className="text-lg text-gray-800">Regular Events</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-star text-2xl text-primary-red"></i>
              <span className="text-lg text-gray-800">Diverse Interests</span>
            </div>
          </div>
          
          {/* Add Club Button - Only show for admins and club heads */}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'clubHead') && (
            <button 
              className="bg-primary-red text-white rounded-full px-6 py-3 font-medium flex items-center gap-2 shadow-md hover:bg-secondary-red hover:-translate-y-1 transition-all duration-300"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-plus"></i> Add New Club
            </button>
          )}
        </div>
      </div>

      {/* Club Categories Navigation */}
      <div className="sticky top-16 md:top-20 z-30 w-full bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto gap-4 scrollbar-hide">
          <button className="whitespace-nowrap rounded-full px-5 py-2 bg-primary-red text-white font-medium hover:bg-secondary-red transition-colors">All Clubs</button>
          <button className="whitespace-nowrap rounded-full px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 transition-colors">Technical</button>
          <button className="whitespace-nowrap rounded-full px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 transition-colors">Non-Technical</button>
          <button className="whitespace-nowrap rounded-full px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 transition-colors">Arts & Culture</button>
          <button className="whitespace-nowrap rounded-full px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 transition-colors">Sports</button>
        </div>
      </div>

      {/* Clubs Grid - Full Width with contained content */}
      <div className="w-full py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {renderClubs()}
          </div>
        </div>
      </div>

      {/* Club Detail Component */}
      {selectedClub && (
        <ClubDetail 
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          onDelete={handleDeleteClub}
          canDelete={currentUser && (currentUser.role === 'admin' || currentUser.role === 'clubHead')}
        />
      )}

      {/* Add Club Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-800">Add New Club</h2>
              <button 
                type="button" 
                className="text-3xl text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form id="club-form" onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="clubName" className="block text-gray-700 font-medium mb-2">Club Name*</label>
                  <input 
                    type="text" 
                    id="clubName" 
                    name="clubName" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="clubDescription" className="block text-gray-700 font-medium mb-2">Club Description*</label>
                  <textarea 
                    id="clubDescription" 
                    name="clubDescription" 
                    rows="4" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="clubCategory" className="block text-gray-700 font-medium mb-2">Club Category*</label>
                  <select 
                    id="clubCategory" 
                    name="clubCategory" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical</option>
                    <option value="non-technical">Non-Technical</option>
                    <option value="arts">Arts & Culture</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="clubEmail" className="block text-gray-700 font-medium mb-2">Club Email</label>
                  <input 
                    type="email" 
                    id="clubEmail" 
                    name="clubEmail" 
                    placeholder="club@mahindra.edu.in" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                  />
                </div>
                
                <div>
                  <label htmlFor="clubLocation" className="block text-gray-700 font-medium mb-2">Club Location</label>
                  <input 
                    type="text" 
                    id="clubLocation" 
                    name="clubLocation" 
                    placeholder="Building, Room Number" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-200 p-6 flex justify-end">
                <button 
                  type="submit" 
                  className="bg-primary-red text-white px-6 py-3 rounded-md font-medium hover:bg-secondary-red transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-save"></i> Save Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Club Detail Component
const ClubDetail = ({ club, onClose, onDelete, canDelete }) => {
  // Club details data with events, members, etc.
  const clubDetails = {
    "Synolo Club": {
      mentors: ["Dr. Sarah Wilson", "Prof. Michael Chen"],
      members: ["Raj Kumar", "Priya Singh", "John Doe", "Emma Watson"],
      currentEvents: [
        {
          title: "Innovation Workshop 2024",
          caption: "Learn about latest technologies and innovative problem-solving approaches",
          date: "April 20",
          formLink: "https://forms.google.com/synolo-workshop"
        }
      ],
      pastEvents: [
        {
          title: "Project Showcase",
          caption: "Annual interdisciplinary project exhibition",
          date: "March 5",
          galleryLink: "#"
        }
      ]
    },
    "Robotics Club": {
      mentors: ["Dr. James Smith", "Prof. Robert Johnson"],
      members: ["Alex Turner", "Jamie Lee", "Sam Parker", "David Miller"],
      currentEvents: [
        {
          title: "Arduino Masterclass",
          caption: "Hands-on workshop with Arduino programming",
          date: "April 15",
          formLink: "https://forms.google.com/robotics-arduino"
        }
      ],
      pastEvents: [
        {
          title: "National Robotics Competition",
          caption: "First place in autonomous navigation challenge",
          date: "February 10",
          galleryLink: "#"
        }
      ]
    },
    "AI/ML Club": {
      mentors: ["Dr. Lisa Chen", "Prof. Mark Anderson"],
      members: ["Tony Stark", "Peter Parker", "Bruce Banner"],
      currentEvents: [
        {
          title: "Deep Learning Workshop",
          caption: "Introduction to Neural Networks and PyTorch",
          date: "April 25",
          formLink: "https://forms.google.com/aiml-workshop"
        }
      ],
      pastEvents: [
        {
          title: "AI Project Showcase",
          caption: "Demonstrating machine learning applications",
          date: "March 15",
          galleryLink: "#"
        }
      ]
    },
    "Cybersecurity Club": {
      mentors: ["Dr. Alan Turing", "Prof. Ada Lovelace"],
      members: ["Edward Snowden", "Julian Assange", "Chelsea Manning"],
      currentEvents: [
        {
          title: "Ethical Hacking Workshop",
          caption: "Learn penetration testing and security basics",
          date: "May 1",
          formLink: "https://forms.google.com/cyber-workshop"
        }
      ],
      pastEvents: [
        {
          title: "CTF Competition",
          caption: "Capture The Flag security challenge",
          date: "March 20",
          galleryLink: "#"
        }
      ]
    },
    "IoT Club": {
      mentors: ["Dr. Kevin Internet", "Prof. Sarah Smart"],
      members: ["John Device", "Mary Sensor", "Bob Network"],
      currentEvents: [
        {
          title: "Smart Home Project",
          caption: "Build your own IoT-based home automation system",
          date: "April 30",
          formLink: "https://forms.google.com/iot-workshop"
        }
      ],
      pastEvents: [
        {
          title: "IoT Expo",
          caption: "Showcasing student IoT projects",
          date: "March 25",
          galleryLink: "#"
        }
      ]
    }
  };

  // Get details for the selected club, or use defaults if not found
  const details = clubDetails[club.name] || {
    mentors: ["To be announced"],
    members: ["Open for membership"],
    currentEvents: [],
    pastEvents: []
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-40 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <button 
          className="flex items-center text-primary-red hover:-translate-x-2 transition-transform duration-200 font-medium mb-8"
          onClick={onClose}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Clubs
        </button>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">{club.name}</h2>
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-lg text-gray-600 leading-relaxed">{club.description}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            <div className="flex items-center gap-3">
              <i className="fab fa-instagram text-primary-red text-xl"></i>
              <a 
                href={`https://instagram.com/${club.instagram}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                @{club.instagram}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <i className="far fa-envelope text-primary-red text-xl"></i>
              <a 
                href={`mailto:${club.email}`}
                className="text-blue-600 hover:underline"
              >
                {club.email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-map-marker-alt text-primary-red text-xl"></i>
              <span className="text-gray-700">{club.location}</span>
            </div>
          </div>
          {canDelete && (
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded flex items-center gap-2 mx-auto transition-colors"
              onClick={() => onDelete(club.name)}
            >
              <i className="fas fa-trash"></i> Delete Club
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-50 rounded-xl p-7 shadow border border-gray-200">
            <h3 className="text-xl font-semibold text-primary-red mb-5 pb-3 border-b border-gray-200">Members & Mentors</h3>
            <div>
              <h4 className="font-medium text-lg mt-5 mb-2 text-gray-800">Mentors:</h4>
              <ul className="list-disc pl-7 mb-5 text-gray-700">
                {details.mentors.map((mentor, idx) => (
                  <li key={`mentor-${idx}`} className="mb-1">{mentor}</li>
                ))}
              </ul>
              <h4 className="font-medium text-lg mb-2 text-gray-800">Members:</h4>
              <ul className="list-disc pl-7 text-gray-700">
                {details.members.map((member, idx) => (
                  <li key={`member-${idx}`} className="mb-1">{member}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-7 shadow border border-gray-200">
            <h3 className="text-xl font-semibold text-primary-red mb-5 pb-3 border-b border-gray-200">Current Events</h3>
            <div>
              {details.currentEvents.length > 0 ? (
                details.currentEvents.map((event, idx) => (
                  <div className="mb-6 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-0" key={`current-${idx}`}>
                    <div className="font-semibold text-gray-800 mb-1">{event.title} ({event.date})</div>
                    <div className="text-gray-600 mb-2">{event.caption}</div>
                    {event.formLink && (
                      <a href={event.formLink} target="_blank" rel="noopener noreferrer" className="text-primary-red font-medium flex items-center gap-2 hover:underline">
                        <i className="fas fa-external-link-alt"></i>
                        Register Now
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-700">
                  <div className="font-semibold mb-1">No current events</div>
                  <div className="text-gray-600">Check back later for upcoming events</div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-7 shadow border border-gray-200">
            <h3 className="text-xl font-semibold text-primary-red mb-5 pb-3 border-b border-gray-200">Past Events</h3>
            <div>
              {details.pastEvents.length > 0 ? (
                details.pastEvents.map((event, idx) => (
                  <div className="mb-6 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-0" key={`past-${idx}`}>
                    <div className="font-semibold text-gray-800 mb-1">{event.title} ({event.date})</div>
                    <div className="text-gray-600 mb-2">{event.caption}</div>
                    {event.galleryLink && (
                      <a href={event.galleryLink} className="text-primary-red font-medium flex items-center gap-2 hover:underline">
                        <i className="fas fa-images"></i>
                        View Gallery
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-700">
                  <div className="font-semibold mb-1">No past events</div>
                  <div className="text-gray-600">The club hasn't organized any events yet</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Gallery</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, idx) => (
              <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow" key={idx}>
                <div className="relative w-full" style={{paddingTop: '66.67%'}}>
                  <img 
                    src="/api/placeholder/300/200" 
                    alt={`Gallery ${idx + 1}`} 
                    className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubsEvents;