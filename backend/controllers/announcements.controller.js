const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res, next) => {
  try {
    const userRole = req.user?.role || 'viewer';
    const [rows] = await pool.query(`
      SELECT a.*, u.username as author_name
      FROM announcements a
      JOIN users u ON a.author_id = u.ID
      WHERE (a.target_role = 'all' OR a.target_role = ?)
        AND (a.expires_at IS NULL OR a.expires_at >= CURDATE())
      ORDER BY a.pinned DESC, a.created_at DESC
    `, [userRole]);
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, u.username as author_name
      FROM announcements a JOIN users u ON a.author_id = u.ID
      WHERE a.ID = ?
    `, [req.params.id]);
    if (rows.length === 0) throw new ApiError(404, 'Announcement not found');
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, content, category, target_role, pinned, expires_at } = req.body;
    const author_id = req.user.id;
    const [result] = await pool.execute(
      'INSERT INTO announcements (title, content, author_id, category, target_role, pinned, expires_at) VALUES (?,?,?,?,?,?,?)',
      [title, content, author_id, category || 'general', target_role || 'all', pinned ? 1 : 0, expires_at || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Announcement created' });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { title, content, category, target_role, pinned, expires_at } = req.body;
    const [result] = await pool.execute(
      'UPDATE announcements SET title=?, content=?, category=?, target_role=?, pinned=?, expires_at=? WHERE ID=?',
      [title, content, category || 'general', target_role || 'all', pinned ? 1 : 0, expires_at || null, req.params.id]
    );
    if (result.affectedRows === 0) throw new ApiError(404, 'Announcement not found');
    res.json({ message: 'Announcement updated' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM announcements WHERE ID=?', [req.params.id]);
    if (result.affectedRows === 0) throw new ApiError(404, 'Announcement not found');
    res.json({ message: 'Announcement deleted' });
  } catch (err) { next(err); }
};
