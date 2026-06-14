const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, reorderProducts, toggleProductVisibility, adminGetProducts
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth');
const { createUploader } = require('../config/cloudinary');

const upload = createUploader('products');

// Public
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin (protected)
router.get('/admin/all', protect, adminGetProducts);
router.post('/admin', protect, upload.array('images', 8), createProduct);
router.put('/admin/:id', protect, upload.array('images', 8), updateProduct);
router.delete('/admin/:id', protect, deleteProduct);
router.patch('/admin/reorder', protect, reorderProducts);
router.patch('/admin/:id/toggle', protect, toggleProductVisibility);

module.exports = router;
