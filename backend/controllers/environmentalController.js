'use strict';

const { validationResult } = require('express-validator');
const EnvironmentalInspection = require('../models/EnvironmentalInspection');

exports.createInspection = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const inspection = await EnvironmentalInspection.create({
      ...req.body,
      inspector: req.body.inspector || req.user._id,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};

exports.reportIncident = async (req, res, next) => {
  try {
    const { inspectionId, ...incidentData } = req.body;
    let inspection;
    if (inspectionId) {
      inspection = await EnvironmentalInspection.findById(inspectionId);
    }

    if (!inspection) {
      // Create standalone inspection for the incident
      inspection = await EnvironmentalInspection.create({
        type: 'surprise',
        location: incidentData.location || 'Unknown',
        inspector: req.user._id,
        status: 'completed',
        createdBy: req.user._id,
        conductedDate: new Date(),
      });
    }

    inspection.incidents.push({ ...incidentData, reportedBy: req.body.reportedBy || req.user._id });
    await inspection.save();
    res.json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};

exports.getRecentIncidents = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const inspections = await EnvironmentalInspection.find({ 'incidents.0': { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('type location incidents conductedDate')
      .populate('inspector', 'name');

    const incidents = [];
    for (const insp of inspections) {
      for (const inc of insp.incidents) {
        incidents.push({ ...inc.toObject(), inspection: { type: insp.type, location: insp.location } });
      }
    }
    incidents.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: incidents.slice(0, limit) });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentMetrics = async (req, res, next) => {
  try {
    const latest = await EnvironmentalInspection.findOne({ status: 'completed' })
      .sort({ conductedDate: -1 })
      .select('metrics complianceStatus conductedDate location');

    if (!latest) {
      return res.json({ success: true, data: null, message: 'No completed inspections found' });
    }
    res.json({ success: true, data: latest });
  } catch (err) {
    next(err);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const { period } = req.params;
    const days = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 365;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const inspections = await EnvironmentalInspection.find({
      createdAt: { $gte: since },
    }).populate('inspector', 'name');

    const summary = {
      total: inspections.length,
      completed: inspections.filter((i) => i.status === 'completed').length,
      scheduled: inspections.filter((i) => i.status === 'scheduled').length,
      compliant: inspections.filter((i) => i.complianceStatus === 'compliant').length,
      nonCompliant: inspections.filter((i) => i.complianceStatus === 'non-compliant').length,
      totalIncidents: inspections.reduce((s, i) => s + i.incidents.length, 0),
      totalFindings: inspections.reduce((s, i) => s + i.findings.length, 0),
    };

    res.json({ success: true, data: { period, since, summary, inspections } });
  } catch (err) {
    next(err);
  }
};
