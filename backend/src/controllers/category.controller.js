const Category = require('../models/Category');
const { deleteFromCloudinary } = require('../config/cloudinary');

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isVisible: true }).sort({ sortOrder: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/categories (all)
const adminGetCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/categories
const createCategory = async (req, res) => {
  try {
    const banner = req.files?.banner ? { url: req.files.banner[0].path, publicId: req.files.banner[0].filename } : undefined;
    const image = req.files?.image ? { url: req.files.image[0].path, publicId: req.files.image[0].filename } : undefined;
    const category = await Category.create({ ...req.body, banner, image });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    if (req.files?.banner) {
      if (category.banner?.publicId) await deleteFromCloudinary(category.banner.publicId);
      req.body.banner = { url: req.files.banner[0].path, publicId: req.files.banner[0].filename };
    }
    
    if (req.files?.image) {
      if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
      req.body.image = { url: req.files.image[0].path, publicId: req.files.image[0].filename };
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    if (category.banner?.publicId) await deleteFromCloudinary(category.banner.publicId);
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCategories, adminGetCategories, createCategory, updateCategory, deleteCategory };
