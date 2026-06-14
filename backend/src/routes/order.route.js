const express = require('express');
const router = express.Router();
const {
  createOrder, uploadPaymentScreenshot, trackOrder,
  adminGetOrders, adminGetOrder, updateOrderStatus, getDashboardStats
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth');
const { createUploader } = require('../config/cloudinary');

const screenshotUpload = createUploader('payment-screenshots');

// Public
router.post('/', createOrder);
router.post('/:id/payment-screenshot', screenshotUpload.single('screenshot'), uploadPaymentScreenshot);
router.get('/track', trackOrder);

// Admin
router.get('/admin/dashboard', protect, getDashboardStats);
router.get('/admin/all', protect, adminGetOrders);
router.get('/admin/:id', protect, adminGetOrder);
router.patch('/admin/:id/status', protect, updateOrderStatus);

module.exports = router;
