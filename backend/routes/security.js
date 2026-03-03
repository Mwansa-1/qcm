'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/securityController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post(
  '/ids/issue',
  authorize('Admin', 'SuperAdmin'),
  [
    body('employeeId').notEmpty().withMessage('Employee ID required'),
    body('expiresAt').optional().isISO8601(),
  ],
  ctrl.issueID
);

router.post(
  '/access/validate',
  [body('accessPoint').notEmpty().withMessage('Access point required')],
  ctrl.validateAccess
);

router.put(
  '/ids/:id/status',
  authorize('Admin', 'SuperAdmin'),
  [body('status').isIn(['active', 'inactive', 'lost', 'stolen', 'expired']).withMessage('Valid status required')],
  ctrl.updateIDStatus
);

router.post('/ids/:id/replace', authorize('Admin', 'SuperAdmin'), ctrl.replaceID);

router.get('/ids', ctrl.getIDs);
router.get('/reports/:period', authorize('Admin', 'SuperAdmin'), ctrl.getReport);

module.exports = router;
