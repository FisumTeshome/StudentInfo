const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

// Get grade for an enrollment
exports.getByEnrollmentId = async (req, res, next) => {
  try {
    const enrollmentId = req.params.enrollmentId;
    const [rows] = await pool.query('SELECT * FROM grades WHERE enrollment_id = ?', [enrollmentId]);
    if (rows.length === 0) throw new ApiError(404, 'Grade not found');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Get all grades for a student
exports.getByStudentId = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const query = `
      SELECT g.*, c.name as course_name, c.code
      FROM grades g
      JOIN enrollments e ON g.enrollment_id = e.ID
      JOIN courses c ON e.course_id = c.ID
      WHERE e.student_id = ?
    `;
    const [rows] = await pool.query(query, [studentId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Create or update grade
exports.createOrUpdate = async (req, res, next) => {
  try {
    const { enrollment_id, midterm_score, final_score, letter_grade, attendance_percentage } = req.body;
    
    if (!enrollment_id) throw new ApiError(400, 'Enrollment ID is required');

    // Calculate letter grade if not provided
    let grade = letter_grade;
    if (!letter_grade && final_score) {
      if (final_score >= 90) grade = 'A';
      else if (final_score >= 80) grade = 'B';
      else if (final_score >= 70) grade = 'C';
      else if (final_score >= 60) grade = 'D';
      else grade = 'F';
    }

    // Check if grade exists
    const [existing] = await pool.query('SELECT * FROM grades WHERE enrollment_id = ?', [enrollment_id]);

    if (existing.length > 0) {
      // Update existing
      const [result] = await pool.execute(
        'UPDATE grades SET midterm_score=?, final_score=?, letter_grade=?, attendance_percentage=? WHERE enrollment_id=?',
        [midterm_score, final_score, grade, attendance_percentage, enrollment_id]
      );
      res.json({ changedRows: result.affectedRows });
    } else {
      // Create new
      const [result] = await pool.execute(
        'INSERT INTO grades (enrollment_id, midterm_score, final_score, letter_grade, attendance_percentage) VALUES (?,?,?,?,?)',
        [enrollment_id, midterm_score, final_score, grade, attendance_percentage]
      );
      res.status(201).json({ id: result.insertId });
    }
  } catch (err) {
    next(err);
  }
};
