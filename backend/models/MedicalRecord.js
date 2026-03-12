'use strict';

const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  type: { type: String, required: true },
  issuedDate: { type: Date, required: true },
  expiryDate: { type: Date },
  issuedBy: { type: String },
  documentUrl: { type: String },
});

const visitSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  doctor: { type: String },
  facility: { type: String },
  reason: { type: String },
  diagnosis: { type: String },
  treatment: { type: String },
  followUpDate: { type: Date },
  notes: { type: String },
});

const incidentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  severity: { type: String, enum: ['minor', 'moderate', 'severe'], default: 'minor' },
  treatmentProvided: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workRelated: { type: Boolean, default: false },
});

const medicalRecordSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true },
    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] },
    allergies: [{ type: String }],
    conditions: [{ type: String }],
    medications: [{ type: String }],
    certificates: [certificateSchema],
    visits: [visitSchema],
    incidents: [incidentSchema],
    restrictions: [{ type: String }],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    notes: { type: String, select: false },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
