const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM courses WHERE ID = ?', [id]);
    if (rows.length === 0) throw new ApiError(404, 'Course not found');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, code, description, instructor, credits } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO courses (name, code, description, instructor, credits) VALUES (?,?,?,?,?)',
      [name, code, description, instructor, credits || 3]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, code, description, instructor, credits } = req.body;
    const [result] = await pool.execute(
      'UPDATE courses SET name=?, code=?, description=?, instructor=?, credits=? WHERE ID=?',
      [name, code, description, instructor, credits, id]
    );
    if (result.affectedRows === 0) throw new ApiError(404, 'Course not found');
    res.json({ changedRows: result.affectedRows });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [result] = await pool.execute('DELETE FROM courses WHERE ID=?', [id]);
    if (result.affectedRows === 0) throw new ApiError(404, 'Course not found');
    res.json({ affectedRows: result.affectedRows });
  } catch (err) {
    next(err);
  }
};
