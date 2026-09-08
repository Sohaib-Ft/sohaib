const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

const normalizeOrigin = (origin) => {
  const value = String(origin || '').trim();
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value.replace(/\/$/, '') : `https://${value}`;
};

const allowedOrigins = [
  'https://43866c6f.sohaib-mtk.pages.dev',
  'https://sohaib-mtk.pages.dev',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.ADMIN_ORIGIN || '').split(','),
].map(normalizeOrigin).filter(Boolean);

const normalizedAllowedOrigins = [
  ...allowedOrigins,
  ...(process.env.FRONTEND_ORIGINS || '').split(',').map(normalizeOrigin),
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (normalizedAllowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

const apiCacheControl = (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
  }
  next();
};
app.use(apiCacheControl);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

app.get('/', (req, res) => {
  res.send('Admin API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});