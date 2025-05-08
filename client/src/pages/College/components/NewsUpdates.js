import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import newsService from '../../../services/newsService';

const NewsUpdates = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [newsItems, setNewsItems] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [error, setError] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  // Get current user for admin features
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  
  // Get location to access URL parameters
  const location = useLocation();

  // Fetch news data from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await newsService.getAllNews();
        setNewsItems(response.news);
        setFilteredNews(response.news);
        
        // Check if there's a news ID in the URL
        const searchParams = new URLSearchParams(location.search);
        const newsId = searchParams.get('id');
        
        if (newsId && response.news) {
          const newsItem = response.news.find(news => 
            (news._id === newsId) || (news.id === parseInt(newsId))
          );
          
          if (newsItem) {
            setSelectedNews(newsItem);
          }
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to load news. Please try again later.');
        
        // Use sample data as fallback if API fails
        const sampleNews = generateSampleNews();
        setNewsItems(sampleNews);
        setFilteredNews(sampleNews);
        
        // Check if there's a news ID in the URL (even for sample data)
        const searchParams = new URLSearchParams(location.search);
        const newsId = searchParams.get('id');
        
        if (newsId && sampleNews) {
          const newsItem = sampleNews.find(news => 
            (news._id === newsId) || (news.id === parseInt(newsId))
          );
          
          if (newsItem) {
            setSelectedNews(newsItem);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, [location.search]);

  // Filter news when activeFilter changes
  useEffect(() => {
    if (!newsItems.length) return;
    
    try {
      if (activeFilter === 'all') {
        setFilteredNews(newsItems);
      } else if (activeFilter === 'featured') {
        setFilteredNews(newsItems.filter(item => item.featured));
      } else {
        setFilteredNews(newsItems.filter(item => item.category === activeFilter));
      }
    } catch (err) {
      console.error('Error filtering news:', err);
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

  // Fallback data generator in case API fails
  const generateSampleNews = () => {
    return [
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
      }
    ];
  };

  // Handle sharing news
  const handleShare = (e) => {
    e.stopPropagation(); // Prevent modal from closing
    
    if (navigator.share) {
      // Use Web Share API if available
      navigator.share({
        title: selectedNews.title,
        text: selectedNews.excerpt,
        url: window.location.href,
      })
      .then(() => console.log('Successfully shared'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Show custom share dialog if Web Share API is not available
      setShowShareDialog(true);
    }
  };

  // Copy URL directly from news detail view
  const copyUrlDirectly = (e) => {
    e.stopPropagation(); // Prevent modal from closing
    
    const shareUrl = `${window.location.origin}/college?tab=news&id=${selectedNews._id || selectedNews.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        // Show success notification
        setShowCopyNotification(true);
        
        // Hide notification after 2 seconds
        setTimeout(() => {
          setShowCopyNotification(false);
        }, 2000);
      })
      .catch(err => console.error('Failed to copy URL:', err));
  };

  // Copy URL from share dialog
  const copyToClipboard = () => {
    const shareUrl = `${window.location.origin}/college?tab=news&id=${selectedNews._id || selectedNews.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        // Show copy success notification
        const notification = document.getElementById('copy-notification');
        notification.classList.remove('opacity-0');
        notification.classList.add('opacity-100');
        
        // Hide notification after 2 seconds
        setTimeout(() => {
          notification.classList.remove('opacity-100');
          notification.classList.add('opacity-0');
        }, 2000);
      })
      .catch(err => console.error('Failed to copy URL:', err));
  };

  // Close share dialog
  const closeShareDialog = (e) => {
    e.stopPropagation(); // Prevent modal from closing
    setShowShareDialog(false);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex flex-col space-y-4">
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-dark-gray">Latest College News & Updates</h2>
            <p className="text-medium-gray">Stay informed about the latest happenings at Mahindra University</p>
          </div>
          
          {/* Admin-only "Add News" and "Edit News" buttons with mode parameters */}
          {isAdmin && (
            <div className="flex space-x-3">
              <Link 
                to="/admin/news?mode=add" 
                className="bg-primary-red text-white font-medium px-4 py-2 rounded-lg flex items-center hover:bg-red-600 transition-colors whitespace-nowrap"
              >
                <i className="fas fa-plus mr-2"></i>
                Add News
              </Link>
              <Link 
                to="/admin/news?mode=edit" 
                className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit News
              </Link>
            </div>
          )}
        </motion.div>
        
        {/* Error message if API fails */}
        {error && (
          <motion.div variants={itemVariants} className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
        
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
                  key={news._id || news.id}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedNews(news)}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-300 cursor-pointer"
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
                      <span 
                        className="text-primary-red hover:underline text-sm font-medium flex items-center" 
                        aria-label={`Read more about ${news.title}`}
                      >
                        Read More
                        <i className="fas fa-arrow-right ml-1"></i>
                      </span>
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
          
          {/* News Detail Modal */}
          {selectedNews && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
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
                    {selectedNews.content.split('\n\n').map((paragraph, index) => (
                      paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                    ))}
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    <div className="flex gap-4">
                      <button 
                        onClick={handleShare}
                        className="flex items-center text-medium-gray hover:text-primary-red transition-colors"
                      >
                        <i className="fas fa-share-alt mr-1"></i> Share
                      </button>
                      <button
                        onClick={copyUrlDirectly}
                        className="flex items-center text-medium-gray hover:text-primary-red transition-colors relative"
                      >
                        <i className="fas fa-link mr-1"></i> Copy URL
                        {showCopyNotification && (
                          <span className="absolute -top-8 left-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded whitespace-nowrap">
                            URL copied!
                          </span>
                        )}
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

              {/* Share Dialog */}
              {showShareDialog && (
                <div 
                  className="fixed inset-0 bg-black/30 flex items-center justify-center z-[10000]"
                  onClick={closeShareDialog}
                >
                  <div 
                    className="bg-white rounded-lg p-5 max-w-md w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Share this news</h3>
                      <button 
                        onClick={closeShareDialog}
                        className="text-gray-500 hover:text-gray-800"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Share this news article with your friends and colleagues
                    </p>
                    
                    <div className="flex space-x-4 mb-6">
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-facebook hover:opacity-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-12 h-12 bg-[#4267B2] text-white rounded-full flex items-center justify-center mb-1">
                          <i className="fab fa-facebook-f text-xl"></i>
                        </div>
                        <span className="text-xs">Facebook</span>
                      </a>
                      
                      <a 
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedNews.title)}&url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-twitter hover:opacity-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-12 h-12 bg-[#1DA1F2] text-white rounded-full flex items-center justify-center mb-1">
                          <i className="fab fa-twitter text-xl"></i>
                        </div>
                        <span className="text-xs">Twitter</span>
                      </a>
                      
                      <a 
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(selectedNews.title)}&summary=${encodeURIComponent(selectedNews.excerpt)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-linkedin hover:opacity-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-12 h-12 bg-[#0077B5] text-white rounded-full flex items-center justify-center mb-1">
                          <i className="fab fa-linkedin-in text-xl"></i>
                        </div>
                        <span className="text-xs">LinkedIn</span>
                      </a>
                      
                      <a 
                        href={`mailto:?subject=${encodeURIComponent(selectedNews.title)}&body=${encodeURIComponent(`Check out this news: ${selectedNews.excerpt} ${window.location.href}`)}`}
                        className="flex flex-col items-center text-gray-700 hover:opacity-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                          <i className="fas fa-envelope text-xl"></i>
                        </div>
                        <span className="text-xs">Email</span>
                      </a>
                    </div>
                    
                    <div className="border border-gray-300 rounded-lg flex overflow-hidden">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${window.location.origin}/college?tab=news&id=${selectedNews._id || selectedNews.id}`}
                        className="flex-1 px-3 py-2 text-sm focus:outline-none bg-gray-50"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-2 text-gray-700 font-medium text-sm whitespace-nowrap"
                      >
                        Copy Link
                      </button>
                    </div>
                    
                    <div 
                      id="copy-notification" 
                      className="mt-2 text-center text-green-600 text-sm opacity-0 transition-opacity duration-300"
                    >
                      Link copied to clipboard!
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default NewsUpdates;
