const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

exports.verifyToken = (req, res, next) => {
  try {
    let token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, 'Invalid token'));
    }
    if (err instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, 'Token expired'));
    }
    next(err);
  }
};

exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
};
