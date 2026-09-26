require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(express.json());

const ALLOWED_ORIGINS = [
  process.env.CORS_ORIGIN,          // production Vercel URL (set in Render env vars)
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(cookieParser());

// Routes
const studentsRouter = require('./routes/students.routes');
const authRouter = require('./routes/auth.routes');
const extendedRouter = require('./routes/extended.routes');
const { errorHandler } = require('./middleware/errorHandler');

app.use('/', authRouter);
app.use('/', studentsRouter);
app.use('/', extendedRouter);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
