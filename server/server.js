const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
// Import other routes as needed

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Simplified request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// CORS configuration - update to be more permissive in production
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    // Allow requests from any origin in production
    origin: true,
    credentials: true
  }));
} else {
  app.use(cors({
    origin: [
      'https://mu-uniconnect-ob9x.onrender.com',
      'https://mu-uniconnect.onrender.com', 
      'http://localhost:3000'
    ],
    credentials: true
  }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API connectivity test endpoint
app.get('/api/test-connection', (req, res) => {
  console.log('Test connection endpoint hit');
  res.status(200).json({
    success: true,
    message: 'API connection successful',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    cookies: req.cookies,
    method: req.method,
    clientIP: req.ip,
    path: req.path
  });
});

// Simplified API monitoring middleware
app.use('/api', (req, res, next) => {
  // No need to log detailed request info
  
  // Track response time
  const startTime = Date.now();
  
  // Save original res.json function
  const originalJson = res.json;
  
  // Override res.json to log minimal response info
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    // Only log status and time for non-success responses
    if (res.statusCode >= 400) {
      console.log(`Response: ${res.statusCode} (${responseTime}ms)`);
    }
    
    // Call original res.json with data
    return originalJson.call(this, data);
  };
  
  next();
});

// Import middleware and controllers (make sure User model is properly imported in authController)
const { authenticateUser } = require('./middleware/auth');
const authController = require('./controllers/authController');

// IMPORTANT: API Routes must be defined BEFORE static file serving
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/presentation-slots', require('./routes/api/presentationSlots'));

// Add the search route directly here instead of through users.js
app.get('/api/users/search', authenticateUser, authController.searchUsers);

// No longer need this line since we've moved the route
// app.use('/api/users', require('./routes/api/users'));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode - serving static files from ../client/build');
  
  // Set static folder - ensure path is correct relative to server directory
  const staticPath = path.join(__dirname, '../client/build');
  console.log(`Static path: ${staticPath}`);
  app.use(express.static(staticPath));

  // For any route that doesn't match an API route, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Simplified error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Connect to MongoDB first, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
