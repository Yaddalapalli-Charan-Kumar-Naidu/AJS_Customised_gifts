import Link from "next/link";
import { Gift, Camera, MessageCircle, Mail, Phone, MapPin, Heart } from "lucide-react";

const footerLinks = {
  "Shop": [
    { label: "Female Gifts", href: "/category/female-gifts" },
    { label: "Male Gifts", href: "/category/male-gifts" },
    { label: "Customized Hampers", href: "/category/customized-hampers" },
    { label: "Floral Bouquets", href: "/category/bouquets" },
    { label: "Birthday Gifts", href: "/category/birthday-gifts" },
    { label: "Anniversary Gifts", href: "/category/anniversary-gifts" },
  ],
  "Services": [
    { label: "Custom Hamper Request", href: "/hampers" },
    { label: "Order Tracking", href: "/order-tracking" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
  ],
  "Info": [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/#faq" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: "linear-gradient(135deg, #1a0a1a 0%, #2d1433 50%, #1a0a1a 100%)" }}
      className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)" }}>
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-xl text-white block">AJS Customized Gifts</span>
                <span className="font-script text-pink-300 text-sm">Turning Memories into Beautiful Gifts</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              Premium handcrafted gifts for every special occasion. From personalized hampers to luxury gift boxes — we make every moment unforgettable.
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:+919876543210" className="flex items-center gap-3 text-white/60 hover:text-pink-300 transition-colors text-sm">
                <Phone className="w-4 h-4 text-pink-400" />
                +91 98765 43210
              </a>
              <a href="mailto:hello@ajsgifts.com" className="flex items-center gap-3 text-white/60 hover:text-pink-300 transition-colors text-sm">
                <Mail className="w-4 h-4 text-pink-400" />
                hello@ajsgifts.com
              </a>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-pink-400" />
                Hyderabad, Telangana, India
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-semibold text-white mb-5 font-display">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-white/60 hover:text-pink-300 transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social & Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a href="https://instagram.com/ajscustomizedgifts" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-pink-400 hover:text-pink-400 transition-all text-white/60">
              <Camera className="w-4 h-4" />
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-green-400 hover:text-green-400 transition-all text-white/60">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="mailto:hello@ajsgifts.com"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-pink-400 hover:text-pink-400 transition-all text-white/60">
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-white/40 text-xs text-center">
            © {new Date().getFullYear()} AJS Customized Gifts. Made with{" "}
            <Heart className="w-3 h-3 text-pink-400 inline fill-pink-400" />{" "}
            in India.
          </p>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-green-400 border border-green-400/40 hover:bg-green-400/10 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp Us
          </a>
        </div>
      </div>
    </footer>
  );
}
