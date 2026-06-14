"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";
import api from "@/lib/api";

export default function WishlistPage() {
  const { items, clear } = useWishlistStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const promises = items.map((id) => api.get(`/products/${id}`));
        const results = await Promise.allSettled(promises);
        
        const validProducts = results
          .filter((res): res is PromiseFulfilledResult<any> => res.status === "fulfilled")
          .map((res) => res.value.data.data);
          
        setProducts(validProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, [items]);

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <Navbar />

      <div className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500" /> My Wishlist
          </h1>
          {items.length > 0 && (
            <button 
              onClick={clear}
              className="text-sm font-medium text-pink-500 hover:text-pink-700 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-square shimmer-effect" />
                <div className="p-4 space-y-2">
                  <div className="h-4 shimmer-effect rounded w-3/4" />
                  <div className="h-3 shimmer-effect rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-12 text-center border border-pink-100 shadow-sm max-w-2xl mx-auto mt-10">
            <div className="text-7xl mb-6">💖</div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save the gifts you love and find them here later!</p>
            <Link href="/">
              <button className="btn-luxury px-8 py-3.5 rounded-full font-semibold">
                Explore Gifts
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
