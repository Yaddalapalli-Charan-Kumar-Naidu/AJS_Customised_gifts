const express = require('express');
const router = express.Router();
const {
  createBouquetRequest,
  adminGetBouquetRequests,
  adminUpdateBouquetStatus
} = require('../controllers/bouquet.controller');
const { protect } = require('../middleware/auth');

// Public
router.post('/', createBouquetRequest);

// Admin (protected)
router.get('/admin/all', protect, adminGetBouquetRequests);
router.patch('/admin/:id/status', protect, adminUpdateBouquetStatus);

module.exports = router;
