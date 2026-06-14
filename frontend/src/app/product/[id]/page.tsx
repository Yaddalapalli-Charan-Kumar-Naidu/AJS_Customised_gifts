"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, RotateCcw, ChevronRight, Gift } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedCarousel from "@/components/sections/FeaturedCarousel";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useSiteConfigStore } from "@/store/siteConfigStore";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import api from "@/lib/api";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { config, fetchConfig } = useSiteConfigStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");

  const { addItem, openCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  useEffect(() => {
    fetchConfig();
    const fetchProduct = async () => {

      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
        if (res.data.data?.variants?.length > 0 && res.data.data.variants[0].options?.length > 0) {
          setSelectedVariant(res.data.data.variants[0].options[0]);
        }
      } catch (err) {
        toast.error("Product not found");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream pt-32 pb-20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-1/2 aspect-square shimmer-effect rounded-3xl" />
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-10 shimmer-effect w-3/4 rounded-xl" />
              <div className="h-6 shimmer-effect w-1/4 rounded-xl" />
              <div className="h-32 shimmer-effect w-full rounded-xl" />
              <div className="h-12 shimmer-effect w-full rounded-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) return null;

  const wishlisted = isWishlisted(product._id);
  const discount = product.discountPrice ? getDiscountPercent(product.price, product.discountPrice) : 0;

  const handleAddToCart = () => {
    addItem({
      _id: product._id,
      name: product.name,
      image: product.images[0]?.url || "",
      price: product.price,
      discountPrice: product.discountPrice,
      quantity,
      category: product.category?.name || "",
      variant: selectedVariant || undefined,
    });
    toast.success(`${product.name} added to cart! 🛍️`);
    openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/category/${product.category?.slug}`} className="hover:text-pink-500 transition-colors">
            {product.category?.name}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white/60 backdrop-blur-md border border-pink-100 rounded-3xl p-4 sm:p-8 shadow-glass lg:p-12">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            
            {/* Image Gallery */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-2xl overflow-hidden bg-white"
                style={{ boxShadow: "0 10px 40px rgba(232,116,138,0.1)" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={product.images[activeImage]?.url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Badges overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && <span className="discount-badge px-3 py-1 text-xs">-{discount}% OFF</span>}
                  {product.isBestSeller && <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded text-xs font-bold">⭐ Best Seller</span>}
                </div>
              </motion.div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((img: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === i ? "border-pink-500 scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img.url} alt={`${product.name} view ${i+1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                
                {/* Title & Category */}
                <p className="text-pink-500 font-semibold tracking-wider text-sm uppercase mb-2">
                  {product.category?.name}
                </p>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                {(product.ratings > 0 || true) && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.ratings || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm">({product.numReviews || 12} reviews)</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-end gap-3 mb-8 pb-8 border-b border-pink-100">
                  <span className="text-4xl font-bold text-transparent bg-clip-text" style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)", WebkitBackgroundClip: "text" }}>
                    {formatPrice(product.discountPrice || product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-xl text-gray-400 line-through mb-1">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-2">About this gift</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {product.description}
                  </p>
                </div>

                {/* Variants (if any) */}
                {product.variants?.map((variant: any) => (
                  <div key={variant.name} className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-3">{variant.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedVariant(opt)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedVariant === opt 
                              ? "bg-pink-100 border-2 border-pink-500 text-pink-700" 
                              : "bg-white border-2 border-transparent text-gray-600 hover:bg-pink-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Actions */}
                <div className="space-y-4 mb-8">
                  <div className="flex gap-4">
                    {/* Quantity */}
                    <div className="flex items-center bg-white border border-pink-200 rounded-full px-4 h-14">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-pink-500 p-2 hover:text-pink-700 transition-colors">-</button>
                      <span className="font-semibold w-8 text-center text-gray-800">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="text-pink-500 p-2 hover:text-pink-700 transition-colors">+</button>
                    </div>

                    <button 
                      onClick={handleAddToCart}
                      disabled={product.isOutOfStock}
                      className={`flex-1 rounded-full h-14 font-semibold text-base transition-all shadow-glass flex items-center justify-center gap-2 ${
                        product.isOutOfStock ? "bg-gray-100 text-gray-400" : "bg-white text-pink-600 hover:bg-pink-50 border border-pink-200"
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Add to Cart
                    </button>
                    
                    <button 
                      onClick={() => { toggle(product._id); toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist! 💕"); }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${
                        wishlisted ? "bg-pink-50 border-pink-500 text-pink-500" : "bg-white border-pink-200 text-gray-400 hover:text-pink-500"
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${wishlisted ? "fill-pink-500" : ""}`} />
                    </button>
                  </div>

                  <button 
                    onClick={handleBuyNow}
                    disabled={product.isOutOfStock}
                    className={`w-full rounded-full h-14 font-bold text-base transition-all ${
                      product.isOutOfStock ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "btn-luxury text-white shadow-luxury"
                    }`}
                  >
                    {product.isOutOfStock ? "Out of Stock" : "Buy It Now"}
                  </button>
                  
                  <Link href="/hampers" className="block w-full">
                    <button type="button" className="w-full mt-4 rounded-full h-14 font-bold text-base transition-all border-2 border-pink-500 text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                      <Gift className="w-5 h-5" />
                      Customize as a Hamper
                    </button>
                  </Link>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-pink-100">
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-white/50 p-3 rounded-xl">
                    <Truck className="w-5 h-5 text-pink-400" />
                    <span>
                      {config.is_free_delivery_active 
                        ? `Free delivery above ${formatPrice(config.free_delivery_above)}`
                        : "Fast delivery via DTDC"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-white/50 p-3 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-pink-400" />
                    <span>Premium Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-white/50 p-3 rounded-xl">
                    <RotateCcw className="w-5 h-5 text-pink-400" />
                    <span>Secure QR Payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-white/50 p-3 rounded-xl">
                    <Gift className="w-5 h-5 text-pink-400" />
                    <span>Luxury Packaging</span>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <FeaturedCarousel 
        title="You May Also Like" 
        subtitle="Similar items chosen for you" 
        filterKey="category" 
        filterValue={product.category?._id} 
        emoji="🎀" 
      />

      <Footer />
    </main>
  );
}
