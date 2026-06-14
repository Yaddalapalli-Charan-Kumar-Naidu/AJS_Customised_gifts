const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    caption: String,
    link: String,
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
