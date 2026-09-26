const pool = require('../config/db');

// Get dashboard analytics data
exports.getDashboard = async (req, res, next) => {
  try {
    // Total students, courses, enrollments
    const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM students');
    const [courseCount] = await pool.query('SELECT COUNT(*) as count FROM courses');
    const [enrollmentCount] = await pool.query('SELECT COUNT(*) as count FROM enrollments');

    // Students per class
    const [studentsPerClass] = await pool.query(`
      SELECT class, COUNT(*) as count FROM students GROUP BY class
    `);

    // Average grades distribution
    const [gradeDistribution] = await pool.query(`
      SELECT letter_grade, COUNT(*) as count FROM grades GROUP BY letter_grade ORDER BY letter_grade
    `);

    // Top performing students
    const [topStudents] = await pool.query(`
      SELECT s.ID, s.Name, s.email, AVG(g.final_score) as avg_score
      FROM students s
      LEFT JOIN enrollments e ON s.ID = e.student_id
      LEFT JOIN grades g ON e.ID = g.enrollment_id
      GROUP BY s.ID, s.Name, s.email
      ORDER BY avg_score DESC
      LIMIT 5
    `);

    // Courses with most enrollments
    const [popularCourses] = await pool.query(`
      SELECT c.ID, c.name, c.code, COUNT(e.ID) as enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON c.ID = e.course_id
      GROUP BY c.ID, c.name, c.code
      ORDER BY enrollment_count DESC
      LIMIT 5
    `);

    res.json({
      totals: {
        students: studentCount[0].count,
        courses: courseCount[0].count,
        enrollments: enrollmentCount[0].count
      },
      studentsPerClass,
      gradeDistribution,
      topStudents,
      popularCourses
    });
  } catch (err) {
    next(err);
  }
};

// Search and filter students
exports.searchStudents = async (req, res, next) => {
  try {
    const { search = '', class: studentClass = '', sort = 'Name', order = 'ASC' } = req.query;
    
    // Validate sort field (whitelist to prevent SQL injection)
    const allowedSortFields = ['ID', 'Name', 'email', 'class', 'created_at'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'Name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (Name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (studentClass) {
      query += ' AND class = ?';
      params.push(studentClass);
    }

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get student with enrollments and grades
exports.getStudentProfile = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    const [student] = await pool.query('SELECT * FROM students WHERE ID = ?', [studentId]);
    if (student.length === 0) return res.status(404).json({ error: { message: 'Student not found' } });

    const [enrollments] = await pool.query(`
      SELECT e.ID as enrollment_id, c.ID as course_id, c.name, c.code, e.enrollment_date,
             g.midterm_score, g.final_score, g.letter_grade, g.attendance_percentage
      FROM enrollments e
      JOIN courses c ON e.course_id = c.ID
      LEFT JOIN grades g ON e.ID = g.enrollment_id
      WHERE e.student_id = ?
    `, [studentId]);

    res.json({
      ...student[0],
      enrollments
    });
  } catch (err) {
    next(err);
  }
};
