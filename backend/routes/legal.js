'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/legalController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

// Templates
router.get('/templates', ctrl.getTemplates);
router.post(
  '/templates',
  authorize('Admin', 'SuperAdmin'),
  [
    body('name').trim().notEmpty().withMessage('Template name required'),
    body('category').trim().notEmpty().withMessage('Category required'),
    body('content').trim().notEmpty().withMessage('Content required'),
  ],
  ctrl.createTemplate
);

// Documents
router.post(
  '/documents/create-from-template',
  authorize('Admin', 'SuperAdmin'),
  [
    body('templateId').notEmpty().withMessage('Template ID required'),
    body('title').trim().notEmpty().withMessage('Document title required'),
  ],
  ctrl.createDocumentFromTemplate
);
router.get('/documents', ctrl.getDocuments);
router.put('/documents/:id', authorize('Admin', 'SuperAdmin'), ctrl.updateDocument);

// Signatories & signing
router.post(
  '/documents/:id/signatories',
  authorize('Admin', 'SuperAdmin'),
  [
    body('name').trim().notEmpty().withMessage('Signatory name required'),
    body('email').isEmail().withMessage('Valid signatory email required'),
  ],
  ctrl.addSignatory
);
router.post(
  '/documents/:id/sign',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('signature').notEmpty().withMessage('Signature required'),
  ],
  ctrl.signDocument
);

// Lock / Unlock (SuperAdmin)
router.put('/documents/:id/lock', authorize('SuperAdmin'), ctrl.lockDocument);
router.put('/documents/:id/unlock', authorize('SuperAdmin'), ctrl.unlockDocument);

// History & hash
router.get('/documents/:id/history', ctrl.getDocumentHistory);
router.get('/documents/:id/hash', ctrl.getDocumentHash);

module.exports = router;
