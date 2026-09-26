require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || /^http:\/\/localhost:(3000|3001|3002)$/.test(origin) || origin === process.env.CORS_ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
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
