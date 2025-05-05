const express = require('express');
const path = require('path');
const app = express();

// Set up middleware
// Ensure static files from public directory are served correctly
app.use(express.static(path.join(__dirname, 'public')));

// Special route for Google verification file
// This creates a direct route to serve the verification file
app.get('/google926113dc7dbeacd7.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'google926113dc7dbeacd7.html'));
});

// Import your routes and other middleware
// ...existing code...

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Fallback route for SPA if using React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});