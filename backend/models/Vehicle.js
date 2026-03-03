'use strict';

const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, required: true },
  description: { type: String },
  cost: { type: Number, min: 0 },
  mileage: { type: Number, min: 0 },
  workshop: { type: String },
  nextServiceDue: { type: Date },
});

const fuelRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  liters: { type: Number, required: true, min: 0 },
  cost: { type: Number, required: true, min: 0 },
  mileage: { type: Number, min: 0 },
  station: { type: String },
});

const accidentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  location: { type: String },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  damageEstimate: { type: Number, min: 0 },
  claimNumber: { type: String },
});

const assignmentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  assignedAt: { type: Date, default: Date.now },
  returnedAt: { type: Date },
  purpose: { type: String },
  mileageStart: { type: Number, min: 0 },
  mileageEnd: { type: Number, min: 0 },
});

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    color: { type: String },
    vin: { type: String, unique: true, sparse: true },
    discImage: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    assignments: [assignmentSchema],
    maintenanceRecords: [maintenanceRecordSchema],
    fuelRecords: [fuelRecordSchema],
    accidents: [accidentSchema],
    insurance: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
      coverageType: String,
    },
    roadTax: {
      expiryDate: Date,
      amount: Number,
    },
    healthScore: { type: Number, min: 0, max: 100, default: 100 },
    status: {
      type: String,
      enum: ['available', 'assigned', 'maintenance', 'retired'],
      default: 'available',
    },
    currentMileage: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

vehicleSchema.index({ status: 1 });
vehicleSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
