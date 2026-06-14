"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";

const defaultImages = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400",
  "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
  "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
];

export default function InstagramGallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [images, setImages] = useState(defaultImages.map((url, i) => ({ _id: String(i), url })));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    api.get("/site/gallery").then((res) => {
      if (res.data?.data?.length > 0) setImages(res.data.data);
    }).catch(() => {});
  }, []);

  const cols = [images.slice(0, 3), images.slice(3, 6), images.slice(6, 8)];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="text-center mb-14"
      >
        <p className="font-script text-2xl text-pink-400 mb-2">Our Gallery</p>
        <h2 className="section-heading text-4xl sm:text-5xl font-bold font-display">
          Instagram-worthy Gifts
        </h2>
        <p className="text-gray-500 mt-3">
          Every gift tells a story. Follow us{" "}
          <a href="https://instagram.com/ajscustomizedgifts" target="_blank" rel="noopener noreferrer"
            className="text-pink-500 font-semibold hover:underline">
            @ajscustomizedgifts
          </a>
        </p>
      </motion.div>

      {/* Masonry grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {images.slice(0, 8).map((img, index) => {
          const isLarge = index === 0 || index === 5;
          return (
            <motion.div
              key={img._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.07, duration: 0.4 }}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${isLarge ? "row-span-2" : ""}`}
              style={{ aspectRatio: isLarge ? "1/2" : "1/1" }}
              onClick={() => setSelectedImage((img as any).url || img)}
            >
              <Image
                src={(img as any).url || img}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(232,116,138,0.7) 0%, rgba(155,114,207,0.7) 100%)" }}>
                <div className="text-white text-center">
                  <div className="text-3xl mb-1">🎁</div>
                  <p className="text-sm font-semibold">View Gift</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6 }}
        className="text-center mt-10"
      >
        <a
          href="https://instagram.com/ajscustomizedgifts"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 btn-luxury px-8 py-3 text-sm"
        >
          📸 Follow on Instagram
        </a>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[90vh] aspect-square sm:aspect-auto sm:h-full flex items-center justify-center"
            >
              <div className="relative w-full h-full">
                <Image
                  src={selectedImage}
                  alt="Enlarged view"
                  fill
                  className="object-contain"
                  quality={100}
                />
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 sm:-top-12 sm:right-0 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 rounded-full transition-colors backdrop-blur-md"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
