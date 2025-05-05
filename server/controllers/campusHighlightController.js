const CampusHighlight = require('../models/CampusHighlight');
const { StatusCodes } = require('http-status-codes');

/**
 * Get all active campus highlights
 */
exports.getAllHighlights = async (req, res) => {
  try {
    const highlights = await CampusHighlight.find({ active: true }).sort({ order: 1 });
    res.status(StatusCodes.OK).json({ highlights, count: highlights.length });
  } catch (error) {
    console.error('Error fetching campus highlights:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to fetch campus highlights', 
      error: error.message 
    });
  }
};

/**
 * Get a single campus highlight by ID
 */
exports.getHighlightById = async (req, res) => {
  try {
    const { id } = req.params;
    const highlight = await CampusHighlight.findById(id);
    
    if (!highlight) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: `No highlight found with id: ${id}` 
      });
    }
    
    res.status(StatusCodes.OK).json({ highlight });
  } catch (error) {
    console.error('Error fetching campus highlight:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to fetch campus highlight', 
      error: error.message 
    });
  }
};

/**
 * Create a new campus highlight (admin only)
 */
exports.createHighlight = async (req, res) => {
  try {
    const highlight = await CampusHighlight.create(req.body);
    res.status(StatusCodes.CREATED).json({ 
      highlight, 
      message: 'Campus highlight created successfully' 
    });
  } catch (error) {
    console.error('Error creating campus highlight:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Failed to create campus highlight', 
      error: error.message 
    });
  }
};

/**
 * Update a campus highlight (admin only)
 */
exports.updateHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Add updatedAt timestamp
    req.body.updatedAt = new Date();
    
    const highlight = await CampusHighlight.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!highlight) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: `No highlight found with id: ${id}` 
      });
    }
    
    res.status(StatusCodes.OK).json({ 
      highlight, 
      message: 'Campus highlight updated successfully' 
    });
  } catch (error) {
    console.error('Error updating campus highlight:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Failed to update campus highlight', 
      error: error.message 
    });
  }
};

/**
 * Delete a campus highlight (admin only)
 */
exports.deleteHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const highlight = await CampusHighlight.findByIdAndDelete(id);
    
    if (!highlight) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: `No highlight found with id: ${id}` 
      });
    }
    
    res.status(StatusCodes.OK).json({ 
      message: 'Campus highlight deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting campus highlight:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to delete campus highlight', 
      error: error.message 
    });
  }
};

/**
 * Initialize campus highlights with sample data if none exist
 */
exports.initializeHighlights = async () => {
  try {
    const count = await CampusHighlight.countDocuments({});
    
    if (count === 0) {
      const sampleHighlights = [
        {
          title: 'Modern Infrastructure',
          description: 'State-of-the-art academic buildings with cutting-edge facilities',
          image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1746&q=80',
          link: '/college?tab=facilities',
          icon: 'fas fa-building',
          order: 1
        },
        {
          title: 'Digital Library',
          description: 'Extensive collection of digital and print resources for research and learning',
          image: 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
          link: '/college?tab=library',
          icon: 'fas fa-book',
          order: 2
        },
        {
          title: 'Sports Facilities',
          description: 'Olympic-sized swimming pool, indoor stadium, and outdoor sports fields',
          image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1693&q=80',
          link: '/college?tab=sports',
          icon: 'fas fa-futbol',
          order: 3
        },
        {
          title: 'Research Labs',
          description: 'Advanced research laboratories equipped with the latest technology',
          image: 'https://images.unsplash.com/photo-1581093458791-9f5bf5abf940?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
          link: '/college?tab=research',
          icon: 'fas fa-flask',
          order: 4
        },
        {
          title: 'Cultural Events',
          description: 'Vibrant campus life with regular cultural programs and celebrations',
          image: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
          link: '/clubs-events?category=cultural',
          icon: 'fas fa-music',
          order: 5
        },
        {
          title: 'Student Housing',
          description: 'Modern, comfortable residential facilities for students',
          image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80',
          link: '/college?tab=housing',
          icon: 'fas fa-home',
          order: 6
        }
      ];
      
      await CampusHighlight.insertMany(sampleHighlights);
      console.log('Sample campus highlights inserted successfully');
    }
  } catch (error) {
    console.error('Error initializing campus highlights:', error);
  }
};