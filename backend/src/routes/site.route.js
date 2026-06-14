const express = require('express');
const router = express.Router();
const {
  getSiteConfig, updateSiteConfig,
  getTestimonials, adminGetTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getGallery, addGalleryImage, deleteGalleryImage,
} = require('../controllers/siteconfig.controller');
const { protect } = require('../middleware/auth');
const { createUploader } = require('../config/cloudinary');

const avatarUpload = createUploader('testimonials');
const galleryUpload = createUploader('gallery');

// Site config
router.get('/config', getSiteConfig);
router.patch('/config', protect, updateSiteConfig);

// Testimonials
router.get('/testimonials', getTestimonials);
router.get('/testimonials/admin', protect, adminGetTestimonials);
router.post('/testimonials/admin', protect, avatarUpload.single('avatar'), createTestimonial);
router.put('/testimonials/admin/:id', protect, avatarUpload.single('avatar'), updateTestimonial);
router.delete('/testimonials/admin/:id', protect, deleteTestimonial);

// Gallery
router.get('/gallery', getGallery);
router.post('/gallery/admin', protect, galleryUpload.single('image'), addGalleryImage);
router.delete('/gallery/admin/:id', protect, deleteGalleryImage);

module.exports = router;
