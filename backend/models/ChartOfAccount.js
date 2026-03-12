'use strict';

const mongoose = require('mongoose');

const chartOfAccountSchema = new mongoose.Schema(
  {
    accountCode: { type: String, required: true, unique: true, trim: true },
    accountName: { type: String, required: true, trim: true },
    accountType: {
      type: String,
      required: true,
      enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
    },
    description: { type: String },
    balance: { type: Number, default: 0 },
    parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccount' },
    isActive: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChartOfAccount', chartOfAccountSchema);
