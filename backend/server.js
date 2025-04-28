const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/skwebhorizon';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const contactRoutes = require('./routes/contact');

// Routes placeholders
app.get('/', (req, res) => {
  res.send('SKWebHorizon Backend API');
});

app.use('/api/contact', contactRoutes);

const projectRoutes = require('./routes/project');

const subscriberRoutes = require('./routes/subscriber');
const authRoutes = require('./routes/auth');

app.use('/api/projects', projectRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
