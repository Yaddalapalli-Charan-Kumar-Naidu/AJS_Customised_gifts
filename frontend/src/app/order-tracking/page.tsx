"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, CheckCircle2, Truck, XCircle, Clock, ShoppingBag } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";

const statuses = [
  { id: "pending_payment", icon: Clock, label: "Pending Payment", color: "text-amber-500", bg: "bg-amber-100" },
  { id: "pending_verification", icon: Clock, label: "Payment Verification", color: "text-amber-500", bg: "bg-amber-100" },
  { id: "accepted", icon: CheckCircle2, label: "Order Confirmed", color: "text-green-500", bg: "bg-green-100" },
  { id: "shipped", icon: Truck, label: "Shipped", color: "text-blue-500", bg: "bg-blue-100" },
  { id: "delivered", icon: Package, label: "Delivered", color: "text-purple-500", bg: "bg-purple-100" },
];

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-pink-500 text-lg font-medium">Loading...</div>
      </main>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const defaultOrderId = searchParams.get("id") || "";
  
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (defaultOrderId) {
      toast("Please enter your phone number to track order", { icon: "🔒" });
    }
  }, [defaultOrderId]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phone) {
      toast.error("Please enter both Order ID and Phone Number");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get(`/orders/track?orderId=${orderId}&phone=${phone}`);
      setOrder(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Order not found. Check details.");
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    if (status === "rejected" || status === "cancelled") return -1;
    return statuses.findIndex(s => s.id === status);
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <Navbar />

      <div className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Enter your Order ID and the phone number used during checkout to get real-time tracking updates.
          </p>
        </motion.div>

        {/* Search Form */}
        <div className="glass-card bg-white/60 p-6 sm:p-8 rounded-3xl mb-10 shadow-sm max-w-2xl mx-auto">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Order ID (e.g. AJS12345678)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-white border border-pink-200 rounded-full px-5 py-3.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all uppercase"
                required
              />
            </div>
            <div className="flex-1">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-pink-200 rounded-full px-5 py-3.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${
                isLoading ? "bg-pink-300 text-white cursor-not-allowed" : "btn-luxury"
              }`}
            >
              <Search className="w-4 h-4" />
              Track
            </button>
          </form>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {order && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-glass border border-pink-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 sm:p-8 border-b border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-pink-500 tracking-wider uppercase mb-1">Order Details</p>
                  <h2 className="font-display text-2xl font-bold text-gray-900">#{order.orderId}</h2>
                  <p className="text-gray-500 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-semibold text-gray-800">{order.customer.name}</p>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {order.status === "rejected" || order.status === "cancelled" ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <XCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Order {order.status === "rejected" ? "Rejected" : "Cancelled"}</h3>
                    <p className="text-gray-500">We could not verify your payment or process this order. Please contact support.</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Progress Bar Line */}
                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-pink-100 sm:left-auto sm:top-10 sm:bottom-auto sm:h-0.5 sm:w-full sm:right-10" />

                    <div className="flex flex-col sm:flex-row justify-between gap-8 relative z-10">
                      {statuses.map((status, index) => {
                        const currentIndex = getStatusIndex(order.status);
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const Icon = status.icon;

                        return (
                          <div key={status.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isCompleted 
                                ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md ring-4 ring-pink-50" 
                                : "bg-white border-2 border-pink-100 text-gray-300"
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="sm:text-center">
                              <p className={`font-semibold text-sm ${isCurrent ? "text-pink-600" : isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                                {status.label}
                              </p>
                              {isCurrent && index < 2 && <p className="text-xs text-gray-500 mt-1">We are verifying details</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="mt-10 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Tracking Number</p>
                      <p className="text-blue-600">{order.trackingNumber}</p>
                    </div>
                  </div>
                )}

                <div className="mt-10 border-t border-pink-100 pt-8">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-pink-500" /> Items in this Order
                  </h3>
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item._id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between items-center text-lg font-bold text-gray-900 pt-4 border-t border-dashed border-gray-200">
                    <span>Total Amount</span>
                    <span className="text-pink-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
}
