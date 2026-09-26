const ApiError = require('../utils/ApiError');

exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  // If it's our ApiError, use its status
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: { message: err.message, details: err.details } });
  }

  // Handle common MySQL/MariaDB errors
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: { message: 'Duplicate entry', details: err.sqlMessage } });
  }

  // Validation errors from express-validator are handled earlier by middleware, but double-check
  if (err && err.name === 'ValidationError') {
    return res.status(400).json({ error: { message: err.message } });
  }

  // Fallback
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  const payload = { error: { message } };
  if (process.env.NODE_ENV === 'development') payload.error.stack = err.stack;
  return res.status(status).json(payload);
};
