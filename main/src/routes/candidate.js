const express = require('express');
const Candidate = require('../models/candidate');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/candidate', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    const candidate = new Candidate({
      first_name,
      last_name,
      email,
      user_id: req.user.id
    });

    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/candidate', authenticateToken, async (req, res) => {
  try {
    const candidates = await Candidate.find({ user_id: req.user.id });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;