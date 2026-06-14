"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, Heart, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useSiteConfigStore } from "@/store/siteConfigStore";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore();
  const { config, fetchConfig } = useSiteConfigStore();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    fetchConfig();
  }, [fetchConfig]);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const isFree = config.is_free_delivery_active && subtotal >= config.free_delivery_above;
  const deliveryCharge = isFree ? 0 : (config.delivery_charge || 0);
  const total = subtotal + deliveryCharge;

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <Navbar />

      <div className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-pink-500" /> My Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-12 text-center border border-pink-100 shadow-sm max-w-2xl mx-auto mt-10">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Your cart is feeling lonely</h2>
            <p className="text-gray-500 mb-8">Add some beautiful customized gifts to make someone's day special!</p>
            <Link href="/">
              <button className="btn-luxury px-8 py-3.5 rounded-full font-semibold">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cart Items */}
            <div className="w-full lg:w-2/3 space-y-4">
              {items.map((item, index) => {
                const wishlisted = isWishlisted(item._id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={`${item._id}-${item.variant}`} 
                    className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 shadow-sm"
                  >
                    <Link href={`/product/${item._id}`} className="block relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 border border-pink-50">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </Link>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-xs font-semibold text-pink-500 uppercase tracking-wider mb-1">{item.category}</p>
                          <Link href={`/product/${item._id}`}>
                            <h3 className="font-bold text-gray-900 hover:text-pink-600 transition-colors">{item.name}</h3>
                          </Link>
                          {item.variant && <p className="text-sm text-gray-500 mt-1">Variant: {item.variant}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">{formatPrice(item.discountPrice || item.price)}</p>
                          {item.discountPrice && <p className="text-sm text-gray-400 line-through">{formatPrice(item.price)}</p>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 sm:mt-0">
                        <div className="flex items-center bg-pink-50 border border-pink-100 rounded-full px-2 h-10">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-2 text-pink-500 hover:text-pink-700"><Minus className="w-4 h-4" /></button>
                          <span className="w-8 text-center font-semibold text-gray-800 text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-2 text-pink-500 hover:text-pink-700"><Plus className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { toggleWishlist(item._id); toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist! 💕"); }}
                            className={`p-2.5 rounded-full transition-colors border ${wishlisted ? "bg-pink-50 border-pink-200 text-pink-500" : "bg-white border-gray-200 text-gray-400 hover:text-pink-500"}`}
                          >
                            <Heart className={`w-4 h-4 ${wishlisted ? "fill-pink-500" : ""}`} />
                          </button>
                          <button 
                            onClick={() => removeItem(item._id)}
                            className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white/80 backdrop-blur-md border border-pink-100 rounded-3xl p-6 sm:p-8 shadow-sm sticky top-28">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className={`font-medium ${deliveryCharge === 0 ? "text-green-500" : "text-gray-900"}`}>
                      {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                    </span>
                  </div>
                  
                  {config.is_free_delivery_active && subtotal < config.free_delivery_above && (
                    <div className="bg-pink-50 text-pink-700 text-xs p-3 rounded-xl border border-pink-100 mt-4">
                      Add items worth {formatPrice(config.free_delivery_above - subtotal)} more to get FREE delivery! 🚚
                    </div>
                  )}

                  <hr className="border-pink-100 my-4" />
                  
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="font-bold text-transparent bg-clip-text" style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)", WebkitBackgroundClip: "text" }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Link href="/checkout">
                  <button className="w-full btn-luxury py-4 text-base font-bold rounded-full flex items-center justify-center gap-2">
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                
                <div className="mt-6 flex justify-center gap-4 text-gray-400">
                  <span className="text-xs flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure Payment</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
