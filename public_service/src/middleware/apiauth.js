const User = require('../models/user');

async function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  try {
    const user = await User.findOne({ api_key: apiKey });
    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { authenticateApiKey };