const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  name: String,
  options: [String],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null },
    images: [{ url: String, publicId: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [String],
    variants: [productVariantSchema],
    stock: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isOutOfStock: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    giftType: {
      type: String,
      enum: ['male', 'female', 'unisex', 'hamper'],
      default: 'unisex',
    },
    weight: Number,
    dimensions: { length: Number, width: Number, height: Number },
  },
  { timestamps: true }
);

productSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (this.stock === 0) this.isOutOfStock = true;
});

module.exports = mongoose.model('Product', productSchema);
