const express = require('express');
const router = express.Router();
const {
  getCategories, adminGetCategories, createCategory, updateCategory, deleteCategory
} = require('../controllers/category.controller');
const { protect } = require('../middleware/auth');
const { createUploader } = require('../config/cloudinary');

const upload = createUploader('categories');

router.get('/', getCategories);
router.get('/admin/all', protect, adminGetCategories);
router.post('/admin', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), createCategory);
router.put('/admin/:id', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateCategory);
router.delete('/admin/:id', protect, deleteCategory);

module.exports = router;
