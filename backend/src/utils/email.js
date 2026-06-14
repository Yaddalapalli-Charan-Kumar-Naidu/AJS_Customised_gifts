const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"AJS Customized Gifts" <noreply@ajsgifts.com>',
      to,
      subject,
      html,
      text,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { success: false, error: err.message };
  }
};

const orderConfirmationEmail = (order) => ({
  to: order.customer.email,
  subject: `🎁 Order Confirmed! #${order.orderId} — AJS Customized Gifts`,
  html: `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FDF6EC 0%, #FFE4F0 100%); padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C9956A; font-size: 28px; margin: 0;">AJS Customized Gifts 🌸</h1>
        <p style="color: #9B72CF; font-size: 14px; margin: 5px 0;">Turning Memories into Beautiful Gifts</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(200,150,180,0.15);">
        <h2 style="color: #E8748A; margin-top: 0;">Hello, ${order.customer.name}! 💕</h2>
        <p style="color: #555;">Your order has been placed successfully and is now <strong>pending payment verification</strong>.</p>
        <div style="background: #FDF6EC; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> <span style="color: #C9956A;">#${order.orderId}</span></p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.total}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #9B72CF;">Pending Verification</span></p>
        </div>
        <p style="color: #555;">We'll verify your payment and confirm your order shortly. You'll receive another email once verified!</p>
        <p style="color: #555;">Track your order at: <a href="${process.env.FRONTEND_URL}/order-tracking?id=${order.orderId}" style="color: #E8748A;">Track Order</a></p>
      </div>
      <p style="text-align: center; color: #C9956A; margin-top: 20px; font-size: 12px;">With love, Team AJS Customized Gifts 🎀</p>
    </div>
  `,
});

const hamperRequestEmail = (hamper) => ({
  to: process.env.ADMIN_EMAIL_RECIPIENT,
  subject: `🎁 New Hamper Request #${hamper.requestId} — AJS Gifts`,
  html: `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FDF6EC; padding: 30px; border-radius: 12px;">
      <h1 style="color: #C9956A;">New Hamper Request!</h1>
      <p><strong>Name:</strong> ${hamper.customerName}</p>
      <p><strong>Phone:</strong> ${hamper.phone}</p>
      <p><strong>Email:</strong> ${hamper.email}</p>
      <p><strong>Target Gender:</strong> <span style="text-transform: capitalize;">${hamper.targetGender || 'Not specified'}</span></p>
      <p><strong>Occasion:</strong> ${hamper.occasion}</p>
      <p><strong>Budget:</strong> ₹${hamper.budgetMin} - ₹${hamper.budgetMax}</p>
      
      <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #E8748A; margin-top: 0;">Selected Items:</h3>
        ${
          hamper.selectedProducts && hamper.selectedProducts.length > 0 
            ? `<ul style="margin: 0; padding-left: 20px;">
                 ${hamper.selectedProducts.map(p => `<li>${p.name || p}</li>`).join('')}
               </ul>`
            : '<p style="margin: 0; color: #777;">No specific items selected.</p>'
        }
      </div>

      <p><strong>Theme:</strong> ${hamper.preferredTheme || 'Not specified'}</p>
      <p><strong>Custom Requested Items:</strong> ${hamper.requiredItems || 'Not specified'}</p>
      <p><strong>Photo Frame Required:</strong> ${hamper.needsPhotoFrame ? 'Yes (Images Attached)' : 'No'}</p>
      <p><strong>Special Message:</strong> ${hamper.specialMessage || 'None'}</p>
      <p><strong>Delivery Address:</strong> ${hamper.deliveryAddress}</p>
      <p style="margin-top: 20px;"><a href="${process.env.FRONTEND_URL}/admin/hamper-requests" style="background: #E8748A; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">View in Dashboard</a></p>
    </div>
  `,
});

const newOrderAdminEmail = (order) => ({
  to: process.env.ADMIN_EMAIL_RECIPIENT,
  subject: `🛍️ New Order #${order.orderId} — Payment Verification Required`,
  html: `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FDF6EC; padding: 30px; border-radius: 12px;">
      <h1 style="color: #C9956A;">New Order Placed!</h1>
      <p><strong>Order ID:</strong> #${order.orderId}</p>
      <p><strong>Customer:</strong> ${order.customer.name}</p>
      <p><strong>Phone:</strong> ${order.customer.phone}</p>
      <p><strong>Email:</strong> ${order.customer.email}</p>
      <p><strong>Total:</strong> ₹${order.total}</p>
      <p><strong>UTR/Transaction ID:</strong> ${order.payment?.utrNumber || 'N/A'}</p>
      <p style="margin-top: 20px;"><a href="${process.env.FRONTEND_URL}/admin/orders" style="background: #E8748A; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Verify Payment</a></p>
    </div>
  `,
});

const bouquetRequestEmail = (bouquet) => ({
  to: process.env.ADMIN_EMAIL_RECIPIENT || 'ajscustomisedgifts@gmail.com',
  subject: `🌸 New Custom Bouquet Request from ${bouquet.customerName}`,
  html: `
    <div style="font-family:sans-serif;padding:20px;max-width:600px;margin:0 auto;background:#FDF6EC;border-radius:12px;">
      <h2 style="color:#C9956A;">AJS Customized Gifts 🌸</h2>
      <h3 style="color:#2d1433;">New Custom Bouquet Request Received!</h3>
      <div style="background:white;padding:20px;border-radius:8px;margin-top:20px;">
        <h4 style="margin-top:0;color:#E8748A;border-bottom:1px solid #eee;padding-bottom:10px;">Customer Details</h4>
        <p><strong>Name:</strong> ${bouquet.customerName}</p>
        <p><strong>Phone:</strong> ${bouquet.phone}</p>
        <p><strong>Email:</strong> ${bouquet.email}</p>
        <p><strong>Delivery Address:</strong> ${bouquet.deliveryAddress}</p>
        
        <h4 style="margin-top:20px;color:#E8748A;border-bottom:1px solid #eee;padding-bottom:10px;">Bouquet Details</h4>
        <p><strong>Colour:</strong> ${bouquet.colour}</p>
        <p><strong>Number of Flowers:</strong> ${bouquet.numberOfFlowers}</p>
        <p><strong>Type:</strong> ${bouquet.type}</p>
        <p><strong>Notes:</strong> ${bouquet.notes || 'None'}</p>
      </div>
      <p style="margin-top:20px;font-size:0.9em;color:#666;">Log in to the admin dashboard to manage this request.</p>
    </div>
  `
});

module.exports = {
  sendEmail,
  orderConfirmationEmail,
  newOrderAdminEmail,
  hamperRequestEmail,
  bouquetRequestEmail
};
