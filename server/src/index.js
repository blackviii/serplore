require('dotenv').config();

const express = require('express');
const path = require('path');
const config = require('./config');
const { nowIso } = require('./utils/engagement');

const app = express();

// Shared middleware
app.set('trust proxy', true);
app.use(express.json({ limit: '64kb' }));
app.use(express.text({ type: 'text/plain' })); // sendBeacon sends text/plain payloads.
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/track', require('./routes/track'));
app.use('/api/leads', require('./routes/leads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'serplore-site', timestamp: nowIso() });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'serplore-site', timestamp: nowIso() });
});

// Blog & service pages (SSR for SEO) — must be before SPA fallback
app.use(require('./blog/routes'));

// Static files and SPA fallback
const webDistPath = path.join(__dirname, '../../web/dist');
app.use(express.static(webDistPath));
app.get('*', (req, res) => {
  const indexFile = path.join(webDistPath, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

// Start service
app.listen(config.port, () => {
  console.log(`Serplore server running on port ${config.port}`);
});

module.exports = app;
