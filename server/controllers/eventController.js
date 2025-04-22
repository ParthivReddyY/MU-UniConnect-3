// University events controller
const universityEvents = []; // In-memory storage for university events (could be replaced with a database model)

/**
 * Get all university events
 */
exports.getUniversityEvents = (req, res) => {
  try {
    res.status(200).json({ events: universityEvents });
  } catch (error) {
    console.error('Error fetching university events:', error);
    res.status(500).json({ message: 'Failed to fetch university events', error: error.message });
  }
};

/**
 * Update university events
 */
exports.updateUniversityEvents = (req, res) => {
  try {
    const { events } = req.body;
    
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ message: 'Invalid request. Events array required.' });
    }
    
    // Replace all university events with the provided array
    universityEvents.length = 0;
    universityEvents.push(...events);
    
    res.status(200).json({ 
      message: 'University events updated successfully', 
      events: universityEvents 
    });
  } catch (error) {
    console.error('Error updating university events:', error);
    res.status(500).json({ message: 'Failed to update university events', error: error.message });
  }
};

/**
 * Create a new university event
 */
exports.createUniversityEvent = (req, res) => {
  try {
    // Extract event data from req.body.event (how frontend is sending it)
    // or directly from req.body (fallback)
    const eventData = req.body.event || req.body;
    
    if (!eventData || !eventData.title) {
      return res.status(400).json({ message: 'Invalid event data. Title is required.' });
    }
    
    // Add an ID to the event if it doesn't have one
    const event = {
      ...eventData,
      _id: eventData._id || Date.now().toString()
    };
    
    universityEvents.push(event);
    
    res.status(201).json({ 
      message: 'Event created successfully', 
      event 
    });
  } catch (error) {
    console.error('Error creating university event:', error);
    res.status(500).json({ message: 'Failed to create university event', error: error.message });
  }
};