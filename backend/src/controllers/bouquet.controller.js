const BouquetRequest = require('../models/BouquetRequest');
const { sendEmail, bouquetRequestEmail } = require('../utils/email');

// POST /api/bouquets
const createBouquetRequest = async (req, res) => {
  try {
    const request = await BouquetRequest.create(req.body);
    
    // Notify Admin asynchronously
    sendEmail(bouquetRequestEmail(request)).catch(console.error);

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/bouquets/admin/all
const adminGetBouquetRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      BouquetRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      BouquetRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/bouquets/admin/:id/status
const adminUpdateBouquetStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ['pending', 'contacted', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const request = await BouquetRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true, runValidators: true }
    );

    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { createBouquetRequest, adminGetBouquetRequests, adminUpdateBouquetStatus };
