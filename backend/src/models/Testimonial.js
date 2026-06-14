const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: { url: String, publicId: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, required: true },
    occasion: String,
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    location: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
