const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

// Get all attendance records for a student (across all courses)
exports.getByStudent = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, c.name as course_name, c.code as course_code,
             s.Name as student_name, u.username as marked_by_name
      FROM attendance a
      JOIN courses c ON a.course_id = c.ID
      JOIN students s ON a.student_id = s.ID
      LEFT JOIN users u ON a.marked_by = u.ID
      WHERE a.student_id = ?
      ORDER BY a.date DESC, c.name ASC
    `, [req.params.studentId]);
    res.json(rows);
  } catch (err) { next(err); }
};

// Get class register for a specific course and date
exports.getByClassDate = async (req, res, next) => {
  try {
    const { courseId, date } = req.params;
    // Get all enrolled students
    const [enrolled] = await pool.query(`
      SELECT s.ID as student_id, s.Name, s.email,
             a.ID as attendance_id, a.status, a.remarks
      FROM enrollments e
      JOIN students s ON e.student_id = s.ID
      LEFT JOIN attendance a ON a.student_id = s.ID AND a.course_id = ? AND a.date = ?
      WHERE e.course_id = ?
      ORDER BY s.Name ASC
    `, [courseId, date, courseId]);
    res.json(enrolled);
  } catch (err) { next(err); }
};

// Mark attendance (upsert)
exports.mark = async (req, res, next) => {
  try {
    const { student_id, course_id, date, status, remarks } = req.body;
    const marked_by = req.user?.id;
    await pool.execute(`
      INSERT INTO attendance (student_id, course_id, date, status, remarks, marked_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status=VALUES(status), remarks=VALUES(remarks), marked_by=VALUES(marked_by)
    `, [student_id, course_id, date, status || 'present', remarks || null, marked_by || null]);
    res.json({ message: 'Attendance recorded' });
  } catch (err) { next(err); }
};

// Mark attendance in bulk for a whole class
exports.markBulk = async (req, res, next) => {
  try {
    const { course_id, date, records } = req.body; // records: [{student_id, status, remarks}]
    const marked_by = req.user?.id;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const r of records) {
        await conn.execute(`
          INSERT INTO attendance (student_id, course_id, date, status, remarks, marked_by)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE status=VALUES(status), remarks=VALUES(remarks), marked_by=VALUES(marked_by)
        `, [r.student_id, course_id, date, r.status || 'present', r.remarks || null, marked_by || null]);
      }
      await conn.commit();
      res.json({ message: `Marked ${records.length} attendance records` });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) { next(err); }
};

// Attendance summary per student (% present per course)
exports.getSummary = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.name as course_name, c.code as course_code,
             COUNT(*) as total_days,
             SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
             SUM(CASE WHEN a.status = 'late'    THEN 1 ELSE 0 END) as late_days,
             SUM(CASE WHEN a.status = 'absent'  THEN 1 ELSE 0 END) as absent_days,
             ROUND(100.0 * SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / COUNT(*), 1) as attendance_pct
      FROM attendance a
      JOIN courses c ON a.course_id = c.ID
      WHERE a.student_id = ?
      GROUP BY c.ID, c.name, c.code
      ORDER BY c.name ASC
    `, [req.params.studentId]);
    res.json(rows);
  } catch (err) { next(err); }
};
