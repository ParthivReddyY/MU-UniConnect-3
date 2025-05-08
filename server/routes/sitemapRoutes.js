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
        
        // Ensure the image URL is properly encoded
        const encodedImageUrl = encodeURI(imageUrl);
        
        // Extract venue information from content if available
        let venue = '';
        if (newsItem.content && newsItem.content.includes('Venue:')) {
          const venueMatch = newsItem.content.match(/Venue:\s*([^\.|\n]+)/i);
          if (venueMatch && venueMatch[1]) {
            venue = venueMatch[1].trim();
          }
        }
        
        // Format description to include date and venue if available
        let enhancedDescription = newsItem.excerpt;
        if (newsItem.date) {
          enhancedDescription = `Date: ${newsItem.date}. ${enhancedDescription}`;
        }
        if (venue) {
          enhancedDescription = `${enhancedDescription} Venue: ${venue}.`;
        }
        
        // Escape all special characters in title and description to prevent HTML issues
        const escapeHtml = (text) => {
          return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        };
        
        const safeTitle = escapeHtml(newsItem.title);
        const safeDescription = escapeHtml(enhancedDescription);
        const safeVenue = escapeHtml(venue);
        const safeAuthor = escapeHtml(newsItem.author);
        const safeCategoryLabel = escapeHtml(newsItem.categoryLabel);
        
        // Full canonical URL for the news page
        const canonicalUrl = `https://www.uni-connect.live/college?tab=news&id=${newsItem._id}`;
        
        // Replace any existing OG tags to prevent duplicates
        let modifiedHtml = data;
        
        // Remove existing Open Graph tags
        modifiedHtml = modifiedHtml.replace(/<meta property="og:[^>]+>/g, '');
        modifiedHtml = modifiedHtml.replace(/<meta name="twitter:[^>]+>/g, '');
        
        // Replace the title tag
        modifiedHtml = modifiedHtml.replace(/<title>[^<]+<\/title>/, 
          `<title>${safeTitle} | MU-UniConnect</title>`);
        
        // Add canonical link
        if (!modifiedHtml.includes('<link rel="canonical"')) {
          modifiedHtml = modifiedHtml.replace('</head>', `<link rel="canonical" href="${canonicalUrl}" />\n</head>`);
        } else {
          modifiedHtml = modifiedHtml.replace(/<link rel="canonical"[^>]+>/, 
            `<link rel="canonical" href="${canonicalUrl}" />`);
        }
        
        // Prepare Open Graph meta tags with enhanced information
        const ogTags = `
    <!-- Primary Meta Tags -->
    <meta name="title" content="${safeTitle} | MU-UniConnect">
    <meta name="description" content="${safeDescription}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:image" content="${encodedImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="MU-UniConnect">
    <meta property="fb:app_id" content="1234567890123456">
    <meta property="article:published_time" content="${new Date(newsItem.createdAt).toISOString()}">
    <meta property="article:modified_time" content="${new Date(newsItem.updatedAt).toISOString()}">
    <meta property="article:section" content="${safeCategoryLabel}">
    <meta property="article:author" content="${safeAuthor}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${encodedImageUrl}">`;
        
        // Add the OG tags into the head of the HTML document
        modifiedHtml = modifiedHtml.replace('</head>', `${ogTags}\n</head>`);
        
        // Add JSON-LD structured data for even better SEO and rich results
        const jsonLdScript = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${canonicalUrl}"
      },
      "headline": "${safeTitle}",
      "image": ["${encodedImageUrl}"],
      "datePublished": "${new Date(newsItem.createdAt).toISOString()}",
      "dateModified": "${new Date(newsItem.updatedAt).toISOString()}",
      "author": {
        "@type": "Organization",
        "name": "${safeAuthor}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "MU-UniConnect",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.uni-connect.live/img/uniconnectTB.png"
        }
      },
      "description": "${safeDescription}"
      ${safeVenue ? `, "location": {"@type": "Place", "name": "${safeVenue}"}` : ''}
    }
    </script>`;
        
        // Add the structured data to the HTML (or replace existing)
        if (modifiedHtml.includes('<script type="application/ld+json">')) {
          modifiedHtml = modifiedHtml.replace(/<script type="application\/ld\+json">[^<]+<\/script>/, jsonLdScript);
        } else {
          modifiedHtml = modifiedHtml.replace('</head>', `${jsonLdScript}\n</head>`);
        }
        
        // Set proper response headers for social media crawlers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.status(200);
        
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