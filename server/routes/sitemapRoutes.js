const express = require('express');
const path = require('path');
const fs = require('fs');
const News = require('../models/News');

const router = express.Router();

// Serve the static sitemap.xml file instead of generating it dynamically
router.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  
  // Set correct content type for XML
  res.header('Content-Type', 'application/xml');
  
  // Check if the file exists
  fs.access(sitemapPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Sitemap file not found:', err);
      return res.status(404).send('Sitemap not found');
    }
    
    // Stream the file to the response
    const sitemapStream = fs.createReadStream(sitemapPath);
    sitemapStream.pipe(res);
    
    // Handle stream errors
    sitemapStream.on('error', (err) => {
      console.error('Error streaming sitemap:', err);
      if (!res.headersSent) {
        res.status(500).send('Error serving sitemap');
      }
    });
  });
});

// Optional: Add a route to refresh the sitemap if needed
router.post('/sitemap/refresh', (req, res) => {
  // Here you could implement logic to regenerate your sitemap.xml file
  // This would require proper authentication/authorization
  res.send({ message: 'Sitemap refresh endpoint (implement as needed)' });
});

// Serve robots.txt
router.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(__dirname, '../public/robots.txt');
  fs.readFile(robotsPath, (err, data) => {
    if (err) {
      console.error('Error reading robots.txt:', err);
      return res.status(500).send('Error retrieving robots.txt');
    }
    
    res.header('Content-Type', 'text/plain');
    res.send(data);
  });
});

// Dynamically generate Open Graph meta tags for news links
router.get('/college', async (req, res, next) => {
  const tab = req.query.tab;
  const id = req.query.id;
  
  // Only intercept requests for news items with an ID
  if (tab === 'news' && id) {
    try {
      // Get the news item from database
      const newsItem = await News.findById(id);
      
      if (!newsItem) {
        // If news not found, continue to regular React rendering
        return next();
      }
      
      // Read the original index.html template
      const indexPath = path.join(__dirname, '../../client/build/index.html');
      fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading index.html:', err);
          return next();
        }
        
        // Create absolute URL for the image
        const imageUrl = newsItem.image.startsWith('http') 
          ? newsItem.image 
          : `https://www.uni-connect.live${newsItem.image}`;
        
        // Prepare Open Graph meta tags
        const ogTags = `
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://www.uni-connect.live/college?tab=news&id=${newsItem._id}" />
    <meta property="og:title" content="${newsItem.title}" />
    <meta property="og:description" content="${newsItem.excerpt}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="MU-UniConnect" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${newsItem.title}" />
    <meta name="twitter:description" content="${newsItem.excerpt}" />
    <meta name="twitter:image" content="${imageUrl}" />`;
        
        // Insert the OG tags into the head of the HTML document
        const modifiedHtml = data.replace(/<title>.*?<\/title>/, 
          `<title>${newsItem.title} | MU-UniConnect</title>${ogTags}`);
        
        // Send the modified HTML
        res.send(modifiedHtml);
      });
    } catch (error) {
      console.error('Error generating dynamic meta tags:', error);
      next();
    }
  } else {
    // For non-news requests, continue to regular React rendering
    next();
  }
});

module.exports = router;