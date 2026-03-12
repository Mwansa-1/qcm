'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/financialController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

// Chart of Accounts
router.get('/accounts', ctrl.getAccounts);
router.post(
  '/accounts',
  authorize('Admin', 'SuperAdmin'),
  [
    body('accountCode').trim().notEmpty().withMessage('Account code required'),
    body('accountName').trim().notEmpty().withMessage('Account name required'),
    body('accountType')
      .isIn(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'])
      .withMessage('Valid account type required'),
  ],
  ctrl.createAccount
);

// Journal Entries
router.get('/journal-entries', ctrl.getJournalEntries);
router.post(
  '/journal-entries',
  authorize('Admin', 'SuperAdmin'),
  [
    body('description').trim().notEmpty().withMessage('Description required'),
    body('entryDate').isISO8601().withMessage('Valid date required'),
    body('lines').isArray({ min: 2 }).withMessage('At least two journal lines required'),
    body('lines.*.account').notEmpty().withMessage('Account required for each line'),
  ],
  ctrl.createJournalEntry
);
router.post('/journal-entries/:id/post', authorize('Admin', 'SuperAdmin'), ctrl.postJournalEntry);

// Invoices
router.get('/invoices', ctrl.getInvoices);
router.post(
  '/invoices',
  authorize('Admin', 'SuperAdmin'),
  [
    body('type').isIn(['sales', 'purchase']).withMessage('Type must be sales or purchase'),
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.description').notEmpty().withMessage('Item description required'),
    body('items.*.quantity').isNumeric().withMessage('Item quantity must be numeric'),
    body('items.*.unitPrice').isNumeric().withMessage('Item unit price must be numeric'),
  ],
  ctrl.createInvoice
);

// Reports
router.post('/reports/balance-sheet', ctrl.balanceSheet);
router.post('/reports/income-statement', ctrl.incomeStatement);

// Lock / Unlock (SuperAdmin only)
router.put('/lock/:type/:id', authorize('SuperAdmin'), ctrl.lockRecord);
router.put('/unlock/:type/:id', authorize('SuperAdmin'), ctrl.unlockRecord);

module.exports = router;
