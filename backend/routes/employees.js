'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/employeesController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getEmployees);
router.get('/:id', ctrl.getEmployee);

router.post(
  '/',
  authorize('Admin', 'SuperAdmin'),
  [
    body('employeeId').trim().notEmpty().withMessage('Employee ID required'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('department').trim().notEmpty().withMessage('Department required'),
    body('position').trim().notEmpty().withMessage('Position required'),
    body('hireDate').isISO8601().withMessage('Valid hire date required'),
  ],
  ctrl.createEmployee
);

router.put(
  '/:id',
  authorize('Admin', 'SuperAdmin'),
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('hireDate').optional().isISO8601(),
  ],
  ctrl.updateEmployee
);

router.delete('/:id', authorize('Admin', 'SuperAdmin'), ctrl.deleteEmployee);

module.exports = router;
