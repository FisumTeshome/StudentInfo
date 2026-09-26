const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/students.controller');
const { validate } = require('../middleware/validate');
const { verifyToken, authorize } = require('../middleware/auth');

// Public read routes
router.get('/students', controller.getAll);
router.get('/students/:id', [param('id').isInt().toInt(), validate], controller.getById);

// Protected mutating routes (require auth + admin/teacher role)
router.post('/create', [
  verifyToken,
  authorize(['admin', 'teacher']),
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('clas').isLength({ min: 1 }).withMessage('Class is required'),
  validate
], controller.create);

router.put('/update/:id', [
  verifyToken,
  authorize(['admin', 'teacher']),
  param('id').isInt().toInt(),
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('clas').isLength({ min: 1 }).withMessage('Class is required'),
  validate
], controller.update);

router.delete('/students/:id', [
  verifyToken,
  authorize(['admin', 'teacher']),
  param('id').isInt().toInt(),
  validate
], controller.remove);

module.exports = router;
