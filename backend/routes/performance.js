'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/performanceController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/dashboards', ctrl.getDashboards);
router.post(
  '/dashboards',
  authorize('Admin', 'SuperAdmin'),
  [
    body('employee').notEmpty().withMessage('Employee ID required'),
    body('reviewer').notEmpty().withMessage('Reviewer ID required'),
    body('period.startDate').isISO8601().withMessage('Valid start date required'),
    body('period.endDate').isISO8601().withMessage('Valid end date required'),
  ],
  ctrl.createDashboard
);
router.get('/dashboards/:id/kpis', ctrl.getDashboardKPIs);
router.get('/dashboards/:id/measurements', ctrl.getDashboardMeasurements);

router.post(
  '/reviews',
  authorize('Admin', 'SuperAdmin'),
  [
    body('employee').notEmpty().withMessage('Employee ID required'),
    body('reviewer').notEmpty().withMessage('Reviewer ID required'),
    body('period.startDate').isISO8601().withMessage('Valid start date required'),
    body('period.endDate').isISO8601().withMessage('Valid end date required'),
  ],
  ctrl.createReview
);

router.put(
  '/reviews/:id',
  [body('status').optional().isIn(['draft', 'submitted', 'approved', 'rejected'])],
  ctrl.updateReview
);

module.exports = router;
