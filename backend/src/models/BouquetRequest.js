const mongoose = require('mongoose');

const bouquetRequestSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    deliveryAddress: { type: String, required: true },

    colour: { type: String, required: true },
    numberOfFlowers: { type: Number, required: true },
    type: { type: String, enum: ['fuzzywire', 'ribbon'], required: true },
    
    notes: { type: String },

    status: {
      type: String,
      enum: ['pending', 'contacted', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    adminNote: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BouquetRequest', bouquetRequestSchema);
