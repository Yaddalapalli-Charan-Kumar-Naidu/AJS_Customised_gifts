"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import api from "@/lib/api";

const defaultCategories = [
  {
    _id: "1", name: "Female Gifts 💕", slug: "female-gifts", giftType: "female",
    description: "Elegant, thoughtful gifts curated specially for her — from luxury skincare to personalized jewelry.",
    banner: { url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600", publicId: "" },
    gradient: "from-pink-400 to-rose-600",
  },
  {
    _id: "2", name: "Male Gifts 💙", slug: "male-gifts", giftType: "male",
    description: "Thoughtful premium gifts for him — grooming kits, personalized accessories, and more.",
    banner: { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600", publicId: "" },
    gradient: "from-purple-400 to-indigo-600",
  },
  {
    _id: "3", name: "Custom Hampers 🎀", slug: "customized-hampers", giftType: "hamper",
    description: "Fully personalized gift hampers crafted just for you — themed, curated, and wrapped beautifully.",
    banner: { url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600", publicId: "" },
    gradient: "from-amber-400 to-rose-500",
  },
];

const fallbackGradients = [
  "from-pink-400 to-rose-600",
  "from-purple-400 to-indigo-600",
  "from-amber-400 to-rose-500",
  "from-emerald-400 to-teal-600",
  "from-blue-400 to-cyan-600",
  "from-orange-400 to-red-600",
];

export default function CategoriesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    api.get("/categories").then((res) => {
      if (res.data?.data?.length > 0) {
        const main = res.data.data.map((cat: any, i: number) => {
          // Find if we have a matching default category for metadata (like gradients)
          const defaultCat = defaultCategories.find(dc => dc.slug === cat.slug);
          return {
            ...cat,
            // Use the backend image if available, otherwise use default image
            banner: cat.banner?.url ? cat.banner : (defaultCat?.banner || { url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800" }),
            gradient: defaultCat?.gradient || fallbackGradients[i % fallbackGradients.length],
          };
        });
        setCategories(main);
      }
    }).catch(() => {});
  }, []);

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <p className="font-script text-2xl text-pink-400 mb-2">Browse by Category</p>
        <h2 className="section-heading text-4xl sm:text-5xl font-bold font-display">
          Find the Perfect Gift
        </h2>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
          Whether it&apos;s for her, for him, or a fully customized hamper — we&apos;ve got something magical for every occasion.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat, index) => (
          <motion.div
            key={cat._id}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.15 }}
          >
            <Link href={`/category/${cat.slug}`}>
              <div className="group relative h-72 sm:h-80 rounded-3xl overflow-hidden cursor-pointer"
                style={{ boxShadow: "0 20px 60px rgba(232,116,138,0.2)" }}>
                {/* Background image */}
                <Image
                  src={(cat as any).banner?.url || ""}
                  alt={cat.name}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${(cat as any).gradient || "from-pink-600 to-purple-600"} opacity-60 group-hover:opacity-70 transition-opacity duration-300`} />

                {/* Glassmorphism content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="glass-card rounded-2xl p-4">
                    <h3 className="font-display text-xl font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{cat.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-white/90 text-sm font-semibold group-hover:gap-3 transition-all">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>

                {/* Sparkle effect on hover */}
                <div className="absolute top-4 right-4 text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-sparkle">
                  ✨
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
