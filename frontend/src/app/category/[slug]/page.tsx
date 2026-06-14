"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Filter, SlidersHorizontal, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import api from "@/lib/api";

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-pink-500 text-lg font-medium">Loading...</div>
      </main>
    }>
      <CategoryContent />
    </Suspense>
  );
}

function CategoryContent() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    // Determine category ID from slug (this requires fetching categories first or matching on backend, 
    // we'll assume the backend can handle filtering by category slug if we pass it, but wait: 
    // the backend route `GET /api/products` takes `category` as ID. We need to fetch categories first)
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        // Fetch categories to get ID
        const catRes = await api.get("/categories");
        const foundCategory = catRes.data?.data?.find((c: any) => c.slug === slug);
        setCategory(foundCategory || { name: slug?.toString().replace("-", " ").toUpperCase(), description: "Explore our collection." });

        const catIdQuery = foundCategory ? `&category=${foundCategory._id}` : "";
        const typeQuery = slug?.toString().includes("male") ? "&giftType=male" : slug?.toString().includes("female") ? "&giftType=female" : slug?.toString().includes("hamper") ? "&giftType=hamper" : "";
        
        let url = `/products?sortBy=${sortBy}&order=${order}`;
        if (foundCategory) url += catIdQuery;
        else url += typeQuery;

        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;

        const prodRes = await api.get(url);
        setProducts(prodRes.data?.data || []);
      } catch (err) {
        console.error("Error fetching category data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [slug, sortBy, order, minPrice, maxPrice]);

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />

      {/* Category Banner */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-purple-50 border-b border-pink-100 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 mix-blend-multiply" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-pink-200 rounded-full px-4 py-1.5 text-sm text-pink-600 font-medium mb-4 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Category
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 capitalize">
              {category?.name || slug?.toString().replace("-", " ")}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {category?.description || "Find the perfect premium customized gifts for your loved ones."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="glass-card p-5 rounded-2xl bg-white/50 sticky top-24">
              <div className="flex items-center gap-2 font-semibold text-gray-800 mb-4 border-b border-pink-100 pb-3">
                <Filter className="w-4 h-4 text-pink-500" />
                Filters
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Sort By</label>
                <div className="space-y-2">
                  <select 
                    value={`${sortBy}-${order}`} 
                    onChange={(e) => {
                      const [s, o] = e.target.value.split("-");
                      setSortBy(s);
                      setOrder(o);
                    }}
                    className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 outline-none"
                  >
                    <option value="createdAt-desc">Latest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="popularity-desc">Popularity</option>
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Price Range</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="text-gray-900 font-bold">{products.length}</span> products
              </p>
              <button className="lg:hidden flex items-center gap-2 bg-white border border-pink-200 px-4 py-2 rounded-full text-sm font-medium">
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
            </div>

            {slug === "customized-hampers" && (
              <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">Want something truly unique?</h3>
                  <p className="text-gray-600">Design your dream hamper from scratch. Pick the occasion, set your budget, and tell us your requirements.</p>
                </div>
                <Link href="/hampers" className="shrink-0">
                  <button className="btn-luxury px-8 py-4 rounded-full font-bold shadow-luxury flex items-center gap-2 hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                    Customize Your Hamper
                  </button>
                </Link>
              </div>
            )}

            {slug === "bouquets" && (
              <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">Want a custom bouquet?</h3>
                  <p className="text-gray-600">Choose your own colours, count, and style (fuzzywire or ribbon) to craft the perfect bouquet.</p>
                </div>
                <Link href="/custom-bouquet" className="shrink-0">
                  <button className="btn-luxury px-8 py-4 rounded-full font-bold shadow-luxury flex items-center gap-2 hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                    Customize Bouquet
                  </button>
                </Link>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <div className="aspect-square shimmer-effect" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 shimmer-effect rounded w-3/4" />
                      <div className="h-3 shimmer-effect rounded w-1/2" />
                      <div className="h-8 shimmer-effect rounded-full mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-sm">We couldn't find any products matching your current filters. Try adjusting them or explore other categories.</p>
                <button 
                  onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                  className="mt-6 btn-outline-luxury px-6 py-2 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
