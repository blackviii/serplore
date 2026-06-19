const express = require('express');
const { recordLead } = require('../utils/engagement');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const result = await recordLead(req, req.body);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Lead submission error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

module.exports = router;
