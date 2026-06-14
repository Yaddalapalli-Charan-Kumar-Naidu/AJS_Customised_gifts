require('dotenv').config();
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Testimonial = require('../models/Testimonial');
const SiteConfig = require('../models/SiteConfig');
const QRCode = require('../models/QRCode');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Admin
  const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existingAdmin) {
    await Admin.create({
      name: 'AJS Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'superadmin',
    });
    console.log('✅ Admin created:', process.env.ADMIN_EMAIL);
  } else {
    console.log('ℹ️  Admin already exists.');
  }

  // Categories
  const categories = [
    { name: 'Female Gifts', slug: 'female-gifts', giftType: 'female', description: 'Elegant gifts curated for her', sortOrder: 1, isVisible: true, banner: { url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200' }, image: { url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800' } },
    { name: 'Male Gifts', slug: 'male-gifts', giftType: 'male', description: 'Thoughtful gifts for him', sortOrder: 2, isVisible: true, banner: { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200' }, image: { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800' } },
    { name: 'Customized Hampers', slug: 'customized-hampers', giftType: 'hamper', description: 'Personalized gift hampers for every occasion', sortOrder: 3, isVisible: true, banner: { url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1200' }, image: { url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800' } },
    { name: 'Floral Bouquets', slug: 'bouquets', giftType: 'all', description: 'Beautiful handcrafted bouquets', sortOrder: 4, isVisible: true, banner: { url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200' }, image: { url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800' } },
  ];

  // Remove categories not in the current list
  const activeSlugs = categories.map(c => c.slug);
  await Category.deleteMany({ slug: { $nin: activeSlugs } });

  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
  }
  console.log('✅ Categories seeded (and old ones removed).');

  // Sample products
  const femaleCat = await Category.findOne({ slug: 'female-gifts' });
  const maleCat = await Category.findOne({ slug: 'male-gifts' });
  const hamperCat = await Category.findOne({ slug: 'customized-hampers' });

  const sampleProducts = [
    { name: 'Rose Gold Jewelry Box', description: 'Elegant rose gold jewelry box with velvet interior. Perfect for storing precious memories.', price: 1299, discountPrice: 999, category: femaleCat._id, giftType: 'female', isFeatured: true, isBestSeller: true, stock: 50, images: [{ url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', publicId: 'demo1' }] },
    { name: 'Luxury Skincare Hamper', description: 'Premium skincare collection with rose water, vitamin C serum, and luxury moisturizer.', price: 2499, discountPrice: 1999, category: femaleCat._id, giftType: 'female', isFeatured: true, isTrending: true, stock: 30, images: [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500', publicId: 'demo2' }] },
    { name: 'Personalized Photo Frame', description: 'Custom photo frame with your special message engraved. A memory that lasts forever.', price: 799, category: femaleCat._id, giftType: 'unisex', isTrending: true, stock: 100, images: [{ url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500', publicId: 'demo3' }] },
    { name: 'Gourmet Chocolate Box', description: 'Hand-crafted Belgian chocolates in an elegant box, perfect for every celebration.', price: 1499, discountPrice: 1199, category: hamperCat._id, giftType: 'hamper', isBestSeller: true, stock: 40, images: [{ url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', publicId: 'demo4' }] },
    { name: 'Men\'s Grooming Kit', description: 'Premium grooming kit with beard oil, face wash, and luxury aftershave for the modern man.', price: 1899, discountPrice: 1499, category: maleCat._id, giftType: 'male', isFeatured: true, stock: 35, images: [{ url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500', publicId: 'demo5' }] },
    { name: 'Scented Candle Collection', description: 'Set of 3 luxury scented candles — Rose, Lavender & Vanilla. Create the perfect ambiance.', price: 1199, category: femaleCat._id, giftType: 'female', isTrending: true, stock: 60, images: [{ url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500', publicId: 'demo6' }] },
  ];

  for (const p of sampleProducts) {
    const exists = await Product.findOne({ name: p.name });
    if (!exists) await Product.create(p);
  }
  console.log('✅ Sample products seeded.');

  // Testimonials
  const testimonials = [
    { name: 'Priya Sharma', rating: 5, review: 'Absolutely loved my customized hamper! The packaging was so beautiful and the quality exceeded my expectations. Will definitely order again! 💕', occasion: 'Birthday Gift', location: 'Mumbai', isVisible: true, sortOrder: 1 },
    { name: 'Ananya Reddy', rating: 5, review: 'Ordered a personalized jewelry box for my best friend and she was in tears! AJS Gifts truly makes every gift feel magical. 🌸', occasion: 'Friendship Day', location: 'Hyderabad', isVisible: true, sortOrder: 2 },
    { name: 'Kavya Nair', rating: 5, review: 'The delivery was super fast and the packaging is Instagram-worthy! My sister loved her anniversary hamper. Highly recommend! ✨', occasion: 'Anniversary', location: 'Bangalore', isVisible: true, sortOrder: 3 },
    { name: 'Shreya Patel', rating: 4, review: 'Such a premium gifting experience! The attention to detail in every product is remarkable. Will keep coming back for all my gifting needs.', occasion: 'Valentine\'s Day', location: 'Ahmedabad', isVisible: true, sortOrder: 4 },
  ];

  for (const t of testimonials) {
    const exists = await Testimonial.findOne({ name: t.name });
    if (!exists) await Testimonial.create(t);
  }
  console.log('✅ Testimonials seeded.');

  // Site Config
  const configs = [
    { key: 'hero_title', value: 'Turning Memories into', group: 'hero', label: 'Hero Title', type: 'text' },
    { key: 'hero_subtitle', value: 'Beautiful Gifts', group: 'hero', label: 'Hero Subtitle', type: 'text' },
    { key: 'hero_tagline', value: 'Premium customized gifts for every special moment in life', group: 'hero', label: 'Hero Tagline', type: 'text' },
    { key: 'contact_phone', value: '+91 98765 43210', group: 'contact', label: 'Phone', type: 'text' },
    { key: 'contact_email', value: 'hello@ajsgifts.com', group: 'contact', label: 'Email', type: 'text' },
    { key: 'contact_whatsapp', value: '+919876543210', group: 'contact', label: 'WhatsApp', type: 'text' },
    { key: 'contact_address', value: 'Hyderabad, Telangana, India', group: 'contact', label: 'Address', type: 'text' },
    { key: 'social_instagram', value: 'https://instagram.com/ajscustomizedgifts', group: 'social', label: 'Instagram URL', type: 'text' },
    { key: 'social_whatsapp', value: 'https://wa.me/919876543210', group: 'social', label: 'WhatsApp URL', type: 'text' },
    { key: 'announcement_text', value: '🎁 Free delivery on orders above ₹999! Use code: AJSLOVE', group: 'announcement', label: 'Announcement Bar', type: 'text' },
    { key: 'announcement_active', value: true, group: 'announcement', label: 'Show Announcement', type: 'boolean' },
    { key: 'delivery_charge', value: 99, group: 'general', label: 'Delivery Charge (₹)', type: 'text' },
    { key: 'free_delivery_above', value: 999, group: 'general', label: 'Free Delivery Above (₹)', type: 'text' },
  ];

  for (const c of configs) {
    await SiteConfig.findOneAndUpdate({ key: c.key }, c, { upsert: true });
  }
  console.log('✅ Site config seeded.');

  // Sample QR Code (placeholder)
  const existingQR = await QRCode.findOne({ paymentMethod: 'upi' });
  if (!existingQR) {
    await QRCode.create({
      name: 'UPI Payment',
      paymentMethod: 'upi',
      upiId: 'ajsgifts@upi',
      isActive: true,
      sortOrder: 1,
      description: 'Pay via any UPI app',
      image: { url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=ajsgifts@upi&pn=AJSGifts&cu=INR', publicId: 'demo-qr' },
    });
    console.log('✅ Sample QR code seeded.');
  }

  console.log('\n✨ Database seeded successfully!');
  console.log(`🔑 Admin Login: ${process.env.ADMIN_EMAIL || 'admin@ajsgifts.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
