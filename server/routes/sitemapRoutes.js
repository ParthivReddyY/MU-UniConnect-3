const express = require('express');
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');

const router = express.Router();

// Store the sitemap in memory to avoid regenerating it on every request
let sitemap;

router.get('/sitemap.xml', async (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');

  // If sitemap exists in memory, serve it
  if (sitemap) {
    res.send(sitemap);
    return;
  }

  try {
    // Domain name configuration - update with your actual domain
    const hostname = process.env.NODE_ENV === 'production' 
      ? 'https://www.uni-connect.live'
      : 'http://localhost:5000';

    // Create a new sitemap stream
    const smStream = new SitemapStream({ hostname });
    const pipeline = smStream.pipe(createGzip());

    // Add static pages with their importance - only include category pages, not individual items
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/login', changefreq: 'monthly', priority: 0.8 });
    smStream.write({ url: '/signup', changefreq: 'monthly', priority: 0.8 });
    smStream.write({ url: '/dashboard', changefreq: 'daily', priority: 0.9 });
    smStream.write({ url: '/faculty', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/clubs', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/events', changefreq: 'daily', priority: 0.8 });
    smStream.write({ url: '/news', changefreq: 'daily', priority: 0.7 });
    smStream.write({ url: '/presentations', changefreq: 'weekly', priority: 0.6 });
    smStream.write({ url: '/feedback', changefreq: 'monthly', priority: 0.6 });
    smStream.write({ url: '/about', changefreq: 'monthly', priority: 0.5 });
    smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.5 });
    
    // No more individual item URLs - we're only including the category pages
    
    smStream.end();
    
    // Generate sitemap and store it
    sitemap = await streamToPromise(pipeline);
    res.send(sitemap);
    
    // Regenerate the sitemap periodically (every 24 hours)
    setTimeout(() => {
      sitemap = null;
    }, 24 * 60 * 60 * 1000);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
});

module.exports = router;