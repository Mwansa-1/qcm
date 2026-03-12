'use strict';

const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  target: { type: Number, required: true },
  actual: { type: Number, default: 0 },
  weight: { type: Number, default: 1, min: 0, max: 100 },
  unit: { type: String },
  score: { type: Number, min: 0, max: 5 },
});

const competencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  comments: { type: String },
});

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  status: { type: String, enum: ['not-started', 'in-progress', 'completed', 'cancelled'], default: 'not-started' },
  completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
  comments: { type: String },
});

const okrSchema = new mongoose.Schema({
  objective: { type: String, required: true },
  keyResults: [
    {
      description: { type: String, required: true },
      target: { type: Number, required: true },
      current: { type: Number, default: 0 },
      unit: { type: String },
    },
  ],
});

const performanceReviewSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    period: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      label: { type: String },
    },
    kpis: [kpiSchema],
    competencies: [competencySchema],
    goals: [goalSchema],
    okrs: [okrSchema],
    overallRating: { type: Number, min: 1, max: 5 },
    employeeComments: { type: String },
    reviewerComments: { type: String },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft',
    },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

performanceReviewSchema.index({ employee: 1 });
performanceReviewSchema.index({ status: 1 });

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);
