const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, u.email as user_email, u.role as user_role
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.ID
      ORDER BY t.full_name ASC
    `);
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, u.email as user_email, u.role as user_role
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.ID
      WHERE t.ID = ?
    `, [req.params.id]);
    if (rows.length === 0) throw new ApiError(404, 'Teacher not found');
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { full_name, email, phone, department, subjects_taught, hire_date, bio, user_id } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO teachers (full_name, email, phone, department, subjects_taught, hire_date, bio, user_id) VALUES (?,?,?,?,?,?,?,?)',
      [full_name, email, phone || null, department || null, subjects_taught || null, hire_date || null, bio || null, user_id || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Teacher created' });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { full_name, email, phone, department, subjects_taught, hire_date, bio } = req.body;
    const [result] = await pool.execute(
      'UPDATE teachers SET full_name=?, email=?, phone=?, department=?, subjects_taught=?, hire_date=?, bio=? WHERE ID=?',
      [full_name, email, phone || null, department || null, subjects_taught || null, hire_date || null, bio || null, req.params.id]
    );
    if (result.affectedRows === 0) throw new ApiError(404, 'Teacher not found');
    res.json({ message: 'Teacher updated' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM teachers WHERE ID=?', [req.params.id]);
    if (result.affectedRows === 0) throw new ApiError(404, 'Teacher not found');
    res.json({ message: 'Teacher deleted' });
  } catch (err) { next(err); }
};
