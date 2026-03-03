'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/vehiclesController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post(
  '/register',
  authorize('Admin', 'SuperAdmin'),
  [
    body('registrationNumber').trim().notEmpty().withMessage('Registration number required'),
    body('make').trim().notEmpty().withMessage('Make required'),
    body('model').trim().notEmpty().withMessage('Model required'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year required'),
  ],
  ctrl.registerVehicle
);

router.post(
  '/assign',
  authorize('Admin', 'SuperAdmin'),
  [
    body('vehicleId').notEmpty().withMessage('Vehicle ID required'),
    body('employeeId').notEmpty().withMessage('Employee ID required'),
  ],
  ctrl.assignVehicle
);

router.post('/assignments/:id/complete', authorize('Admin', 'SuperAdmin'), ctrl.completeAssignment);

router.post(
  '/:id/maintenance',
  authorize('Admin', 'SuperAdmin'),
  [
    body('date').isISO8601().withMessage('Valid date required'),
    body('type').trim().notEmpty().withMessage('Maintenance type required'),
  ],
  ctrl.addMaintenance
);

router.get('/:id/health', ctrl.getVehicleHealth);
router.get('/fleet-report', ctrl.getFleetReport);

module.exports = router;
