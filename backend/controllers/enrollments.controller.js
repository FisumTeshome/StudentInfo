const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

// Get all enrollments for a student
exports.getByStudentId = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const query = `
      SELECT e.ID, e.student_id, e.course_id, c.name as course_name, c.code, e.enrollment_date
      FROM enrollments e
      JOIN courses c ON e.course_id = c.ID
      WHERE e.student_id = ?
    `;
    const [rows] = await pool.query(query, [studentId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get all enrollments for a course
exports.getByCourseId = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const query = `
      SELECT e.ID, e.student_id, e.course_id, s.Name as student_name, s.email, e.enrollment_date
      FROM enrollments e
      JOIN students s ON e.student_id = s.ID
      WHERE e.course_id = ?
    `;
    const [rows] = await pool.query(query, [courseId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Create enrollment
exports.create = async (req, res, next) => {
  try {
    const { student_id, course_id } = req.body;
    if (!student_id || !course_id) throw new ApiError(400, 'Student ID and Course ID are required');
    
    const [result] = await pool.execute(
      'INSERT INTO enrollments (student_id, course_id) VALUES (?,?)',
      [student_id, course_id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// Delete enrollment
exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [result] = await pool.execute('DELETE FROM enrollments WHERE ID=?', [id]);
    if (result.affectedRows === 0) throw new ApiError(404, 'Enrollment not found');
    res.json({ affectedRows: result.affectedRows });
  } catch (err) {
    next(err);
  }
};
