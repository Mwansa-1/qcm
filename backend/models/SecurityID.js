'use strict';

const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  point: { type: String, required: true },
  result: { type: String, enum: ['granted', 'denied'], required: true },
  method: { type: String, enum: ['card', 'rfid', 'qr', 'biometric'], default: 'card' },
  notes: { type: String },
});

const securityIDSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    cardNumber: { type: String, required: true, unique: true },
    rfidCode: { type: String, unique: true, sparse: true },
    qrCode: { type: String, unique: true, sparse: true },
    biometricHash: { type: String, select: false },
    status: {
      type: String,
      enum: ['active', 'inactive', 'lost', 'stolen', 'expired'],
      default: 'active',
    },
    accessPoints: [{ type: String }],
    accessLog: [accessLogSchema],
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SecurityID' },
    replacedAt: { type: Date },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

securityIDSchema.index({ employeeId: 1 });
securityIDSchema.index({ status: 1 });

module.exports = mongoose.model('SecurityID', securityIDSchema);
