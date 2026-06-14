const Order = require('../models/Order');
const Product = require('../models/Product');
const QRCode = require('../models/QRCode');
const { sendEmail, orderConfirmationEmail, newOrderAdminEmail } = require('../utils/email');

// POST /api/orders — place order
const createOrder = async (req, res) => {
  try {
    const { customer, deliveryAddress, items, subtotal, deliveryCharge, total, specialInstructions, payment } = req.body;

    // Validate products exist
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isVisible || product.isOutOfStock) {
        return res.status(400).json({ success: false, message: `Product "${item.name}" is unavailable.` });
      }
    }

    // Get active QR code
    const activeQR = await QRCode.findOne({ isActive: true }).sort({ sortOrder: 1 });

    const order = await Order.create({
      customer,
      deliveryAddress,
      items,
      subtotal,
      deliveryCharge: deliveryCharge || 0,
      total,
      specialInstructions,
      payment: {
        ...payment,
        qrCodeUsed: activeQR?._id,
        method: 'QR',
      },
      status: 'pending_verification',
    });

    // Send emails
    await sendEmail(orderConfirmationEmail(order));
    await sendEmail(newOrderAdminEmail(order));

    res.status(201).json({ success: true, data: { orderId: order.orderId, _id: order._id, status: order.status } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/orders/:id/payment-screenshot — upload screenshot
const uploadPaymentScreenshot = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Screenshot required.' });

    order.payment.screenshotUrl = req.file.path;
    order.payment.screenshotPublicId = req.file.filename;
    if (req.body.utrNumber) order.payment.utrNumber = req.body.utrNumber;
    if (req.body.transactionId) order.payment.transactionId = req.body.transactionId;
    order.status = 'pending_verification';
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/track — public tracking
const trackOrder = async (req, res) => {
  try {
    const { orderId, phone } = req.query;
    if (!orderId || !phone) return res.status(400).json({ success: false, message: 'Order ID and phone required.' });

    const order = await Order.findOne({ orderId, 'customer.phone': phone })
      .select('orderId status customer.name createdAt items total trackingNumber');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found. Check your Order ID and phone number.' });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: GET /api/admin/orders
const adminGetOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data: orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: GET /api/admin/orders/:id
const adminGetOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images price');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: PATCH /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNote, trackingNumber } = req.body;
    const validStatuses = ['pending_payment', 'pending_verification', 'accepted', 'rejected', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    if (adminNote) order.adminNote = adminNote;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'accepted') {
      order.payment.verifiedAt = new Date();
      order.payment.verifiedBy = req.admin.name;
    }
    await order.save();

    // Notify customer
    if (['accepted', 'rejected', 'shipped', 'delivered'].includes(status)) {
      const statusMessages = {
        accepted: 'Your payment has been verified and order is confirmed! 🎉',
        rejected: 'Your payment could not be verified. Please contact us.',
        shipped: `Your order has been shipped! Tracking: ${trackingNumber || 'N/A'}`,
        delivered: 'Your order has been delivered! Thank you for shopping with AJS Gifts 💕',
      };
      await sendEmail({
        to: order.customer.email,
        subject: `Order #${order.orderId} Update — AJS Customized Gifts`,
        html: `<div style="font-family:sans-serif;padding:20px;max-width:600px;margin:0 auto;background:#FDF6EC;border-radius:12px;">
          <h2 style="color:#C9956A;">AJS Customized Gifts 🌸</h2>
          <p>Hi ${order.customer.name},</p>
          <p>${statusMessages[status]}</p>
          <p><strong>Order ID:</strong> #${order.orderId}</p>
          ${adminNote ? `<p><strong>Note:</strong> ${adminNote}</p>` : ''}
          <p><a href="${process.env.FRONTEND_URL}/order-tracking?id=${order.orderId}" style="background:#E8748A;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Track Order</a></p>
        </div>`,
      });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders, pendingVerification, acceptedOrders, shippedOrders,
      deliveredOrders, rejectedOrders, revenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending_verification' }),
      Order.countDocuments({ status: 'accepted' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'rejected' }),
      Order.aggregate([
        { $match: { status: { $in: ['accepted', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    // Sales by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const salesByMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $in: ['accepted', 'shipped', 'delivered'] } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Best sellers
    const bestSellers = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        orders: { total: totalOrders, pendingVerification, accepted: acceptedOrders, shipped: shippedOrders, delivered: deliveredOrders, rejected: rejectedOrders },
        revenue: revenue[0]?.total || 0,
        salesByMonth,
        bestSellers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, uploadPaymentScreenshot, trackOrder, adminGetOrders, adminGetOrder, updateOrderStatus, getDashboardStats };
