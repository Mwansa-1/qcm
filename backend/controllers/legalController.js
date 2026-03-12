'use strict';

const crypto = require('crypto');
const { validationResult } = require('express-validator');
const LegalTemplate = require('../models/LegalTemplate');
const LegalDocument = require('../models/LegalDocument');

const hashContent = (content) =>
  crypto.createHash('sha256').update(content).digest('hex');

const resolveVariables = (content, variables) => {
  let resolved = content;
  for (const [key, value] of Object.entries(variables || {})) {
    resolved = resolved.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return resolved;
};

// ── Templates ─────────────────────────────────────────────────────────────────

exports.getTemplates = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    const templates = await LegalTemplate.find(filter)
      .sort({ name: 1 })
      .populate('createdBy', 'name');
    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const template = await LegalTemplate.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
};

// ── Documents ─────────────────────────────────────────────────────────────────

exports.createDocumentFromTemplate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { templateId, title, variables, signatories } = req.body;

    const template = await LegalTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const content = resolveVariables(template.content, variables);
    const hash = hashContent(content);

    const doc = await LegalDocument.create({
      title,
      content,
      variables,
      templateId,
      signatories: signatories || [],
      hash,
      versions: [{ version: 1, content, changedBy: req.user._id, changeNote: 'Initial creation' }],
      auditTrail: [{ action: 'created', performedBy: req.user._id }],
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [docs, total] = await Promise.all([
      LegalDocument.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content -versions')
        .populate('createdBy', 'name'),
      LegalDocument.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: docs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const doc = await LegalDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (doc.isLocked) return res.status(403).json({ success: false, message: 'Document is locked' });
    if (['signed', 'executed'].includes(doc.status)) {
      return res.status(400).json({ success: false, message: 'Cannot edit a signed or executed document' });
    }

    const { content, title, variables, changeNote } = req.body;
    const newContent = content || doc.content;
    const newHash = hashContent(newContent);

    doc.title = title || doc.title;
    doc.content = newContent;
    doc.variables = variables || doc.variables;
    doc.hash = newHash;
    doc.updatedBy = req.user._id;
    doc.versions.push({
      version: doc.versions.length + 1,
      content: newContent,
      changedBy: req.user._id,
      changeNote: changeNote || 'Updated',
    });
    doc.auditTrail.push({ action: 'updated', performedBy: req.user._id });

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.addSignatory = async (req, res, next) => {
  try {
    const doc = await LegalDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (doc.isLocked) return res.status(403).json({ success: false, message: 'Document is locked' });

    const { name, email, order } = req.body;
    doc.signatories.push({ name, email, order: order || doc.signatories.length });
    if (doc.status === 'draft') doc.status = 'pending';
    doc.auditTrail.push({ action: 'signatory_added', performedBy: req.user._id, details: email });

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.signDocument = async (req, res, next) => {
  try {
    const doc = await LegalDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (doc.isLocked) return res.status(403).json({ success: false, message: 'Document is locked' });
    if (doc.status === 'executed') {
      return res.status(400).json({ success: false, message: 'Document already executed' });
    }

    const { email, signature } = req.body;
    const signatory = doc.signatories.find((s) => s.email === email && s.status === 'pending');
    if (!signatory) {
      return res.status(400).json({ success: false, message: 'Signatory not found or already signed' });
    }

    signatory.signedAt = new Date();
    signatory.signature = signature;
    signatory.status = 'signed';
    signatory.ipAddress = req.ip;

    doc.auditTrail.push({ action: 'signed', performedBy: req.user._id, details: email, ipAddress: req.ip });

    const allSigned = doc.signatories.every((s) => s.status === 'signed');
    if (allSigned) doc.status = 'executed';

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.lockDocument = async (req, res, next) => {
  try {
    const doc = await LegalDocument.findByIdAndUpdate(
      req.params.id,
      { isLocked: true, lockedBy: req.user._id, lockedAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, message: 'Document locked', data: doc });
  } catch (err) {
    next(err);
  }
};

exports.unlockDocument = async (req, res, next) => {
  try {
    const doc = await LegalDocument.findByIdAndUpdate(
      req.params.id,
      { isLocked: false, lockedBy: null, lockedAt: null },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, message: 'Document unlocked', data: doc });
  } catch (err) {
    next(err);
  }
};

exports.getDocumentHistory = async (req, res, next) => {
  try {
    const doc = await LegalDocument.findById(req.params.id)
      .select('versions auditTrail title')
      .populate('versions.changedBy', 'name')
      .populate('auditTrail.performedBy', 'name');
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: { versions: doc.versions, auditTrail: doc.auditTrail } });
  } catch (err) {
    next(err);
  }
};

exports.getDocumentHash = async (req, res, next) => {
  try {
    const doc = await LegalDocument.findById(req.params.id).select('hash content title');
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    const computed = hashContent(doc.content);
    res.json({
      success: true,
      data: { stored: doc.hash, computed, isIntact: doc.hash === computed },
    });
  } catch (err) {
    next(err);
  }
};
