'use strict';

const { validationResult } = require('express-validator');
const PerformanceReview = require('../models/PerformanceReview');
const Employee = require('../models/Employee');

exports.getDashboards = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    const allowedStatuses = ['draft', 'submitted', 'approved', 'rejected'];
    const rawStatus = String(req.query.status || '');
    const rawEmployeeId = String(req.query.employeeId || '');
    if (rawStatus && allowedStatuses.includes(rawStatus)) {
      filter.status = rawStatus;
    }
    if (rawEmployeeId && /^[a-fA-F0-9]{24}$/.test(rawEmployeeId)) {
      filter.employee = rawEmployeeId;
    }

    const [reviews, total] = await Promise.all([
      PerformanceReview.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('employee', 'firstName lastName department position')
        .populate('reviewer', 'firstName lastName'),
      PerformanceReview.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.createDashboard = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const review = await PerformanceReview.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardKPIs = async (req, res, next) => {
  try {
    const review = await PerformanceReview.findById(req.params.id).select('kpis employee period');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: review.kpis });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardMeasurements = async (req, res, next) => {
  try {
    const review = await PerformanceReview.findById(req.params.id).select(
      'kpis competencies goals okrs overallRating'
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const review = await PerformanceReview.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot update an approved review' });
    }

    const { status } = req.body;
    if (status === 'submitted') {
      req.body.submittedAt = new Date();
    }
    if (status === 'approved') {
      req.body.approvedAt = new Date();
      req.body.approvedBy = req.user._id;

      // Calculate overall rating from KPI scores
      if (review.kpis.length > 0) {
        const totalWeight = review.kpis.reduce((s, k) => s + k.weight, 0);
        const weighted = review.kpis.reduce((s, k) => s + (k.score || 0) * k.weight, 0);
        req.body.overallRating = totalWeight > 0 ? parseFloat((weighted / totalWeight).toFixed(2)) : null;
      }
    }

    const updated = await PerformanceReview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
