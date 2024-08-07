# Recruit CRM Technical Assignment

This project consists of two services: a Main Service for user authentication and candidate management, and a Public API Microservice for accessing user profiles and candidates using an API key.

## Setup and Installation

### Prerequisites
- Node.js 
- MongoDB

### Main Service

1. go to the main directory:  cd main

2. Install dependencies:  npm install

3. Create a .env file in the main-service directory with the following content:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/recruitcrm
JWT_SECRET=your_very_secret_key

4. Start the main service:  Certainly, I'll proceed with outlining a complete solution for the assignment. This will include the main service, public API microservice, and the necessary documentation. I'll provide code snippets and explanations for each component.
Let's start with the project structure:
Copyrecruit-crm/
├── main-service/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   ├── .env
│   └── package.json
├── public-api-service/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   ├── .env
│   └── package.json
└── README.md
Now, let's implement each component:

Main Service:

First, set up the main service:
bashCopycd main-service
npm init -y
npm install express mongoose jsonwebtoken bcrypt dotenv
Create the following files:
.env:
CopyPORT=3000
MONGODB_URI=mongodb://localhost:27017/recruitcrm
JWT_SECRET=your_very_secret_key
src/index.js:
javascriptCopyconst express = require('express');
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
src/models/User.js:
javascriptCopyconst mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  api_key: { type: String, unique: true }
});

module.exports = mongoose.model('User', userSchema);
src/models/Candidate.js:
javascriptCopyconst mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Candidate', candidateSchema);
src/middleware/auth.js:
javascriptCopyconst jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
src/routes/auth.js:
javascriptCopyconst express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const api_key = jwt.sign({ email }, process.env.JWT_SECRET);

    const user = new User({
      first_name,
      last_name,
      email,
      password_hash,
      api_key
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
src/routes/candidate.js:
javascriptCopyconst express = require('express');
const Candidate = require('../models/Candidate');
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

Public API Microservice:

Set up the public API service:
bashCopycd ../public-api-service
npm init -y
npm install express mongoose dotenv
Create the following files:
.env:
CopyPORT=3001
MONGODB_URI=mongodb://localhost:27017/recruitcrm
src/index.js:
javascriptCopyconst express = require('express');
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
src/middleware/apiAuth.js:
javascriptCopyconst User = require('../models/User');

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
src/routes/public.js:
javascriptCopyconst express = require('express');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const { authenticateApiKey } = require('../middleware/apiAuth');

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
Now, let's create the documentation in the README.md file:
markdownCopy# Recruit CRM Technical Assignment

This project consists of two services: a Main Service for user authentication and candidate management, and a Public API Microservice for accessing user profiles and candidates using an API key.

## Setup and Installation

### Prerequisites
- Node.js (v14 or later)
- MongoDB

### Main Service

1. Navigate to the main-service directory:
cd main-service
Copy
2. Install dependencies:
npm install
Copy
3. Create a .env file in the main-service directory with the following content:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/recruitcrm
JWT_SECRET=your_very_secret_key
Copy
4. Start the main service:
npm start


### Public API Microservice

1. Navigate to the public-service directory: cd public_service 

2. Install dependencies: npm install

3. Create a .env file in the public-api-service directory with the following content:
PORT=3001
MONGODB_URI=mongodb://localhost:27017/recruitcrm

4. Start the public API service:  npm start

## API Endpoints

### Main Service

1. Register a new user:
POST /api/register

2. Login:
POST /api/login

3. Protected route (requires authentication):
POST /api/protected

4. Add a candidate (requires authentication):
POST /api/candidate

5. Get candidates (requires authentication):
GET /api/candidate

### Public API Microservice

1. Get user profile (requires API key):
POST /api/public/profile

2. Get candidates (requires API key):
GET /api/public/candidate

## Usage

1. Register a new user using the main service.
2. Login to obtain a JWT token.
3. Use the JWT token to access protected routes and manage candidates.
4. Use the API key (generated during registration) to access the public API microservice endpoints.



