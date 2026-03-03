'use strict';

const { validationResult } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const Employee = require('../models/Employee');

const getOrCreate = async (employeeId, userId) => {
  let record = await MedicalRecord.findOne({ employeeId });
  if (!record) {
    record = await MedicalRecord.create({ employeeId, lastUpdatedBy: userId });
  }
  return record;
};

exports.createRecord = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const existing = await MedicalRecord.findOne({ employeeId: req.body.employeeId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Medical record already exists for this employee' });
    }
    const employee = await Employee.findById(req.body.employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const record = await MedicalRecord.create({ ...req.body, lastUpdatedBy: req.user._id });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.addCertificate = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    const record = await getOrCreate(employeeId, req.user._id);
    record.certificates.push(req.body);
    record.lastUpdatedBy = req.user._id;
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.addVisit = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    const record = await getOrCreate(employeeId, req.user._id);
    record.visits.push(req.body);
    record.lastUpdatedBy = req.user._id;
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.getEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const record = await MedicalRecord.findOne({ employeeId: req.params.id }).select(
      '-notes'
    );
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    const now = new Date();
    const expiredCerts = record.certificates.filter(
      (c) => c.expiryDate && new Date(c.expiryDate) < now
    );
    const activeCerts = record.certificates.filter(
      (c) => !c.expiryDate || new Date(c.expiryDate) >= now
    );

    res.json({
      success: true,
      data: {
        employee: { _id: employee._id, name: `${employee.firstName} ${employee.lastName}` },
        bloodType: record.bloodType,
        allergies: record.allergies,
        restrictions: record.restrictions,
        certificates: { active: activeCerts, expired: expiredCerts },
        lastVisit: record.visits.sort((a, b) => b.date - a.date)[0] || null,
        incidentCount: record.incidents.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.reportIncident = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    const record = await getOrCreate(employeeId, req.user._id);
    record.incidents.push({ ...req.body, reportedBy: req.user._id });
    record.lastUpdatedBy = req.user._id;
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const { period } = req.params;
    const days = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 365;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const records = await MedicalRecord.find().populate('employeeId', 'firstName lastName department');
    let totalIncidents = 0;
    let workRelated = 0;
    let totalVisits = 0;

    for (const r of records) {
      const periodIncidents = r.incidents.filter((i) => i.date >= since);
      totalIncidents += periodIncidents.length;
      workRelated += periodIncidents.filter((i) => i.workRelated).length;
      totalVisits += r.visits.filter((v) => v.date >= since).length;
    }

    const now = new Date();
    const expiringCerts = [];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    for (const r of records) {
      for (const c of r.certificates) {
        if (c.expiryDate && new Date(c.expiryDate) <= nextMonth && new Date(c.expiryDate) >= now) {
          expiringCerts.push({ employeeId: r.employeeId, certificate: c });
        }
      }
    }

    res.json({
      success: true,
      data: { period, totalIncidents, workRelated, totalVisits, expiringCertificates: expiringCerts, since },
    });
  } catch (err) {
    next(err);
  }
};
