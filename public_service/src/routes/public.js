const express = require('express');
const User = require('.main/src/models/user');
const Candidate = require('../models/Candidate');
const { authenticateApiKey } = require('../middleware/apiauth');

const router = express.Router();

router.post('/profile', authenticateApiKey, async (req, res) => {
  try {
    const { first_name, last_name, email } = req.user;
    res.json({ first_name, last_name, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/candidate', authenticateApiKey, async (req, res) => {
  try {
    const candidates = await Candidate.find({ user_id: req.user._id });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;