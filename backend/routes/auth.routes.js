const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { signup, login, logout, me } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Public routes
router.post('/auth/signup', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
], signup);

router.post('/auth/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], login);

// Protected routes
router.get('/auth/me', verifyToken, me);
router.post('/auth/logout', logout);

module.exports = router;
