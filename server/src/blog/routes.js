const express = require('express');
const fs = require('fs');
const path = require('path');
const { renderArticlePage, renderBlogListPage, SITE_URL } = require('./template');

const router = express.Router();
const postsDir = path.join(__dirname, 'posts');
const hiddenSlugs = new Set([
  'reddit-marketing-packages',
  'reddit-marketing-service',
  'reddit-posting-service',
  'reddit-promotion-company',
  'reddit-promotion-expert',
  'reddit-promotion-service',
]);

// Load all posts from JSON files
function loadAllPosts() {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
  const posts = files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(postsDir, f), 'utf-8'));
    data.slug = f.replace('.json', '');
    if (data.type === 'blog') {
      data.canonicalPath = `/blog/${data.slug}`;
    } else {
      data.canonicalPath = `/${data.slug}`;
    }
    return data;
  }).filter(post => !hiddenSlugs.has(post.slug));
  // Sort by publishedAt descending
  posts.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  return posts;
}

// GET /blog - Blog listing page
router.get('/blog', (req, res) => {
  try {
    const posts = loadAllPosts();
    res.send(renderBlogListPage(posts));
  } catch (err) {
    console.error('Blog list error:', err);
    res.status(500).send('Internal server error');
  }
});

// GET /blog/:slug - Blog article page
router.get('/blog/:slug', (req, res, next) => {
  try {
    const filePath = path.join(postsDir, `${req.params.slug}.json`);
    if (!fs.existsSync(filePath)) return next();
    if (hiddenSlugs.has(req.params.slug)) return res.redirect(301, '/#consultation');

    const post = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (post.type !== 'blog') return next();

    post.slug = req.params.slug;
    post.canonicalPath = `/blog/${post.slug}`;
    res.send(renderArticlePage(post));
  } catch (err) {
    console.error('Blog article error:', err);
    res.status(500).send('Internal server error');
  }
});

// GET /:slug - Service/industry pages (non-blog)
router.get('/:slug', (req, res, next) => {
  try {
    const filePath = path.join(postsDir, `${req.params.slug}.json`);
    if (!fs.existsSync(filePath)) return next();
    if (hiddenSlugs.has(req.params.slug)) return res.redirect(301, '/#consultation');

    const post = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (post.type === 'blog') return next(); // blogs are under /blog/

    post.slug = req.params.slug;
    post.canonicalPath = `/${post.slug}`;
    res.send(renderArticlePage(post));
  } catch (err) {
    console.error('Service page error:', err);
    res.status(500).send('Internal server error');
  }
});

// GET /sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  try {
    const posts = loadAllPosts();
    const now = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;

    for (const post of posts) {
      const priority = post.type === 'service' ? '0.9' : post.type === 'industry' ? '0.8' : '0.7';
      xml += `
  <url>
    <loc>${SITE_URL}${post.canonicalPath}</loc>
    <lastmod>${(post.updatedAt || post.publishedAt || now).split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }

    xml += '\n</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
