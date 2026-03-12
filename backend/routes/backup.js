'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/backupController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth, authorize('Admin', 'SuperAdmin'));

router.post(
  '/create',
  [body('name').trim().notEmpty().withMessage('Backup name required')],
  ctrl.createBackup
);

router.post(
  '/schedule',
  [
    body('name').trim().notEmpty().withMessage('Backup name required'),
    body('cronExpression').trim().notEmpty().withMessage('Cron expression required'),
  ],
  ctrl.scheduleBackup
);

router.post('/:id/restore', authorize('SuperAdmin'), ctrl.restoreBackup);
router.get('/:id/download', ctrl.downloadBackup);
router.get('/:id/status', ctrl.getBackupStatus);
router.get('/list', ctrl.listBackups);
router.delete('/:id', authorize('SuperAdmin'), ctrl.deleteBackup);
router.post('/cleanup', authorize('SuperAdmin'), ctrl.cleanupBackups);

module.exports = router;
