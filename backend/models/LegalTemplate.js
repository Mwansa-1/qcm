'use strict';

const mongoose = require('mongoose');

const legalTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    variables: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, enum: ['text', 'date', 'number', 'boolean'], default: 'text' },
        required: { type: Boolean, default: false },
        defaultValue: { type: String },
      },
    ],
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

legalTemplateSchema.index({ category: 1 });
legalTemplateSchema.index({ isActive: 1 });

module.exports = mongoose.model('LegalTemplate', legalTemplateSchema);
