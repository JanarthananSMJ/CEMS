const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set up rate limiter: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all requests
app.use(limiter);

// Middleware
app.use(helmet()); // Set security headers
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://univento.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
})); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request body

// Service endpoints
const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:8001';
const EVENT_SERVICE = process.env.EVENT_SERVICE || 'http://localhost:8002';
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE || 'http://localhost:8003';
const LEADERBOARD_SERVICE = process.env.LEADERBOARD_SERVICE || 'http://localhost:8004';
const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE || 'http://localhost:8005';

// Proxy middleware options
// NOTE: Express strips the app.use() mount path from req.url before the proxy
// middleware sees it, so the target must include that path back (pathRewrite
// rules matching e.g. '^/api/auth' never fire, since the incoming url is
// already just '/register' by the time this middleware runs).
const proxyOptions = {
  changeOrigin: true,
  on: {
    proxyReq: fixRequestBody
  }
};

// Proxy routes
app.use('/api/auth', createProxyMiddleware({ ...proxyOptions, target: `${AUTH_SERVICE}/api/auth` }));
app.use('/api/admin', createProxyMiddleware({ ...proxyOptions, target: `${AUTH_SERVICE}/api/admin` }));
app.use('/api/events', createProxyMiddleware({ ...proxyOptions, target: `${EVENT_SERVICE}/api/events` }));
app.use('/api/announcements', createProxyMiddleware({ ...proxyOptions, target: `${NOTIFICATION_SERVICE}/api/announcements` }));
app.use('/api/leaderboard', createProxyMiddleware({ ...proxyOptions, target: `${LEADERBOARD_SERVICE}/api/leaderboard` }));
app.use('/api/settings', createProxyMiddleware({ ...proxyOptions, target: `${SETTINGS_SERVICE}/api/settings` }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API Gateway is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});