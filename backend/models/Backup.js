'use strict';

const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    scope: {
      type: [String],
      enum: ['employees', 'financial', 'legal', 'security', 'vehicles', 'medical', 'environmental', 'performance', 'all'],
      default: ['all'],
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    filePath: { type: String },
    fileSize: { type: Number },
    encryptionKey: { type: String, select: false },
    isEncrypted: { type: Boolean, default: false },
    isCompressed: { type: Boolean, default: false },
    compressionType: { type: String, enum: ['gzip', 'zip', 'none'], default: 'none' },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    retentionDays: { type: Number, default: 30, min: 1 },
    integrity: { type: String },
    error: { type: String },
    scheduleExpression: { type: String },
    isScheduled: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

backupSchema.index({ status: 1 });
backupSchema.index({ createdAt: -1 });
backupSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('Backup', backupSchema);
