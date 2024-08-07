const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const publicRoutes = require('./routes/public');

// Use routes
app.use('/api/public', publicRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Public API service running on port ${PORT}`));