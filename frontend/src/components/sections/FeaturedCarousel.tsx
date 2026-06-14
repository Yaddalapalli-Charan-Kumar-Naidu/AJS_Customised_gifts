"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ProductCard from "@/components/product/ProductCard";
import api from "@/lib/api";
import { Sparkles } from "lucide-react";

interface FeaturedCarouselProps {
  title?: string;
  subtitle?: string;
  filterKey?: string;
  filterValue?: string;
  emoji?: string;
}

export default function FeaturedCarousel({
  title = "Featured Products",
  subtitle = "Hand-picked gifts just for you",
  filterKey = "isFeatured",
  filterValue = "true",
  emoji = "⭐",
}: FeaturedCarouselProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products?${filterKey}=${filterValue}&limit=8`).then((res) => {
      setProducts(res.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filterKey, filterValue]);

  return (
    <section ref={ref} className="py-16 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FDF6EC 0%, #FFE4F0 50%, #FDF6EC 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-full px-4 py-1.5 text-sm text-pink-600 font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {emoji} {title}
          </div>
          <h2 className="section-heading text-4xl sm:text-5xl font-bold font-display">{title}</h2>
          <p className="text-gray-500 mt-3">{subtitle}</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(4).fill(0).map((_, i) => (
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
          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={1.2}
            centeredSlides={false}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            breakpoints={{
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="!pb-12"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product._id}>
                <ProductCard product={product} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🎁</div>
            <p>No products found yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
