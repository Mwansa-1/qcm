'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/medicalController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post(
  '/records',
  authorize('Admin', 'SuperAdmin'),
  [body('employeeId').notEmpty().withMessage('Employee ID required')],
  ctrl.createRecord
);

router.post(
  '/certificates',
  authorize('Admin', 'SuperAdmin'),
  [
    body('employeeId').notEmpty().withMessage('Employee ID required'),
    body('type').trim().notEmpty().withMessage('Certificate type required'),
    body('issuedDate').isISO8601().withMessage('Valid issue date required'),
  ],
  ctrl.addCertificate
);

router.post(
  '/visits',
  authorize('Admin', 'SuperAdmin'),
  [
    body('employeeId').notEmpty().withMessage('Employee ID required'),
    body('date').isISO8601().withMessage('Valid date required'),
  ],
  ctrl.addVisit
);

router.get('/employees/:id/status', ctrl.getEmployeeStatus);

router.post(
  '/incidents',
  [
    body('employeeId').notEmpty().withMessage('Employee ID required'),
    body('date').isISO8601().withMessage('Valid date required'),
    body('type').trim().notEmpty().withMessage('Incident type required'),
    body('description').trim().notEmpty().withMessage('Description required'),
  ],
  ctrl.reportIncident
);

router.get('/reports/:period', authorize('Admin', 'SuperAdmin'), ctrl.getReport);

module.exports = router;
