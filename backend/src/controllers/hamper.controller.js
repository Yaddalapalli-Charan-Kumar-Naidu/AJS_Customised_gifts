const HamperRequest = require('../models/HamperRequest');
const { sendEmail, hamperRequestEmail } = require('../utils/email');

const createHamperRequest = async (req, res) => {
  try {
    const referenceImages = (req.files?.referenceImages || []).map((f) => ({ url: f.path, publicId: f.filename }));
    const frameImages = (req.files?.frameImages || []).map((f) => ({ url: f.path, publicId: f.filename }));
    let selectedProductsArray = [];
    if (req.body.selectedProducts) {
      try {
        selectedProductsArray = JSON.parse(req.body.selectedProducts);
      } catch (e) {
        selectedProductsArray = req.body.selectedProducts;
      }
    }

    const hamper = await HamperRequest.create({ 
      ...req.body, 
      referenceImages, 
      frameImages,
      selectedProducts: selectedProductsArray 
    });
    const populatedHamper = await HamperRequest.findById(hamper._id).populate('selectedProducts', 'name price images');
    
    await sendEmail(hamperRequestEmail(populatedHamper));
    populatedHamper.notificationSent = true;
    await populatedHamper.save();
    res.status(201).json({ success: true, data: { requestId: populatedHamper.requestId, _id: populatedHamper._id } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const adminGetHampers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      HamperRequest.find(filter).populate('selectedProducts', 'name price images').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      HamperRequest.countDocuments(filter),
    ]);
    res.json({ success: true, data: requests, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateHamperRequest = async (req, res) => {
  try {
    const hamper = await HamperRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hamper) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: hamper });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createHamperRequest, adminGetHampers, updateHamperRequest };
