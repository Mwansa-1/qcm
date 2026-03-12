'use strict';

const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const SecurityID = require('../models/SecurityID');
const Employee = require('../models/Employee');

exports.issueID = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { employeeId, accessPoints, expiresAt } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Deactivate existing active IDs
    await SecurityID.updateMany(
      { employeeId, status: 'active' },
      { status: 'inactive' }
    );

    const cardNumber = `CARD-${uuidv4().toUpperCase().substring(0, 8)}`;
    const qrCode = uuidv4();

    const secId = await SecurityID.create({
      employeeId,
      cardNumber,
      qrCode,
      rfidCode: req.body.rfidCode,
      accessPoints: accessPoints || [],
      expiresAt: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      issuedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: secId });
  } catch (err) {
    next(err);
  }
};

exports.validateAccess = async (req, res, next) => {
  try {
    const { cardNumber, rfidCode, qrCode, accessPoint } = req.body;

    const query = {};
    if (cardNumber) query.cardNumber = cardNumber;
    else if (rfidCode) query.rfidCode = rfidCode;
    else if (qrCode) query.qrCode = qrCode;
    else return res.status(400).json({ success: false, message: 'Provide cardNumber, rfidCode, or qrCode' });

    const secId = await SecurityID.findOne(query).populate('employeeId', 'firstName lastName status');

    const logEntry = { timestamp: new Date(), point: accessPoint || 'unknown', result: 'denied' };

    if (!secId || secId.status !== 'active' || new Date() > secId.expiresAt) {
      if (secId) {
        secId.accessLog.push(logEntry);
        await secId.save();
      }
      return res.status(200).json({ success: true, data: { granted: false, reason: 'Invalid or expired card' } });
    }

    if (secId.employeeId.status !== 'Active') {
      logEntry.result = 'denied';
      secId.accessLog.push(logEntry);
      await secId.save();
      return res.status(200).json({ success: true, data: { granted: false, reason: 'Employee inactive' } });
    }

    const hasAccess = secId.accessPoints.length === 0 || secId.accessPoints.includes(accessPoint);
    logEntry.result = hasAccess ? 'granted' : 'denied';
    secId.accessLog.push(logEntry);
    await secId.save();

    res.json({
      success: true,
      data: {
        granted: hasAccess,
        employee: secId.employeeId,
        reason: hasAccess ? 'Access granted' : 'Access point not authorized',
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateIDStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const secId = await SecurityID.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!secId) return res.status(404).json({ success: false, message: 'Security ID not found' });
    res.json({ success: true, data: secId });
  } catch (err) {
    next(err);
  }
};

exports.replaceID = async (req, res, next) => {
  try {
    const old = await SecurityID.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Security ID not found' });

    old.status = req.body.reason === 'lost' ? 'lost' : 'stolen';
    await old.save();

    const cardNumber = `CARD-${uuidv4().toUpperCase().substring(0, 8)}`;
    const qrCode = uuidv4();

    const newId = await SecurityID.create({
      employeeId: old.employeeId,
      cardNumber,
      qrCode,
      accessPoints: old.accessPoints,
      expiresAt: old.expiresAt,
      issuedBy: req.user._id,
    });

    old.replacedBy = newId._id;
    old.replacedAt = new Date();
    await old.save();

    res.status(201).json({ success: true, data: newId });
  } catch (err) {
    next(err);
  }
};

exports.getIDs = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [ids, total] = await Promise.all([
      SecurityID.find(filter)
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('employeeId', 'firstName lastName employeeId'),
      SecurityID.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: ids,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const { period } = req.params;
    const days = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 365;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [total, active, expired, lost, stolen] = await Promise.all([
      SecurityID.countDocuments(),
      SecurityID.countDocuments({ status: 'active' }),
      SecurityID.countDocuments({ status: 'expired' }),
      SecurityID.countDocuments({ status: 'lost' }),
      SecurityID.countDocuments({ status: 'stolen' }),
    ]);

    // Count access events in period
    const recentIds = await SecurityID.find({ 'accessLog.timestamp': { $gte: since } });
    let granted = 0;
    let denied = 0;
    for (const id of recentIds) {
      for (const log of id.accessLog) {
        if (log.timestamp >= since) {
          if (log.result === 'granted') granted++;
          else denied++;
        }
      }
    }

    res.json({
      success: true,
      data: { period, total, active, expired, lost, stolen, accessEvents: { granted, denied }, since },
    });
  } catch (err) {
    next(err);
  }
};
