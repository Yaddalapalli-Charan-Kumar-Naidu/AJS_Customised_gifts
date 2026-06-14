"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useSiteConfigStore } from "@/store/siteConfigStore";

export default function AnnouncementBar() {
  const { config, fetchConfig } = useSiteConfigStore();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  if (!config.announcement_active || dismissed) return null;

  const text = config.announcement_text;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-50 overflow-hidden"
        style={{ background: "linear-gradient(90deg, #E8748A 0%, #9B72CF 50%, #C9956A 100%)" }}
      >
        <div className="flex items-center justify-center py-2 px-4 relative overflow-hidden">
          <div className="overflow-hidden flex-1">
            <p className="text-white text-xs sm:text-sm font-medium text-center tracking-wide">
              {text}
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-3 text-white/70 hover:text-white text-lg leading-none transition-colors"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
