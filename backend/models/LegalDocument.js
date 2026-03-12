'use strict';

const mongoose = require('mongoose');

const signatorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  order: { type: Number, default: 0 },
  signedAt: { type: Date },
  signature: { type: String },
  ipAddress: { type: String },
  status: { type: String, enum: ['pending', 'signed', 'declined'], default: 'pending' },
});

const versionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  content: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
  changeNote: { type: String },
});

const auditEntrySchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedAt: { type: Date, default: Date.now },
  details: { type: String },
  ipAddress: { type: String },
});

const legalDocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    variables: { type: mongoose.Schema.Types.Mixed, default: {} },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalTemplate' },
    signatories: [signatorySchema],
    status: {
      type: String,
      enum: ['draft', 'pending', 'signed', 'executed', 'cancelled'],
      default: 'draft',
    },
    versions: [versionSchema],
    auditTrail: [auditEntrySchema],
    hash: { type: String },
    isLocked: { type: Boolean, default: false },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

legalDocumentSchema.index({ status: 1 });
legalDocumentSchema.index({ createdBy: 1 });

module.exports = mongoose.model('LegalDocument', legalDocumentSchema);
