require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(mongoSanitize());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', generalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'VivahSetu API is running', timestamp: new Date() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profile'));
app.use('/api/matches', require('./routes/match'));
app.use('/api/interests', require('./routes/interest'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/shortlist', require('./routes/shortlist'));
app.use('/api/admin', require('./routes/admin'));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║        VivahSetu API Server            ║
  ║  Running on port ${PORT}                  ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}            ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;
