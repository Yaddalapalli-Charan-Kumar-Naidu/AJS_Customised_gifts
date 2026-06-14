"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift } from "lucide-react";

export default function CinematicLoader() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Hide loader after 2.5s
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-50"
            style={{
              background: "radial-gradient(circle at center, rgba(244,167,185,0.4) 0%, transparent 60%)",
              animation: "glowPulse 3s ease-in-out infinite",
            }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex flex-col items-center"
          >
            {/* Logo Mark */}
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-glow-pink"
              style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)" }}
            >
              <Gift className="w-10 h-10 text-white" />
            </motion.div>

            {/* Brand Text */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2"
            >
              AJS Gifts
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="font-script text-xl text-pink-500"
            >
              Turning Memories into Beautiful Gifts
            </motion.p>

            {/* Progress Bar */}
            <div className="w-48 h-1 bg-pink-100 rounded-full mt-8 overflow-hidden relative">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full"
                style={{ background: "linear-gradient(90deg, #E8748A, #9B72CF)" }}
              />
            </div>
          </motion.div>

          {/* Floating Particles */}
          {mounted && Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-pink-400/60"
              initial={{
                x: (Math.random() - 0.5) * window.innerWidth,
                y: (Math.random() - 0.5) * window.innerHeight,
                scale: 0,
              }}
              animate={{
                y: [null, -100 - Math.random() * 100],
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
