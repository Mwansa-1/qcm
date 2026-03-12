'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/environmentalController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post(
  '/inspections',
  authorize('Admin', 'SuperAdmin'),
  [
    body('type').isIn(['routine', 'scheduled', 'surprise']).withMessage('Valid type required'),
    body('location').trim().notEmpty().withMessage('Location required'),
  ],
  ctrl.createInspection
);

router.post(
  '/incidents/report',
  [
    body('date').isISO8601().withMessage('Valid date required'),
    body('type').trim().notEmpty().withMessage('Incident type required'),
    body('description').trim().notEmpty().withMessage('Description required'),
  ],
  ctrl.reportIncident
);

router.get('/incidents/recent', ctrl.getRecentIncidents);
router.get('/metrics/current', ctrl.getCurrentMetrics);
router.get('/reports/:period', authorize('Admin', 'SuperAdmin'), ctrl.getReport);

module.exports = router;
