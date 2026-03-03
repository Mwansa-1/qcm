'use strict';

const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  total: { type: Number },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['sales', 'purchase'] },
    vendor: { type: String },
    customer: { type: String },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date },
    items: [invoiceItemSchema],
    subtotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    notes: { type: String },
    isLocked: { type: Boolean, default: false },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

invoiceSchema.pre('save', function (next) {
  let subtotal = 0;
  let taxTotal = 0;
  for (const item of this.items) {
    const lineTotal = item.quantity * item.unitPrice;
    const lineTax = lineTotal * (item.taxRate / 100);
    item.total = lineTotal + lineTax;
    subtotal += lineTotal;
    taxTotal += lineTax;
  }
  this.subtotal = subtotal;
  this.taxTotal = taxTotal;
  this.total = subtotal + taxTotal;
  next();
});

invoiceSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
