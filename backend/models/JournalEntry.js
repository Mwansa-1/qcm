'use strict';

const mongoose = require('mongoose');

const journalLineSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
  description: { type: String },
  debit: { type: Number, default: 0, min: 0 },
  credit: { type: Number, default: 0, min: 0 },
});

const journalEntrySchema = new mongoose.Schema(
  {
    entryNumber: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    entryDate: { type: Date, required: true, default: Date.now },
    lines: { type: [journalLineSchema], validate: [l => l.length >= 2, 'Minimum two journal lines required'] },
    status: { type: String, enum: ['draft', 'posted'], default: 'draft' },
    reference: { type: String },
    isLocked: { type: Boolean, default: false },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockedAt: { type: Date },
    postedAt: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

journalEntrySchema.index({ entryDate: -1 });
journalEntrySchema.index({ status: 1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
