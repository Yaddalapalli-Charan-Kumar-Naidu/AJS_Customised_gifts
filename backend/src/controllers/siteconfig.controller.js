const SiteConfig = require('../models/SiteConfig');
const Testimonial = require('../models/Testimonial');
const GalleryImage = require('../models/GalleryImage');
const { deleteFromCloudinary } = require('../config/cloudinary');

const getSiteConfig = async (req, res) => {
  try {
    const configs = await SiteConfig.find();
    const configMap = {};
    configs.forEach((c) => { configMap[c.key] = c.value; });
    res.json({ success: true, data: configMap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSiteConfig = async (req, res) => {
  try {
    const updates = req.body;
    const ops = Object.entries(updates).map(([key, value]) =>
      SiteConfig.findOneAndUpdate({ key }, { value }, { upsert: true, new: true })
    );
    await Promise.all(ops);
    res.json({ success: true, message: 'Site config updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isVisible: true }).sort({ sortOrder: 1 });
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminGetTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ sortOrder: 1 });
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const avatar = req.file ? { url: req.file.path, publicId: req.file.filename } : undefined;
    const testimonial = await Testimonial.create({ ...req.body, avatar });
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Not found.' });
    if (req.file) {
      if (t.avatar?.publicId) await deleteFromCloudinary(t.avatar.publicId);
      req.body.avatar = { url: req.file.path, publicId: req.file.filename };
    }
    const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Not found.' });
    if (t.avatar?.publicId) await deleteFromCloudinary(t.avatar.publicId);
    await t.deleteOne();
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getGallery = async (req, res) => {
  try {
    const images = await GalleryImage.find({ isVisible: true }).sort({ sortOrder: 1 });
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addGalleryImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image required.' });
    const image = await GalleryImage.create({ url: req.file.path, publicId: req.file.filename, ...req.body });
    res.status(201).json({ success: true, data: image });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteGalleryImage = async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Not found.' });
    if (image.publicId) await deleteFromCloudinary(image.publicId);
    await image.deleteOne();
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSiteConfig, updateSiteConfig,
  getTestimonials, adminGetTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getGallery, addGalleryImage, deleteGalleryImage,
};
