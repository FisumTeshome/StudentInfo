const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      throw new ApiError(400, 'Username, email, and password are required');
    }

    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (users.length > 0) {
      throw new ApiError(409, 'User already exists with that email or username');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?,?,?,?)',
      [username, email, hashedPassword, 'teacher']
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.ID, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Login successful', token, user: { id: user.ID, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

exports.me = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT ID, username, email, role FROM users WHERE ID = ?', [req.user.id]);
    if (users.length === 0) throw new ApiError(404, 'User not found');
    res.json(users[0]);
  } catch (err) {
    next(err);
  }
};
