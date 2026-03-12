'use strict';

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrg: { type: String },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  credentialId: { type: String },
});

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'PreferNotToSay'] },
    nationality: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    hireDate: { type: Date, required: true },
    terminationDate: { type: Date },
    salary: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'OnLeave', 'Terminated'],
      default: 'Active',
    },
    skills: [{ type: String, trim: true }],
    certifications: [certificationSchema],
    emergencyContacts: [emergencyContactSchema],
    documents: [documentSchema],
    profileImage: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ lastName: 1, firstName: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
