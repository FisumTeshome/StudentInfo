const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const coursesController = require('../controllers/courses.controller');
const enrollmentsController = require('../controllers/enrollments.controller');
const gradesController = require('../controllers/grades.controller');
const analyticsController = require('../controllers/analytics.controller');
const exportController = require('../controllers/export.controller');
const teachersController = require('../controllers/teachers.controller');
const attendanceController = require('../controllers/attendance.controller');
const announcementsController = require('../controllers/announcements.controller');

// ── COURSES ───────────────────────────────────────────────────
router.get('/courses', coursesController.getAll);
router.get('/courses/:id', [param('id').isInt().toInt(), validate], coursesController.getById);
router.post('/courses', [
  verifyToken, authorize(['admin', 'teacher']),
  body('name').notEmpty().withMessage('Course name required'),
  body('code').notEmpty().withMessage('Course code required'),
  validate
], coursesController.create);
router.put('/courses/:id', [
  verifyToken, authorize(['admin', 'teacher']),
  param('id').isInt().toInt(),
  body('name').notEmpty().withMessage('Course name required'),
  body('code').notEmpty().withMessage('Course code required'),
  validate
], coursesController.update);
router.delete('/courses/:id', [
  verifyToken, authorize(['admin']),
  param('id').isInt().toInt(), validate
], coursesController.remove);

// ── ENROLLMENTS ───────────────────────────────────────────────
router.get('/enrollments/student/:studentId', [param('studentId').isInt().toInt(), validate], enrollmentsController.getByStudentId);
router.get('/enrollments/course/:courseId', [param('courseId').isInt().toInt(), validate], enrollmentsController.getByCourseId);
router.post('/enrollments', [
  verifyToken, authorize(['admin', 'teacher']),
  body('student_id').isInt().withMessage('Valid student ID required'),
  body('course_id').isInt().withMessage('Valid course ID required'),
  validate
], enrollmentsController.create);
router.delete('/enrollments/:id', [
  verifyToken, authorize(['admin', 'teacher']),
  param('id').isInt().toInt(), validate
], enrollmentsController.remove);

// ── GRADES ────────────────────────────────────────────────────
router.get('/grades/enrollment/:enrollmentId', [param('enrollmentId').isInt().toInt(), validate], gradesController.getByEnrollmentId);
router.get('/grades/student/:studentId', [param('studentId').isInt().toInt(), validate], gradesController.getByStudentId);
router.post('/grades', [
  verifyToken, authorize(['admin', 'teacher']),
  body('enrollment_id').isInt().withMessage('Valid enrollment ID required'),
  validate
], gradesController.createOrUpdate);

// ── ANALYTICS & DASHBOARD ─────────────────────────────────────
router.get('/analytics/dashboard', analyticsController.getDashboard);
router.get('/students/search', analyticsController.searchStudents);
router.get('/students/:studentId/profile', [param('studentId').isInt().toInt(), validate], analyticsController.getStudentProfile);

// ── EXPORTS ───────────────────────────────────────────────────
router.get('/export/students', [verifyToken], exportController.exportStudents);
router.get('/export/students/:studentId/grades', [verifyToken, param('studentId').isInt().toInt(), validate], exportController.exportStudentGrades);
router.get('/export/courses', [verifyToken], exportController.exportCourses);

// ── TEACHERS ──────────────────────────────────────────────────
router.get('/teachers', teachersController.getAll);
router.get('/teachers/:id', [param('id').isInt().toInt(), validate], teachersController.getById);
router.post('/teachers', [
  verifyToken, authorize(['admin']),
  body('full_name').notEmpty().withMessage('Full name required'),
  body('email').isEmail().withMessage('Valid email required'),
  validate
], teachersController.create);
router.put('/teachers/:id', [
  verifyToken, authorize(['admin']),
  param('id').isInt().toInt(),
  body('full_name').notEmpty().withMessage('Full name required'),
  body('email').isEmail().withMessage('Valid email required'),
  validate
], teachersController.update);
router.delete('/teachers/:id', [
  verifyToken, authorize(['admin']),
  param('id').isInt().toInt(), validate
], teachersController.remove);

// ── ATTENDANCE ────────────────────────────────────────────────
router.get('/attendance/student/:studentId', [param('studentId').isInt().toInt(), validate], attendanceController.getByStudent);
router.get('/attendance/student/:studentId/summary', [param('studentId').isInt().toInt(), validate], attendanceController.getSummary);
router.get('/attendance/course/:courseId/date/:date', attendanceController.getByClassDate);
router.post('/attendance', [
  verifyToken, authorize(['admin', 'teacher']),
  body('student_id').isInt().withMessage('Student ID required'),
  body('course_id').isInt().withMessage('Course ID required'),
  body('date').isDate().withMessage('Valid date required'),
  validate
], attendanceController.mark);
router.post('/attendance/bulk', [
  verifyToken, authorize(['admin', 'teacher']),
  body('course_id').isInt().withMessage('Course ID required'),
  body('date').isDate().withMessage('Valid date required'),
  body('records').isArray().withMessage('Records must be an array'),
  validate
], attendanceController.markBulk);

// ── ANNOUNCEMENTS ─────────────────────────────────────────────
router.get('/announcements', announcementsController.getAll);
router.get('/announcements/:id', [param('id').isInt().toInt(), validate], announcementsController.getById);
router.post('/announcements', [
  verifyToken, authorize(['admin', 'teacher']),
  body('title').notEmpty().withMessage('Title required'),
  body('content').notEmpty().withMessage('Content required'),
  validate
], announcementsController.create);
router.put('/announcements/:id', [
  verifyToken, authorize(['admin', 'teacher']),
  param('id').isInt().toInt(),
  body('title').notEmpty().withMessage('Title required'),
  body('content').notEmpty().withMessage('Content required'),
  validate
], announcementsController.update);
router.delete('/announcements/:id', [
  verifyToken, authorize(['admin']),
  param('id').isInt().toInt(), validate
], announcementsController.remove);

module.exports = router;
