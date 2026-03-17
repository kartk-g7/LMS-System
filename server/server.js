require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Validate Environment Variables gracefully
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`⚠️ WARNING: ${envVar} environment variable is missing.`);
  }
});
if (!process.env.YOUTUBE_KEY || process.env.YOUTUBE_KEY === 'YOUR_YOUTUBE_API_KEY') {
  console.warn(`⚠️ WARNING: YOUTUBE_KEY environment variable is missing or invalid. YouTube imports may fail.`);
}

// Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const progressRoutes = require('./routes/progressRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
// Allow localhost in dev + any Vercel deployment for this project.
// Using a function so ALL Vercel preview/branch URLs are covered automatically
// without needing to add each new one manually after every deployment.
const ALLOWED_ORIGIN_REGEX = /^https:\/\/lms-system.*\.vercel\.app$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    if (origin === 'http://localhost:5173' || ALLOWED_ORIGIN_REGEX.test(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));

// Handle CORS preflight for all routes
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);

// Root test route
app.get("/", (req, res) => {
  res.send("LMS Backend Running");
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LMS API is running 🚀', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0')
  .on('listening', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`🚀 LMS Server running`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  })
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
    } else {
      console.error('❌ Server error:', err.message);
    }
    process.exit(1);
  });
