'use strict';

const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  evidence: { type: String },
  recommendation: { type: String },
});

const correctiveActionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  dueDate: { type: Date },
  completedAt: { type: Date },
  status: { type: String, enum: ['open', 'in-progress', 'completed', 'overdue'], default: 'open' },
  notes: { type: String },
});

const envIncidentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['minor', 'moderate', 'major', 'critical'], default: 'minor' },
  location: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  correctiveAction: { type: String },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
});

const environmentalInspectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['routine', 'scheduled', 'surprise'],
      required: true,
    },
    location: { type: String, required: true },
    inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date },
    conductedDate: { type: Date },
    findings: [findingSchema],
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    incidents: [envIncidentSchema],
    correctiveActions: [correctiveActionSchema],
    metrics: {
      airQualityIndex: Number,
      noiseLevel: Number,
      wasteGenerated: Number,
      energyConsumed: Number,
      waterUsage: Number,
      carbonEmissions: Number,
    },
    complianceStatus: {
      type: String,
      enum: ['compliant', 'non-compliant', 'partial', 'pending'],
      default: 'pending',
    },
    reportUrl: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

environmentalInspectionSchema.index({ type: 1, status: 1 });
environmentalInspectionSchema.index({ scheduledDate: -1 });

module.exports = mongoose.model('EnvironmentalInspection', environmentalInspectionSchema);
