const { Parser } = require('json2csv');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

// Export students to CSV
exports.exportStudents = async (req, res, next) => {
  try {
    const [students] = await pool.query('SELECT ID, Name, email, class, created_at FROM students');
    
    const fields = ['ID', 'Name', 'email', 'class', 'created_at'];
    const parser = new Parser({ fields });
    const csv = parser.parse(students);

    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', 'attachment; filename="students.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// Export student with grades to CSV
exports.exportStudentGrades = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    
    const query = `
      SELECT s.Name, s.email, s.class, c.name as course_name, c.code,
             g.midterm_score, g.final_score, g.letter_grade, g.attendance_percentage, e.enrollment_date
      FROM students s
      LEFT JOIN enrollments e ON s.ID = e.student_id
      LEFT JOIN courses c ON e.course_id = c.ID
      LEFT JOIN grades g ON e.ID = g.enrollment_id
      WHERE s.ID = ?
    `;
    
    const [data] = await pool.query(query, [studentId]);
    if (data.length === 0) throw new ApiError(404, 'Student not found');

    const fields = ['Name', 'email', 'class', 'course_name', 'code', 'midterm_score', 'final_score', 'letter_grade', 'attendance_percentage', 'enrollment_date'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', `attachment; filename="student_${studentId}_grades.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// Export courses to CSV
exports.exportCourses = async (req, res, next) => {
  try {
    const [courses] = await pool.query('SELECT ID, name, code, instructor, credits FROM courses');

    const fields = ['ID', 'name', 'code', 'instructor', 'credits'];
    const parser = new Parser({ fields });
    const csv = parser.parse(courses);

    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', 'attachment; filename="courses.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};;
