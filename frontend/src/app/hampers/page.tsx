"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, X, CheckCircle2, ChevronRight, Gift, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";

const hamperSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  occasion: z.string().min(2, "Occasion is required"),
  budgetMin: z.number().min(500, "Minimum budget is ₹500"),
  budgetMax: z.number().min(500, "Maximum budget is required"),
  targetGender: z.enum(["boys", "girls", "unisex"] as const, { message: "Please select who this is for" }),
  preferredTheme: z.string().optional(),
  preferredColors: z.string().optional(),
  requiredItems: z.string().optional(),
  specialMessage: z.string().optional(),
  additionalNotes: z.string().optional(),
  needsPhotoFrame: z.boolean().default(false),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than minimum",
  path: ["budgetMax"],
});

type HamperForm = z.infer<typeof hamperSchema>;

export default function HampersPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [waLink, setWaLink] = useState("");
  const [requestId, setRequestId] = useState("");
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [frameImages, setFrameImages] = useState<File[]>([]);
  const [frameImagePreviews, setFrameImagePreviews] = useState<string[]>([]);
  
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm<HamperForm>({
    resolver: zodResolver(hamperSchema) as any,
    defaultValues: {
      budgetMin: 1000,
      budgetMax: 3000,
      targetGender: "unisex",
      needsPhotoFrame: false,
    }
  });

  const watchTargetGender = register("targetGender").onChange;
  const needsPhotoFrame = watch("needsPhotoFrame");

  const fetchProductsByGender = async (gender: string) => {
    setIsLoadingProducts(true);
    try {
      // Map form gender to product giftType enum
      // 'boys' -> male, 'girls' -> female, 'unisex' -> unisex
      const typeMap: any = { boys: "male", girls: "female", unisex: "unisex" };
      const giftType = typeMap[gender] || "unisex";
      
      const res = await api.get(`/products?giftType=${giftType}&limit=50`);
      setAvailableProducts(res.data.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleGenderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await watchTargetGender(e); // Let react-hook-form handle it
    fetchProductsByGender(e.target.value);
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isFrame: boolean = false) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (isFrame) {
        if (frameImages.length + filesArray.length > 5) {
          toast.error("Maximum 5 photo frame images allowed");
          return;
        }
        setFrameImages(prev => [...prev, ...filesArray]);
        const newPreviews = filesArray.map(file => URL.createObjectURL(file));
        setFrameImagePreviews(prev => [...prev, ...newPreviews]);
      } else {
        if (images.length + filesArray.length > 5) {
          toast.error("Maximum 5 reference images allowed");
          return;
        }
        setImages(prev => [...prev, ...filesArray]);
        const newPreviews = filesArray.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
      }
    }
  };

  const removeImage = (index: number, isFrame: boolean = false) => {
    if (isFrame) {
      setFrameImages(prev => prev.filter((_, i) => i !== index));
      setFrameImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ["customerName", "phone", "email", "deliveryAddress"] 
      : ["occasion", "budgetMin", "budgetMax"];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: HamperForm) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") formData.append(key, String(value));
      });
      images.forEach(img => formData.append("referenceImages", img));
      frameImages.forEach(img => formData.append("frameImages", img));
      formData.append("selectedProducts", JSON.stringify(selectedProductIds));

      const res = await api.post("/hampers", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setRequestId(res.data.data.requestId);
      setWaLink(res.data.waLink);
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
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2 relative z-10">Request Received! 🎀</h1>
            <p className="text-gray-500 font-medium mb-6 relative z-10">Request ID: <span className="text-pink-600">#{requestId}</span></p>
            <p className="text-gray-600 mb-8 leading-relaxed relative z-10">
              We've received your customized hamper request. Our design team will review your requirements and get back to you with a quote within 24 hours.
            </p>
            <div className="space-y-4 relative z-10">
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="block">
                  <button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-full font-semibold transition-colors flex items-center justify-center gap-2">
                    Message Us on WhatsApp
                  </button>
                </a>
              )}
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
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-pink-200 rounded-full px-4 py-1.5 text-sm text-pink-600 font-medium mb-4">
              <Sparkles className="w-4 h-4" /> Customized For You
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Design Your Dream <br/><span className="text-transparent bg-clip-text" style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)", WebkitBackgroundClip: "text" }}>Hamper</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tell us what you have in mind, and our experts will curate the perfect personalized gift box for your special occasion.
            </p>
          </motion.div>

          <div className="bg-white/70 backdrop-blur-md border border-pink-100 rounded-3xl p-6 sm:p-10 shadow-glass">
            
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-pink-100 relative">
              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-500" 
                style={{ width: `${((step - 1) / 2) * 100}%` }} />
              
              {[1, 2, 3].map((num) => (
                <div key={num} className={`flex flex-col items-center gap-2 ${step >= num ? "text-pink-600" : "text-gray-400"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= num ? "bg-pink-100 ring-2 ring-pink-500 ring-offset-2" : "bg-gray-100"
                  }`}>
                    {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider hidden sm:block">
                    {num === 1 ? "Contact" : num === 2 ? "Requirements" : "Details"}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Contact Details */}
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

                {/* STEP 2: Basic Requirements */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Hamper Requirements</h2>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Occasion *</label>
                        <select {...register("occasion")} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all text-gray-700">
                          <option value="">Select an occasion</option>
                          <option value="Birthday">Birthday</option>
                          <option value="Anniversary">Anniversary</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Baby Shower">Baby Shower</option>
                          <option value="Corporate">Corporate Gifting</option>
                          <option value="Valentine's Day">Valentine's Day</option>
                          <option value="Other">Other (Specify in notes)</option>
                        </select>
                        {errors.occasion && <p className="text-red-500 text-xs mt-1">{errors.occasion.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Estimated Budget Range (₹) *</label>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input type="number" {...register("budgetMin")} placeholder="Min" className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                            {errors.budgetMin && <p className="text-red-500 text-xs mt-1">{errors.budgetMin.message}</p>}
                          </div>
                          <span className="text-gray-400 font-medium">to</span>
                          <div className="flex-1">
                            <input type="number" {...register("budgetMax")} placeholder="Max" className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                            {errors.budgetMax && <p className="text-red-500 text-xs mt-1">{errors.budgetMax.message}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Theme / Vibe</label>
                          <input {...register("preferredTheme")} placeholder="e.g. Romantic, Elegant, Fun" className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color Palette Preference</label>
                          <input {...register("preferredColors")} placeholder="e.g. Pastels, Rose Gold & White" className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-between">
                      <button type="button" onClick={() => setStep(1)} className="btn-outline-luxury px-6 py-3.5">Back</button>
                      <button type="button" onClick={nextStep} className="btn-luxury px-8 py-3.5 flex items-center gap-2">
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Details & Images */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Specific Details & Reference</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Who is this for? *</label>
                      <select {...register("targetGender")} onChange={handleGenderChange} className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all text-gray-700">
                        <option value="unisex">Unisex / Anyone</option>
                        <option value="boys">Boys / Men</option>
                        <option value="girls">Girls / Women</option>
                      </select>
                      {errors.targetGender && <p className="text-red-500 text-xs mt-1">{errors.targetGender.message}</p>}
                    </div>
                    
                    {availableProducts.length > 0 && (
                      <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select Items to Include in Hamper (Optional)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          {availableProducts.map((product) => (
                            <div 
                              key={product._id} 
                              onClick={() => toggleProductSelection(product._id)}
                              className={`cursor-pointer border-2 rounded-xl p-2 text-center transition-all ${selectedProductIds.includes(product._id) ? 'border-pink-500 bg-pink-50 shadow-md scale-[1.02]' : 'border-transparent bg-white hover:border-pink-200 shadow-sm'}`}
                            >
                              <div className="aspect-square relative rounded-lg overflow-hidden mb-2 bg-gray-100">
                                {product.images && product.images[0] && (
                                  <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                                )}
                                {selectedProductIds.includes(product._id) && (
                                  <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-0.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                              <p className="text-xs text-pink-600 font-bold">₹{product.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Any other requirements (Optional)</label>
                      <textarea {...register("requiredItems")} rows={2} placeholder="e.g. Specific brands, custom names, Polaroid photos..." className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all resize-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Message for the Card</label>
                      <textarea {...register("specialMessage")} rows={2} placeholder="Type your personalized message here..." className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all resize-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                      <textarea {...register("additionalNotes")} rows={2} placeholder="Any specific instructions for delivery or packaging..." className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none transition-all resize-none" />
                    </div>

                    <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" {...register("needsPhotoFrame")} className="w-5 h-5 text-pink-600 rounded border-pink-300 focus:ring-pink-500" />
                        <span className="text-sm font-medium text-gray-800">Do you need a Photo Frame included?</span>
                      </label>
                      
                      {needsPhotoFrame && (
                        <div className="mt-4 pt-4 border-t border-pink-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos for Frame (Max 5)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {frameImagePreviews.map((preview, i) => (
                              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-pink-100">
                                <Image src={preview} alt="frame preview" fill className="object-cover" />
                                <button type="button" onClick={() => removeImage(i, true)} className="absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow-sm transition-colors">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            {frameImagePreviews.length < 5 && (
                              <label className="aspect-square rounded-xl border-2 border-dashed border-pink-200 bg-white hover:bg-pink-50 transition-colors flex flex-col items-center justify-center cursor-pointer text-pink-500">
                                <Upload className="w-6 h-6 mb-1" />
                                <span className="text-xs font-medium">Upload Image</span>
                                <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reference Images (Max 5)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {imagePreviews.map((preview, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-pink-100">
                            <Image src={preview} alt="preview" fill className="object-cover" />
                            <button type="button" onClick={() => removeImage(i, false)} className="absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow-sm transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {imagePreviews.length < 5 && (
                          <label className="aspect-square rounded-xl border-2 border-dashed border-pink-200 bg-pink-50 hover:bg-pink-100 transition-colors flex flex-col items-center justify-center cursor-pointer text-pink-500">
                            <Upload className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">Upload Image</span>
                            <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, false)} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row gap-4">
                      <button type="button" onClick={() => setStep(2)} className="btn-outline-luxury px-6 py-4 w-full sm:w-auto text-center">Back</button>
                      <button type="submit" disabled={isSubmitting} className={`w-full py-4 text-base font-bold rounded-full transition-all ${
                        isSubmitting ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "btn-luxury"
                      }`}>
                        {isSubmitting ? "Submitting Request..." : "Submit Hamper Request ✨"}
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
