const Product = require('../models/Product');
const Category = require('../models/Category');
const { deleteFromCloudinary } = require('../config/cloudinary');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const {
      category, giftType, isFeatured, isTrending, isBestSeller,
      search, sortBy = 'createdAt', order = 'desc',
      page = 1, limit = 12, minPrice, maxPrice,
    } = req.query;

    const filter = { isVisible: true };
    if (category) filter.category = category;
    if (giftType) filter.giftType = giftType;
    if (isFeatured === 'true') filter.isFeatured = true;
    if (isTrending === 'true') filter.isTrending = true;
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (search) filter.$text = { $search: search };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortOpts = {};
    if (sortBy === 'price') sortOpts.price = order === 'asc' ? 1 : -1;
    else if (sortBy === 'popularity') sortOpts.numReviews = -1;
    else sortOpts[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sortOpts).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, data: products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product || !product.isVisible) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/products
const createProduct = async (req, res) => {
  try {
    const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));
    const body = typeof req.body.variants === 'string' ? { ...req.body, variants: JSON.parse(req.body.variants) } : req.body;
    const product = await Product.create({ ...body, images });
    await Category.findByIdAndUpdate(body.category, { $inc: { productCount: 1 } });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.publicId) await deleteFromCloudinary(img.publicId);
        }
      }
      // Set new images
      req.body.images = req.files.map(file => ({ url: file.path, publicId: file.filename }));
    }

    const body = typeof req.body.variants === 'string' ? { ...req.body, variants: JSON.parse(req.body.variants) } : req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    await Promise.all(product.images.map((img) => deleteFromCloudinary(img.publicId)));
    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
    await product.deleteOne();

    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/products/reorder
const reorderProducts = async (req, res) => {
  try {
    const { order } = req.body; // [{ id, sortOrder }]
    await Promise.all(order.map(({ id, sortOrder }) => Product.findByIdAndUpdate(id, { sortOrder })));
    res.json({ success: true, message: 'Products reordered.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/products/:id/toggle
const toggleProductVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    product.isVisible = !product.isVisible;
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/products (includes hidden)
const adminGetProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name').sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, reorderProducts, toggleProductVisibility, adminGetProducts };
