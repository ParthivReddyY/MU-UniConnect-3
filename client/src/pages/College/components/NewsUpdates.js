import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const NewsUpdates = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [newsItems, setNewsItems] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  // Sample news data - in a real app, fetch this from an API
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const sampleNews = [
        {
          id: 1,
          title: "New Research Center Inauguration",
          excerpt: "Mahindra University is proud to announce the inauguration of our new Advanced Research Center for Innovation which will focus on cutting-edge technology and interdisciplinary research.",
          content: "Mahindra University is proud to announce the inauguration of our new Advanced Research Center for Innovation which will focus on cutting-edge technology and interdisciplinary research. The center will house state-of-the-art laboratories, collaborative workspaces, and innovation hubs to foster research in areas like AI, renewable energy, and biotechnology. The inauguration ceremony will be held on October 15, 2023, with distinguished guests from industry and academia.",
          image: "https://picsum.photos/seed/news1/800/500",
          category: "announcement",
          categoryLabel: "Announcement",
          date: "October 15, 2023",
          author: "Admin Office",
          featured: true
        },
        {
          id: 2,
          title: "International Conference on AI & ML",
          excerpt: "The School of Computer Science is hosting an international conference on Artificial Intelligence and Machine Learning with renowned speakers from around the world.",
          content: "The School of Computer Science is hosting an international conference on Artificial Intelligence and Machine Learning with renowned speakers from around the world. The three-day conference will feature keynote speeches, panel discussions, workshops, and paper presentations covering the latest advancements in AI and ML technologies. Researchers and industry professionals from over 20 countries are expected to participate in this prestigious event.",
          image: "https://picsum.photos/seed/news2/800/500",
          category: "academic",
          categoryLabel: "Academic",
          date: "October 10, 2023",
          author: "School of Computer Science",
          featured: false
        },
        {
          id: 3,
          title: "Annual Cultural Fest 2023",
          excerpt: "Mark your calendars for the most awaited event of the year! The Annual Cultural Fest will take place from November 5-7 with exciting performances, competitions, and celebrity guests.",
          content: "Mark your calendars for the most awaited event of the year! The Annual Cultural Fest will take place from November 5-7 with exciting performances, competitions, and celebrity guests. This year's theme is 'Global Fusion,' celebrating diverse cultures from around the world. The event will feature music concerts, dance performances, art exhibitions, literary competitions, and much more. Don't miss the celebrity performance on the final day!",
          image: "https://picsum.photos/seed/news3/800/500",
          category: "campus",
          categoryLabel: "Campus Life",
          date: "October 8, 2023",
          author: "Student Council",
          featured: true
        },
        {
          id: 4,
          title: "Record Placements for Class of 2023",
          excerpt: "Mahindra University is proud to announce a record placement season with over 95% of eligible students receiving offers from top companies with the highest package touching 45 LPA.",
          content: "Mahindra University is proud to announce a record placement season with over 95% of eligible students receiving offers from top companies with the highest package touching 45 LPA. Over 100 companies participated in the campus recruitment process, including tech giants, consulting firms, and startups. The average package saw a 15% increase compared to last year, reflecting the high quality of education and industry-relevant skills our students possess.",
          image: "https://picsum.photos/seed/news4/800/500",
          category: "placement",
          categoryLabel: "Placement",
          date: "October 5, 2023",
          author: "Placement Cell",
          featured: false
        },
        {
          id: 5,
          title: "New Sports Complex Opening",
          excerpt: "Mahindra University is excited to announce the opening of our state-of-the-art sports complex with Olympic-sized swimming pool, indoor courts, and fitness center.",
          content: "Mahindra University is excited to announce the opening of our state-of-the-art sports complex with Olympic-sized swimming pool, indoor courts, and fitness center. The 10-acre facility includes multi-purpose indoor courts for basketball, volleyball, and badminton, an Olympic-sized swimming pool, a 400-meter track, cricket and football fields, and a modern fitness center equipped with the latest exercise machines. The complex will be open to all students, faculty, and staff from October 15.",
          image: "https://picsum.photos/seed/news5/800/500",
          category: "infrastructure",
          categoryLabel: "Infrastructure",
          date: "October 2, 2023",
          author: "Sports Department",
          featured: false
        },
        {
          id: 6,
          title: "Faculty Research Published in Nature Journal",
          excerpt: "Prof. Sharma and his team's groundbreaking research on sustainable energy solutions has been published in the prestigious Nature journal, marking a significant achievement for Mahindra University.",
          content: "Prof. Sharma and his team's groundbreaking research on sustainable energy solutions has been published in the prestigious Nature journal, marking a significant achievement for Mahindra University. The research focuses on developing highly efficient and cost-effective solar cell technology using novel materials. This publication strengthens the university's position as a leading research institution and opens up new opportunities for collaboration with international research organizations.",
          image: "https://picsum.photos/seed/news6/800/500",
          category: "research",
          categoryLabel: "Research",
          date: "September 28, 2023",
          author: "Research Department",
          featured: true
        }
      ];
      
      setNewsItems(sampleNews);
      setFilteredNews(sampleNews);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter news when activeFilter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredNews(newsItems);
    } else if (activeFilter === 'featured') {
      setFilteredNews(newsItems.filter(item => item.featured));
    } else {
      setFilteredNews(newsItems.filter(item => item.category === activeFilter));
    }
  }, [activeFilter, newsItems]);

  const categoryColors = {
    announcement: {
      bg: 'bg-red-light',
      text: 'text-primary-red',
      icon: 'fas fa-bullhorn'
    },
    academic: {
      bg: 'bg-teal-light',
      text: 'text-primary-teal',
      icon: 'fas fa-graduation-cap'
    },
    campus: {
      bg: 'bg-gold-light',
      text: 'text-accent-gold',
      icon: 'fas fa-users'
    },
    placement: {
      bg: 'bg-green-light',
      text: 'text-success-green',
      icon: 'fas fa-briefcase'
    },
    infrastructure: {
      bg: 'bg-red-light',
      text: 'text-primary-red',
      icon: 'fas fa-building'
    },
    research: {
      bg: 'bg-teal-light',
      text: 'text-primary-teal',
      icon: 'fas fa-flask'
    }
  };

  const filters = [
    { id: 'all', label: 'All News', icon: 'fas fa-newspaper' },
    { id: 'featured', label: 'Featured', icon: 'fas fa-star' },
    { id: 'announcement', label: 'Announcements', icon: categoryColors.announcement.icon },
    { id: 'academic', label: 'Academic', icon: categoryColors.academic.icon },
    { id: 'campus', label: 'Campus Life', icon: categoryColors.campus.icon },
    { id: 'research', label: 'Research', icon: categoryColors.research.icon }
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
      <div className="flex flex-col space-y-4">
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-2 text-dark-gray">Latest College News & Updates</h2>
          <p className="text-medium-gray">Stay informed about the latest happenings at Mahindra University</p>
        </motion.div>
        
        {/* Filter tabs */}
        <motion.div variants={itemVariants} className="overflow-x-auto -mx-4 px-4 py-2 scrollbar-hide">
          <div className="flex space-x-2 min-w-max">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center px-4 py-2 rounded-full text-sm transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-primary-red text-white'
                    : 'bg-gray-100 text-medium-gray hover:bg-gray-200'
                }`}
              >
                <i className={`${filter.icon} mr-2`}></i>
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
      
      {loading ? (
        // Skeleton loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* News Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map(news => {
              const categoryStyle = categoryColors[news.category] || {
                bg: 'bg-gray-100',
                text: 'text-medium-gray',
                icon: 'fas fa-circle'
              };
              
              return (
                <motion.div 
                  key={news.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-300"
                >
                  <div className="relative">
                    <img 
                      src={news.image}
                      alt={news.title}
                      className="w-full h-48 object-cover"
                    />
                    {news.featured && (
                      <div className="absolute top-3 right-3 bg-accent-gold text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                        <i className="fas fa-star mr-1"></i> Featured
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center mb-3">
                      <span className={`inline-flex items-center ${categoryStyle.bg} ${categoryStyle.text} text-xs font-medium px-2 py-1 rounded`}>
                        <i className={`${categoryStyle.icon} mr-1`}></i>
                        {news.categoryLabel}
                      </span>
                      <span className="text-xs text-medium-gray ml-auto">{news.date}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">{news.title}</h3>
                    <p className="text-medium-gray mb-4 line-clamp-2">{news.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-medium-gray flex items-center">
                        <i className="fas fa-user mr-1"></i> {news.author}
                      </span>
                      <button 
                        onClick={() => setSelectedNews(news)}
                        className="text-primary-red hover:underline text-sm font-medium flex items-center" 
                        aria-label={`Read more about ${news.title}`}
                      >
                        Read More
                        <i className="fas fa-arrow-right ml-1"></i>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium mb-2">No news found</h3>
              <p className="text-medium-gray">No news items match your current filter.</p>
              <button 
                onClick={() => setActiveFilter('all')}
                className="mt-4 bg-primary-red text-white font-medium px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                View All News
              </button>
            </div>
          )}
          
          {filteredNews.length > 0 && (
            <motion.div variants={itemVariants} className="mt-8 text-center">
              <button className="bg-primary-red text-white font-medium px-6 py-3 rounded-lg inline-flex items-center hover:bg-red-600 transition-colors">
                View All News
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </motion.div>
          )}
          
          {/* News Detail Modal */}
          {selectedNews && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="relative">
                  <img 
                    src={selectedNews.image}
                    alt={selectedNews.title}
                    className="w-full h-64 object-cover"
                  />
                  <button 
                    onClick={() => setSelectedNews(null)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <div className={`inline-flex items-center ${categoryColors[selectedNews.category]?.bg || 'bg-gray-100'} ${categoryColors[selectedNews.category]?.text || 'text-medium-gray'} text-xs font-medium px-2 py-1 rounded mb-2`}>
                      <i className={`${categoryColors[selectedNews.category]?.icon || 'fas fa-circle'} mr-1`}></i>
                      {selectedNews.categoryLabel}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedNews.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-medium-gray mb-6">
                    <span className="flex items-center mr-4">
                      <i className="fas fa-user mr-1"></i>
                      {selectedNews.author}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-calendar-alt mr-1"></i>
                      {selectedNews.date}
                    </span>
                  </div>
                  <div className="prose max-w-none">
                    <p>{selectedNews.content}</p>
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button className="flex items-center text-medium-gray hover:text-primary-red">
                        <i className="fas fa-share-alt mr-1"></i> Share
                      </button>
                      <button className="flex items-center text-medium-gray hover:text-primary-red">
                        <i className="fas fa-bookmark mr-1"></i> Save
                      </button>
                    </div>
                    <button 
                      onClick={() => setSelectedNews(null)}
                      className="bg-primary-red text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default NewsUpdates;
