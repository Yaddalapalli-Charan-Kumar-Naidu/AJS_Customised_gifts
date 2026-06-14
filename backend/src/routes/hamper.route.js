const express = require('express');
const router = express.Router();
const { createHamperRequest, adminGetHampers, updateHamperRequest } = require('../controllers/hamper.controller');
const { protect } = require('../middleware/auth');
const { createUploader } = require('../config/cloudinary');

const upload = createUploader('hamper-references');

router.post('/', upload.fields([
  { name: 'referenceImages', maxCount: 5 },
  { name: 'frameImages', maxCount: 5 }
]), createHamperRequest);
router.get('/admin/all', protect, adminGetHampers);
router.patch('/admin/:id', protect, updateHamperRequest);

module.exports = router;
