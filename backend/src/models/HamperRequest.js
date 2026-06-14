const mongoose = require('mongoose');

const hamperRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, unique: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    occasion: { type: String, required: true },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    targetGender: { type: String, enum: ['boys', 'girls', 'unisex'], required: true },
    selectedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    preferredTheme: String,
    preferredColors: String,
    requiredItems: String,
    specialMessage: String,
    needsPhotoFrame: { type: Boolean, default: false },
    frameImages: [{ url: String, publicId: String }],
    referenceImages: [{ url: String, publicId: String }],
    additionalNotes: String,
    status: {
      type: String,
      enum: ['new', 'reviewing', 'quoted', 'confirmed', 'completed', 'cancelled'],
      default: 'new',
    },
    adminNote: String,
    quotedAmount: Number,
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

hamperRequestSchema.pre('save', function () {
  if (!this.requestId) {
    this.requestId = 'HAMP' + Date.now().toString().slice(-6).toUpperCase();
  }
});

module.exports = mongoose.model('HamperRequest', hamperRequestSchema);
