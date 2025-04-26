const News = require('../models/News');
const { StatusCodes } = require('http-status-codes');

// Get all news items
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find({}).sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({ news, count: news.length });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to fetch news', 
      error: error.message 
    });
  }
};

// Get a single news item
exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const newsItem = await News.findById(id);
    
    if (!newsItem) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: `No news item with id: ${id}` 
      });
    }
    
    res.status(StatusCodes.OK).json({ newsItem });
  } catch (error) {
    console.error('Error fetching news item:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to fetch news item', 
      error: error.message 
    });
  }
};

// Get news by category
exports.getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const news = await News.find({ category }).sort({ createdAt: -1 });
    
    res.status(StatusCodes.OK).json({ news, count: news.length });
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to fetch news by category', 
      error: error.message 
    });
  }
};

// Get featured news
exports.getFeaturedNews = async (req, res) => {
  try {
    const news = await News.find({ featured: true }).sort({ createdAt: -1 });
    
    res.status(StatusCodes.OK).json({ news, count: news.length });
  } catch (error) {
    console.error('Error fetching featured news:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to fetch featured news', 
      error: error.message 
    });
  }
};

// Create news item (admin only)
exports.createNews = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        message: 'Only administrators can create news items' 
      });
    }
    
    const newsItem = await News.create(req.body);
    res.status(StatusCodes.CREATED).json({ 
      message: 'News item created successfully', 
      newsItem 
    });
  } catch (error) {
    console.error('Error creating news item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'Validation Error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to create news item', 
      error: error.message 
    });
  }
};

// Update news item (admin only)
exports.updateNews = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        message: 'Only administrators can update news items' 
      });
    }
    
    const { id } = req.params;
    const newsItem = await News.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!newsItem) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: `No news item with id: ${id}` 
      });
    }
    
    res.status(StatusCodes.OK).json({ 
      message: 'News item updated successfully', 
      newsItem 
    });
  } catch (error) {
    console.error('Error updating news item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'Validation Error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to update news item', 
      error: error.message 
    });
  }
};

// Delete news item (admin only)
exports.deleteNews = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        message: 'Only administrators can delete news items' 
      });
    }
    
    const { id } = req.params;
    const newsItem = await News.findByIdAndDelete(id);
    
    if (!newsItem) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: `No news item with id: ${id}` 
      });
    }
    
    res.status(StatusCodes.OK).json({ 
      message: 'News item deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting news item:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to delete news item', 
      error: error.message 
    });
  }
};

// Initialize with sample news data if empty
exports.initializeNews = async () => {
  try {
    const count = await News.countDocuments();
    
    if (count === 0) {
      console.log('Initializing news collection with sample data...');
      
      const sampleNews = [
        {
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
      
      await News.insertMany(sampleNews);
      console.log('Sample news data inserted successfully');
    }
  } catch (error) {
    console.error('Error initializing news data:', error);
  }
};