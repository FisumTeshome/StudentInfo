const pool = require('../config/db');

const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM students WHERE ID = ?', [id]);
    if (rows.length === 0) throw new ApiError(404, 'Student not found');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, clas } = req.body;
    const [result] = await pool.execute('INSERT INTO students (`Name`,`email`,`class`) VALUES (?,?,?)', [name, email, clas]);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, email, clas } = req.body;
    const [result] = await pool.execute('UPDATE students SET `Name`=?, `email`=?, `class`=? WHERE ID=?', [name, email, clas, id]);
    if (result.affectedRows === 0) throw new ApiError(404, 'Student not found');
    res.json({ changedRows: result.affectedRows });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [result] = await pool.execute('DELETE FROM students WHERE ID=?', [id]);
    if (result.affectedRows === 0) throw new ApiError(404, 'Student not found');
    res.json({ affectedRows: result.affectedRows });
  } catch (err) {
    next(err);
  }
};
