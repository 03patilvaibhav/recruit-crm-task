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
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidate');

// Use routes
app.use('/api', authRoutes);
app.use('/api', candidateRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Main service running on port ${PORT}`));