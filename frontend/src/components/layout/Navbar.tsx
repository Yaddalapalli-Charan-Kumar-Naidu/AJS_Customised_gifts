"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Search, Menu, X, Gift } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import CartSidebar from "@/components/cart/CartSidebar";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Female Gifts", href: "/category/female-gifts" },
  { label: "Male Gifts", href: "/category/male-gifts" },
  // { label: "Hampers", href: "/category/customized-hampers" },
  { label: "Bouquets", href: "/category/bouquets" },
  { label: "Customize Hamper", href: "/hampers" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { getCount, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const cartCount = getCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHeroPage = pathname === "/";

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled || !isHeroPage
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-pink-100"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #E8748A 0%, #9B72CF 100%)" }}>
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className={`font-display font-bold text-lg leading-tight block transition-colors ${scrolled || !isHeroPage ? "text-gray-900" : "text-white"
                  }`}>
                  AJS Gifts
                </span>
                <span className="font-script text-xs text-pink-400 leading-tight block">
                  Customized Gifts
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${pathname === link.href
                      ? "bg-pink-100 text-pink-600"
                      : scrolled || !isHeroPage
                        ? "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-colors ${scrolled || !isHeroPage ? "text-gray-700 hover:bg-pink-50" : "text-white/90 hover:bg-white/10"
                  }`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 rounded-full transition-colors"
                aria-label="Wishlist">
                <Heart className={`w-5 h-5 ${scrolled || !isHeroPage ? "text-gray-700" : "text-white/90"}`} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 rounded-full transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className={`w-5 h-5 ${scrolled || !isHeroPage ? "text-gray-700" : "text-white/90"}`} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)" }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`md:hidden p-2 rounded-full ${scrolled || !isHeroPage ? "text-gray-700" : "text-white"}`}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-4"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for gifts, hampers, occasions..."
                    autoFocus
                    className="flex-1 px-4 py-2.5 rounded-full border border-pink-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  />
                  <button type="submit" className="px-6 py-2.5 rounded-full text-white text-sm font-medium"
                    style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)" }}>
                    Search
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-md border-t border-pink-100"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === link.href ? "bg-pink-100 text-pink-600" : "text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <CartSidebar />
    </>
  );
}
