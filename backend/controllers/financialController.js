'use strict';

const { validationResult } = require('express-validator');
const ChartOfAccount = require('../models/ChartOfAccount');
const JournalEntry = require('../models/JournalEntry');
const Invoice = require('../models/Invoice');

// ── Chart of Accounts ──────────────────────────────────────────────────────────

exports.getAccounts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) filter.accountType = req.query.type;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const accounts = await ChartOfAccount.find(filter)
      .sort({ accountCode: 1 })
      .populate('createdBy', 'name');
    res.json({ success: true, data: accounts });
  } catch (err) {
    next(err);
  }
};

exports.createAccount = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const account = await ChartOfAccount.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
};

// ── Journal Entries ────────────────────────────────────────────────────────────

exports.getJournalEntries = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.from || req.query.to) {
      filter.entryDate = {};
      if (req.query.from) filter.entryDate.$gte = new Date(req.query.from);
      if (req.query.to) filter.entryDate.$lte = new Date(req.query.to);
    }

    const [entries, total] = await Promise.all([
      JournalEntry.find(filter)
        .sort({ entryDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('lines.account', 'accountCode accountName')
        .populate('createdBy', 'name'),
      JournalEntry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.createJournalEntry = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { lines } = req.body;
    const totalDebits = lines.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredits = lines.reduce((s, l) => s + (l.credit || 0), 0);
    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      return res.status(400).json({ success: false, message: 'Journal entry must balance (debits === credits)' });
    }

    const count = await JournalEntry.countDocuments();
    const entryNumber = `JE-${String(count + 1).padStart(6, '0')}`;

    const entry = await JournalEntry.create({ ...req.body, entryNumber, createdBy: req.user._id });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};

exports.postJournalEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findById(req.params.id).populate('lines.account');
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }
    if (entry.status === 'posted') {
      return res.status(400).json({ success: false, message: 'Entry already posted' });
    }
    if (entry.isLocked) {
      return res.status(403).json({ success: false, message: 'Entry is locked' });
    }

    // Update account balances
    for (const line of entry.lines) {
      const account = line.account;
      const balanceDelta = line.debit - line.credit;
      const isDebitNormal = ['Asset', 'Expense'].includes(account.accountType);
      const balanceChange = isDebitNormal ? balanceDelta : -balanceDelta;
      await ChartOfAccount.findByIdAndUpdate(account._id, { $inc: { balance: balanceChange } });
    }

    entry.status = 'posted';
    entry.postedAt = new Date();
    entry.postedBy = req.user._id;
    await entry.save();

    res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};

// ── Invoices ───────────────────────────────────────────────────────────────────

exports.getInvoices = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort({ issueDate: -1 }).skip(skip).limit(limit).populate('createdBy', 'name'),
      Invoice.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const count = await Invoice.countDocuments();
    const prefix = req.body.type === 'sales' ? 'INV' : 'PUR';
    const invoiceNumber = `${prefix}-${String(count + 1).padStart(6, '0')}`;

    const invoice = await Invoice.create({ ...req.body, invoiceNumber, createdBy: req.user._id });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

// ── Reports ────────────────────────────────────────────────────────────────────

exports.balanceSheet = async (req, res, next) => {
  try {
    const accounts = await ChartOfAccount.find({ isActive: true });
    const grouped = { Asset: [], Liability: [], Equity: [] };
    for (const a of accounts) {
      if (grouped[a.accountType]) grouped[a.accountType].push(a);
    }
    const totals = {};
    for (const [type, list] of Object.entries(grouped)) {
      totals[type] = list.reduce((s, a) => s + a.balance, 0);
    }
    res.json({ success: true, data: { accounts: grouped, totals, generatedAt: new Date() } });
  } catch (err) {
    next(err);
  }
};

exports.incomeStatement = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const accounts = await ChartOfAccount.find({
      accountType: { $in: ['Revenue', 'Expense'] },
      isActive: true,
    });
    const revenues = accounts.filter((a) => a.accountType === 'Revenue');
    const expenses = accounts.filter((a) => a.accountType === 'Expense');
    const totalRevenue = revenues.reduce((s, a) => s + a.balance, 0);
    const totalExpenses = expenses.reduce((s, a) => s + a.balance, 0);

    res.json({
      success: true,
      data: {
        period: { from, to },
        revenues,
        expenses,
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        generatedAt: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Lock / Unlock (SuperAdmin) ─────────────────────────────────────────────────

exports.lockRecord = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'account' ? ChartOfAccount : type === 'entry' ? JournalEntry : Invoice;
    const record = await Model.findByIdAndUpdate(
      id,
      { isLocked: true, lockedBy: req.user._id, lockedAt: new Date() },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record locked', data: record });
  } catch (err) {
    next(err);
  }
};

exports.unlockRecord = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'account' ? ChartOfAccount : type === 'entry' ? JournalEntry : Invoice;
    const record = await Model.findByIdAndUpdate(
      id,
      { isLocked: false, lockedBy: null, lockedAt: null },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record unlocked', data: record });
  } catch (err) {
    next(err);
  }
};
