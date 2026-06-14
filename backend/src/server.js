require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const https = require('https');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5000, message: { success: false, message: 'Too many requests. Try again later.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' } });

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AJS Gifts API is running 🌸', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/products', require('./routes/product.route'));
app.use('/api/categories', require('./routes/category.route'));
app.use('/api/orders', require('./routes/order.route'));
app.use('/api/hampers', require('./routes/hamper.route'));
app.use('/api/bouquets', require('./routes/bouquet.route'));
app.use('/api/qrcodes', require('./routes/qrcode.route'));
app.use('/api/site', require('./routes/site.route'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌸 AJS Customized Gifts API`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

// Cron job to ping the server every 14 minutes to keep Render instances awake
cron.schedule('*/14 * * * *', () => {
  const externalUrl = process.env.RENDER_EXTERNAL_URL;
  if (!externalUrl) return; // Only ping in production on Render

  const healthUrl = `${externalUrl}/api/health`;
  const protocol = healthUrl.startsWith('https') ? https : require('http');
  
  protocol.get(healthUrl, (res) => {
    if (res.statusCode === 200) {
      console.log('🔄 Keep-alive ping successful');
    } else {
      console.log(`⚠️ Keep-alive ping failed with status: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error('❌ Keep-alive ping error:', err.message);
  });
});

module.exports = app;

