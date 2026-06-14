"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useSiteConfigStore } from "@/store/siteConfigStore";
import { formatPrice } from "@/lib/utils";

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const { config } = useSiteConfigStore();
  const subtotal = getSubtotal();
  
  const isFree = config.is_free_delivery_active && subtotal >= config.free_delivery_above;
  const deliveryCharge = isFree ? 0 : (config.delivery_charge || 0);
  const total = subtotal + deliveryCharge;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl"
            style={{ background: "linear-gradient(180deg, #FDF6EC 0%, #FFE4F0 100%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-pink-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)" }}>
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-display text-lg font-bold text-gray-800">
                  My Cart <span className="text-pink-400 text-sm font-normal">({items.length})</span>
                </h2>
              </div>
              <button onClick={closeCart} className="p-2 rounded-full hover:bg-pink-100 transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="text-6xl mb-4">🎁</div>
                  <p className="font-display text-xl text-gray-700 mb-2">Your cart is empty</p>
                  <p className="text-gray-500 text-sm mb-6">Add some beautiful gifts to get started!</p>
                  <button onClick={closeCart}>
                    <Link href="/" className="btn-luxury px-6 py-3 text-sm">
                      Shop Now
                    </Link>
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={`${item._id}-${item.variant}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 bg-white/70 rounded-2xl p-4 border border-pink-100"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.image || "/placeholder-product.jpg"} alt={item.name}
                        fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm leading-tight truncate">{item.name}</h3>
                      {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-pink-600 font-bold text-sm">
                          {formatPrice(item.discountPrice || item.price)}
                        </span>
                        {item.discountPrice && (
                          <span className="text-gray-400 text-xs line-through">{formatPrice(item.price)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-pink-50 rounded-full px-3 py-1">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="text-pink-500 hover:text-pink-700 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold text-gray-700 w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="text-pink-500 hover:text-pink-700 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item._id)}
                          className="text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-pink-100 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={deliveryCharge === 0 ? "text-green-600 font-medium" : ""}>
                      {deliveryCharge === 0 ? "FREE 🎉" : formatPrice(deliveryCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-pink-100">
                    <span>Total</span>
                    <span className="text-pink-600">{formatPrice(total)}</span>
                  </div>
                  {config.is_free_delivery_active && subtotal < config.free_delivery_above && (
                    <p className="text-xs text-center text-gray-500">
                      Add {formatPrice(config.free_delivery_above - subtotal)} more for free delivery! 🚚
                    </p>
                  )}
                </div>
                <Link href="/checkout" onClick={closeCart}>
                  <button className="btn-luxury w-full py-4 text-sm font-semibold">
                    Proceed to Checkout →
                  </button>
                </Link>
                <button onClick={closeCart}
                  className="w-full py-3 text-sm text-pink-600 font-medium hover:underline">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
