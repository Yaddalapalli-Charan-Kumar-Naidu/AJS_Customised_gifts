"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, ChevronRight, Gift, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";

const bouquetSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  colour: z.string().min(2, "Colour is required"),
  numberOfFlowers: z.number().min(1, "Must have at least 1 flower"),
  type: z.enum(["fuzzywire", "ribbon"] as const, {
    message: "Please select a valid type",
  }),
  notes: z.string().optional(),
});

type BouquetForm = z.infer<typeof bouquetSchema>;

export default function CustomBouquetPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<BouquetForm>({
    resolver: zodResolver(bouquetSchema) as any,
  });

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ["customerName", "phone", "email", "deliveryAddress"] 
      : ["colour", "numberOfFlowers", "type"];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: BouquetForm) => {
    setIsSubmitting(true);
    try {
      await api.post("/bouquets", data);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-cream flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-white/80 p-8 sm:p-12 rounded-3xl max-w-lg w-full text-center shadow-glass-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />

            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
              style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)" }}>
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2 relative z-10">Request Received! 🌸</h1>
            <p className="text-gray-600 mb-8 leading-relaxed relative z-10">
              We've received your customized bouquet request. Our design team will review your requirements and get back to you soon.
            </p>
            <div className="space-y-4 relative z-10">
              <a href="/" className="block">
                <button className="w-full btn-outline-luxury py-3.5 rounded-full font-semibold">
                  Back to Home
                </button>
              </a>
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

      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-pink-50 to-cream overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-pink-200 rounded-full px-4 py-1.5 text-sm text-pink-600 font-medium mb-4">
              <Sparkles className="w-4 h-4" /> Customized For You
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Design Your Dream <br/><span className="text-transparent bg-clip-text" style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)", WebkitBackgroundClip: "text" }}>Bouquet</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose your colors, count, and style. We will craft a beautiful custom bouquet just for you.
            </p>
          </motion.div>

          <div className="bg-white/70 backdrop-blur-md border border-pink-100 rounded-3xl p-6 sm:p-10 shadow-glass">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-pink-100 relative">
              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-500" 
                style={{ width: `${((step - 1) / 1) * 100}%` }} />
              
              {[1, 2].map((num) => (
                <div key={num} className={`flex flex-col items-center gap-2 ${step >= num ? "text-pink-600" : "text-gray-400"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= num ? "bg-pink-100 ring-2 ring-pink-500 ring-offset-2" : "bg-gray-100"
                  }`}>
                    {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider hidden sm:block">
                    {num === 1 ? "Contact" : "Requirements"}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                        <input {...register("customerName")} placeholder="e.g. Priya Sharma" className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                        {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                        <input {...register("phone")} placeholder="e.g. 9876543210" className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                        <input type="email" {...register("email")} placeholder="e.g. priya@example.com" className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                        <textarea {...register("deliveryAddress")} rows={3} placeholder="Full address with pincode" className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all resize-none" />
                        {errors.deliveryAddress && <p className="text-red-500 text-xs mt-1">{errors.deliveryAddress.message}</p>}
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button type="button" onClick={nextStep} className="btn-luxury px-8 py-3.5 flex items-center gap-2">
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Bouquet Requirements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Colour *</label>
                        <input {...register("colour")} placeholder="e.g. Red, Pink, Pastel" className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                        {errors.colour && <p className="text-red-500 text-xs mt-1">{errors.colour.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Flowers *</label>
                        <input type="number" {...register("numberOfFlowers")} placeholder="e.g. 12" className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                        {errors.numberOfFlowers && <p className="text-red-500 text-xs mt-1">{errors.numberOfFlowers.message}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                        <select {...register("type")} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all text-gray-700">
                          <option value="">Select a type</option>
                          <option value="fuzzywire">Fuzzywire</option>
                          <option value="ribbon">Ribbon</option>
                        </select>
                        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                        <textarea {...register("notes")} rows={3} placeholder="Any specific wrapping styles or instructions..." className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all resize-none" />
                      </div>
                    </div>
                    
                    <div className="pt-6 flex flex-col sm:flex-row justify-between gap-4">
                      <button type="button" onClick={() => setStep(1)} className="btn-outline-luxury px-6 py-4 w-full sm:w-auto text-center">Back</button>
                      <button type="submit" disabled={isSubmitting} className={`w-full sm:w-auto py-4 px-8 text-base font-bold rounded-full transition-all ${
                        isSubmitting ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "btn-luxury"
                      }`}>
                        {isSubmitting ? "Submitting..." : "Submit Bouquet Request 🌸"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
