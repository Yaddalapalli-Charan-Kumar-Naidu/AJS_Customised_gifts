const QRCode = require('../models/QRCode');
const { deleteFromCloudinary } = require('../config/cloudinary');

const getActiveQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json({ success: true, data: qrCodes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminGetQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find().sort({ sortOrder: 1 });
    res.json({ success: true, data: qrCodes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createQRCode = async (req, res) => {
  try {
    const image = req.file ? { url: req.file.path, publicId: req.file.filename } : undefined;
    const qr = await QRCode.create({ ...req.body, image });
    res.status(201).json({ success: true, data: qr });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateQRCode = async (req, res) => {
  try {
    const qr = await QRCode.findById(req.params.id);
    if (!qr) return res.status(404).json({ success: false, message: 'QR code not found.' });
    if (req.file) {
      if (qr.image?.publicId) await deleteFromCloudinary(qr.image.publicId);
      req.body.image = { url: req.file.path, publicId: req.file.filename };
    }
    const updated = await QRCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteQRCode = async (req, res) => {
  try {
    const qr = await QRCode.findById(req.params.id);
    if (!qr) return res.status(404).json({ success: false, message: 'QR code not found.' });
    if (qr.image?.publicId) await deleteFromCloudinary(qr.image.publicId);
    await qr.deleteOne();
    res.json({ success: true, message: 'QR code deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleQRCode = async (req, res) => {
  try {
    const qr = await QRCode.findById(req.params.id);
    if (!qr) return res.status(404).json({ success: false, message: 'Not found.' });
    qr.isActive = !qr.isActive;
    await qr.save();
    res.json({ success: true, data: qr });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getActiveQRCodes, adminGetQRCodes, createQRCode, updateQRCode, deleteQRCode, toggleQRCode };
