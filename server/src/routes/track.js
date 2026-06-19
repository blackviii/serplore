const express = require('express');
const { recordVisit } = require('../utils/engagement');

const router = express.Router();

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

router.post('/visit', (req, res) => {
  res.status(204).end();
  recordVisit(req, req.body).catch((err) => {
    console.error('Track visit error:', err.message);
  });
});

module.exports = router;
