const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    value: mongoose.Schema.Types.Mixed,
    group: {
      type: String,
      enum: ['hero', 'contact', 'social', 'announcement', 'gallery', 'footer', 'popup', 'general'],
      default: 'general',
    },
    label: String,
    type: { type: String, enum: ['text', 'image', 'boolean', 'array', 'object'], default: 'text' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
