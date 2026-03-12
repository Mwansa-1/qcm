'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['Employee', 'Admin', 'SuperAdmin']),
  ],
  ctrl.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  ctrl.login
);

router.post('/logout', auth, ctrl.logout);

router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty().withMessage('Refresh token required')],
  ctrl.refreshToken
);

module.exports = router;
