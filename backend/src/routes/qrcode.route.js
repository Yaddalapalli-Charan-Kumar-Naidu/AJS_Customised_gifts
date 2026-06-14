const express = require('express');
const router = express.Router();
const {
  getActiveQRCodes, adminGetQRCodes, createQRCode,
  updateQRCode, deleteQRCode, toggleQRCode
} = require('../controllers/qrcode.controller');
const { protect } = require('../middleware/auth');
const { createUploader } = require('../config/cloudinary');

const upload = createUploader('qr-codes');

router.get('/active', getActiveQRCodes);
router.get('/admin/all', protect, adminGetQRCodes);
router.post('/admin', protect, upload.single('image'), createQRCode);
router.put('/admin/:id', protect, upload.single('image'), updateQRCode);
router.delete('/admin/:id', protect, deleteQRCode);
router.patch('/admin/:id/toggle', protect, toggleQRCode);

module.exports = router;
