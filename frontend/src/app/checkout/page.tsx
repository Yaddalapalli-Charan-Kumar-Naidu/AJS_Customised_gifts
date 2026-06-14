"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/cartStore";
import { useSiteConfigStore } from "@/store/siteConfigStore";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  landmark: z.string().optional(),
  specialInstructions: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-pink-500 text-lg font-medium">Loading checkout...</div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get("buyNow");
  
  const { items, getSubtotal, clearCart } = useCartStore();
  const { config, fetchConfig } = useSiteConfigStore();
  const subtotal = getSubtotal();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  // Watch state for dynamic delivery calculation
  const selectedState = watch("state");
  
  const getDeliveryCharge = () => {
    const isFree = config.is_free_delivery_active && subtotal >= config.free_delivery_above;
    if (isFree) return 0;
    
    // Check for custom state rate
    if (selectedState && config.state_rates) {
      const customRate = config.state_rates.find(
        (s: any) => s.state.toLowerCase() === selectedState.toLowerCase()
      );
      if (customRate) return customRate.rate;
    }
    
    return config.delivery_charge || 0;
  };

  const deliveryCharge = getDeliveryCharge();
  const total = subtotal + deliveryCharge;

  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [activeQR, setActiveQR] = useState<any>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    fetchConfig();
    // If no items in cart and not buying a specific product, redirect to home
    if (items.length === 0 && !buyNowId) {
      toast.error("Your cart is empty");
      router.push("/");
    }
    
    // Fetch active QR code
    api.get("/qrcodes/active").then((res) => {
      if (res.data?.data?.length > 0) {
        setActiveQR(res.data.data[0]);
      }
    }).catch(() => {});
  }, [items, buyNowId, router]);

  const onSubmitDetails = async (data: CheckoutForm) => {
    setOrderData(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitOrder = async () => {
    if (!screenshot) {
      toast.error("Please upload the payment screenshot");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Order
      const orderPayload = {
        customer: { name: orderData.customerName, email: orderData.email, phone: orderData.phone },
        deliveryAddress: {
          street: orderData.street, city: orderData.city, state: orderData.state,
          pincode: orderData.pincode, landmark: orderData.landmark
        },
        items: items.map(item => ({
          product: item._id, name: item.name, image: item.image,
          price: item.discountPrice || item.price, quantity: item.quantity, variant: item.variant
        })),
        subtotal,
        deliveryCharge,
        total,
        specialInstructions: orderData.specialInstructions,
        payment: { method: activeQR?.paymentMethod || 'UPI' }
      };

      const orderRes = await api.post("/orders", orderPayload);
      const orderId = orderRes.data.data._id;

      // 2. Upload Screenshot
      const formData = new FormData();
      formData.append("screenshot", screenshot);
      if (utrNumber) formData.append("utrNumber", utrNumber);

      await api.post(`/orders/${orderId}/payment-screenshot`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 3. Complete
      clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3) {
    return (
      <main className="min-h-screen bg-cream flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-white/80 p-8 sm:p-12 rounded-3xl max-w-lg w-full text-center shadow-glass-lg"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully! 🎉</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Thank you for choosing AJS Gifts! Your payment is currently under verification. We've sent the order details to your email.
            </p>
            <div className="space-y-4">
              <Link href="/order-tracking">
                <button className="w-full btn-luxury py-3.5 rounded-full font-semibold">Track Your Order</button>
              </Link>
              <Link href="/">
                <button className="w-full bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 py-3.5 rounded-full font-semibold transition-colors">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />

      <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-pink-500 font-medium hover:text-pink-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">Secure Checkout</h1>
          
          {/* Stepper */}
          <div className="flex items-center gap-2 mt-6 max-w-md">
            <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-gradient-to-r from-pink-400 to-purple-400" : "bg-pink-100"}`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? "bg-gradient-to-r from-pink-400 to-purple-400" : "bg-pink-100"}`} />
          </div>
          <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2 max-w-md">
            <span className={step >= 1 ? "text-pink-600" : ""}>1. Details</span>
            <span className={step >= 2 ? "text-pink-600" : ""}>2. Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Form Area */}
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/60 backdrop-blur-md border border-pink-100 p-6 sm:p-8 rounded-3xl shadow-sm"
                >
                  <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-6">
                    {/* Contact Info */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">1</span>
                        Contact Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input {...register("customerName")} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                          {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input {...register("phone")} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input type="email" {...register("email")} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                      </div>
                    </div>

                    <hr className="border-pink-100" />

                    {/* Delivery Address */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">2</span>
                        Delivery Address
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                          <input {...register("street")} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                          {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input {...register("city")} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input {...register("state")} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                          <input {...register("pincode")} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                          {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                          <input {...register("landmark")} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Gift message, preferred delivery time, etc.)</label>
                          <textarea {...register("specialInstructions")} rows={3} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all resize-none" />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full btn-luxury py-4 text-base font-semibold mt-4">
                      Continue to Payment
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/60 backdrop-blur-md border border-pink-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">3</span>
                      Scan & Pay
                    </h2>
                    <button onClick={() => setStep(1)} className="text-sm text-pink-500 hover:underline">Edit Details</button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                    <div>
                      <p className="font-semibold mb-1">Important: No Cash on Delivery Available</p>
                      <p>Please scan the QR code to make the payment. After paying, upload the screenshot to complete your order. Your order will be processed after payment verification.</p>
                    </div>
                  </div>

                  {activeQR ? (
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
                        <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                          <Image src={activeQR.image?.url} alt="Payment QR Code" fill className="object-contain" />
                        </div>
                      </div>
                      <p className="font-semibold text-lg text-gray-800">{activeQR.name}</p>
                      {activeQR.upiId && <p className="text-gray-500 text-sm mt-1">UPI ID: {activeQR.upiId}</p>}
                      {activeQR.description && <p className="text-gray-500 text-xs mt-1 text-center max-w-xs">{activeQR.description}</p>}
                      <p className="mt-4 font-display text-2xl font-bold text-pink-600">Amount: {formatPrice(total)}</p>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                      <p className="text-gray-500">No payment methods available right now. Please contact support.</p>
                    </div>
                  )}

                  <hr className="border-pink-100 my-6" />

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Payment Proof Verification</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Screenshot *</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer border border-pink-200 rounded-xl p-2 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID / UTR (Optional)</label>
                        <input 
                          type="text" 
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. 123456789012"
                          className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-300 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={submitOrder} 
                    disabled={isSubmitting || !screenshot}
                    className={`w-full py-4 text-base font-bold rounded-full transition-all mt-6 ${
                      isSubmitting || !screenshot ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "btn-luxury"
                    }`}
                  >
                    {isSubmitting ? "Placing Order..." : "Confirm & Place Order"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white/80 backdrop-blur-md border border-pink-100 p-6 rounded-3xl shadow-sm sticky top-28">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-4">
                {items.map((item) => (
                  <div key={`${item._id}-${item.variant}`} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-pink-100">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-pink-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-800 truncate">{item.name}</h3>
                      {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>}
                      <p className="text-sm font-semibold text-pink-600 mt-1">{formatPrice((item.discountPrice || item.price) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-pink-100 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Delivery Charge</span>
                  <span className={deliveryCharge === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t border-pink-100">
                  <span>Total Amount</span>
                  <span className="text-pink-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
