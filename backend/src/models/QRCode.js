const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Google Pay", "PhonePe"
    paymentMethod: {
      type: String,
      enum: ['upi', 'phonepe', 'googlepay', 'paytm', 'other'],
      required: true,
    },
    image: { url: String, publicId: String },
    upiId: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('QRCode', qrCodeSchema);
