'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const archiver = require('archiver');
const schedule = require('node-schedule');
const CryptoJS = require('crypto-js');
const Backup = require('../models/Backup');

const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || 'backups');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const computeHash = (filePath) => {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    stream.on('data', (d) => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

const collectData = async (scope) => {
  const mongoose = require('mongoose');
  const models = {
    employees: () => mongoose.model('Employee').find(),
    financial: async () => ({
      accounts: await mongoose.model('ChartOfAccount').find(),
      entries: await mongoose.model('JournalEntry').find(),
      invoices: await mongoose.model('Invoice').find(),
    }),
    legal: async () => ({
      templates: await mongoose.model('LegalTemplate').find(),
      documents: await mongoose.model('LegalDocument').find(),
    }),
    security: () => mongoose.model('SecurityID').find(),
    vehicles: () => mongoose.model('Vehicle').find(),
    medical: () => mongoose.model('MedicalRecord').find(),
    environmental: () => mongoose.model('EnvironmentalInspection').find(),
    performance: () => mongoose.model('PerformanceReview').find(),
  };

  const data = {};
  const targets = scope.includes('all') ? Object.keys(models) : scope;
  for (const t of targets) {
    if (models[t]) data[t] = await models[t]();
  }
  return data;
};

const scheduleJobs = new Map();

exports.createBackup = async (req, res, next) => {
  try {
    const { name, scope = ['all'], isEncrypted = false, isCompressed = true, retentionDays = 30 } = req.body;

    ensureDir(BACKUP_DIR);

    const backup = await Backup.create({
      name,
      scope,
      status: 'running',
      isEncrypted,
      isCompressed,
      compressionType: isCompressed ? 'zip' : 'none',
      retentionDays,
      startedAt: new Date(),
      createdBy: req.user._id,
    });

    // Run backup asynchronously
    setImmediate(async () => {
      try {
        const data = await collectData(scope);
        const jsonData = JSON.stringify(data, null, 2);
        const timestamp = Date.now();
        const fileName = `backup-${timestamp}.zip`;
        const filePath = path.join(BACKUP_DIR, fileName);

        await new Promise((resolve, reject) => {
          const output = fs.createWriteStream(filePath);
          const archive = archiver('zip', { zlib: { level: 9 } });
          output.on('close', resolve);
          archive.on('error', reject);
          archive.pipe(output);
          archive.append(jsonData, { name: 'data.json' });
          archive.finalize();
        });

        let finalPath = filePath;
        if (isEncrypted) {
        if (!process.env.BACKUP_ENCRYPTION_KEY) {
          throw new Error('BACKUP_ENCRYPTION_KEY environment variable is required for encrypted backups');
        }
        const key = process.env.BACKUP_ENCRYPTION_KEY;
          const encrypted = CryptoJS.AES.encrypt(fs.readFileSync(filePath).toString('base64'), key).toString();
          const encPath = filePath.replace('.zip', '.enc');
          fs.writeFileSync(encPath, encrypted);
          fs.unlinkSync(filePath);
          finalPath = encPath;
        }

        const stats = fs.statSync(finalPath);
        const integrity = await computeHash(finalPath);

        await Backup.findByIdAndUpdate(backup._id, {
          status: 'completed',
          filePath: finalPath,
          fileSize: stats.size,
          integrity,
          completedAt: new Date(),
        });
      } catch (err) {
        await Backup.findByIdAndUpdate(backup._id, { status: 'failed', error: err.message });
      }
    });

    res.status(202).json({ success: true, message: 'Backup started', data: { _id: backup._id } });
  } catch (err) {
    next(err);
  }
};

exports.scheduleBackup = async (req, res, next) => {
  try {
    const { name, scope = ['all'], cronExpression, retentionDays = 30 } = req.body;

    const backup = await Backup.create({
      name,
      scope,
      status: 'pending',
      isScheduled: true,
      scheduleExpression: cronExpression,
      scheduledAt: new Date(),
      retentionDays,
      createdBy: req.user._id,
    });

    const job = schedule.scheduleJob(cronExpression, async () => {
      const mongoose = require('mongoose');
      ensureDir(BACKUP_DIR);
      try {
        const data = await collectData(scope);
        const jsonData = JSON.stringify(data, null, 2);
        const timestamp = Date.now();
        const filePath = path.join(BACKUP_DIR, `scheduled-${timestamp}.zip`);
        await new Promise((resolve, reject) => {
          const output = fs.createWriteStream(filePath);
          const archive = archiver('zip', { zlib: { level: 9 } });
          output.on('close', resolve);
          archive.on('error', reject);
          archive.pipe(output);
          archive.append(jsonData, { name: 'data.json' });
          archive.finalize();
        });
        const stats = fs.statSync(filePath);
        const integrity = await computeHash(filePath);
        await Backup.findByIdAndUpdate(backup._id, {
          status: 'completed',
          filePath,
          fileSize: stats.size,
          integrity,
          completedAt: new Date(),
        });
      } catch (err) {
        await Backup.findByIdAndUpdate(backup._id, { status: 'failed', error: err.message });
      }
    });

    scheduleJobs.set(backup._id.toString(), job);
    res.status(201).json({ success: true, data: backup });
  } catch (err) {
    next(err);
  }
};

exports.restoreBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found' });
    if (backup.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Backup is not in completed state' });
    }
    if (!fs.existsSync(backup.filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found on disk' });
    }

    // Verify integrity
    const currentHash = await computeHash(backup.filePath);
    if (backup.integrity && currentHash !== backup.integrity) {
      return res.status(400).json({ success: false, message: 'Backup integrity check failed' });
    }

    res.json({ success: true, message: 'Restore initiated (implementation depends on deployment)', data: { backupId: backup._id } });
  } catch (err) {
    next(err);
  }
};

exports.downloadBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found' });
    if (backup.status !== 'completed' || !backup.filePath) {
      return res.status(400).json({ success: false, message: 'Backup not available for download' });
    }
    if (!fs.existsSync(backup.filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    res.download(backup.filePath, path.basename(backup.filePath));
  } catch (err) {
    next(err);
  }
};

exports.getBackupStatus = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id).populate('createdBy', 'name');
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found' });
    res.json({ success: true, data: backup });
  } catch (err) {
    next(err);
  }
};

exports.listBackups = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [backups, total] = await Promise.all([
      Backup.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name'),
      Backup.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: backups,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found' });

    if (backup.filePath && fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
    }

    const job = scheduleJobs.get(req.params.id);
    if (job) {
      job.cancel();
      scheduleJobs.delete(req.params.id);
    }

    await Backup.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Backup deleted' });
  } catch (err) {
    next(err);
  }
};

exports.cleanupBackups = async (req, res, next) => {
  try {
    const now = new Date();
    const expired = await Backup.find({ status: 'completed', completedAt: { $exists: true } });
    let deleted = 0;

    for (const b of expired) {
      const expiryDate = new Date(b.completedAt.getTime() + b.retentionDays * 24 * 60 * 60 * 1000);
      if (expiryDate < now) {
        if (b.filePath && fs.existsSync(b.filePath)) {
          fs.unlinkSync(b.filePath);
        }
        await Backup.findByIdAndDelete(b._id);
        deleted++;
      }
    }

    res.json({ success: true, message: `Cleaned up ${deleted} expired backups` });
  } catch (err) {
    next(err);
  }
};
