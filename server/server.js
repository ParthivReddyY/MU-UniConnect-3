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

// Middleware
app.use(cors({
  origin: [
    'https://mu-uniconnect-ob9x.onrender.com',
    'https://mu-uniconnect.onrender.com', 
    'http://localhost:3000'
  ],
  credentials: true
}));
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/appointments', appointmentRoutes);
// Add other API routes here

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

// Connect to MongoDB first, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
