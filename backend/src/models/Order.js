const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, min: 1, required: true },
  variant: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: String,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment: {
      method: { type: String, default: 'QR' },
      qrCodeUsed: { type: mongoose.Schema.Types.ObjectId, ref: 'QRCode' },
      screenshotUrl: String,
      screenshotPublicId: String,
      transactionId: String,
      utrNumber: String,
      verifiedAt: Date,
      verifiedBy: String,
    },
    status: {
      type: String,
      enum: ['pending_payment', 'pending_verification', 'accepted', 'rejected', 'shipped', 'delivered', 'cancelled'],
      default: 'pending_payment',
    },
    adminNote: String,
    trackingNumber: String,
    specialInstructions: String,
  },
  { timestamps: true }
);

orderSchema.pre('save', function () {
  if (!this.orderId) {
    this.orderId = 'AJS' + Date.now().toString().slice(-8).toUpperCase();
  }
});

module.exports = mongoose.model('Order', orderSchema);
