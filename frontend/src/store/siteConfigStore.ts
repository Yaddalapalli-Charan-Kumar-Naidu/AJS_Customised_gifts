"use client";

import { create } from "zustand";
import api from "@/lib/api";

interface SiteConfig {
  delivery_charge: number;
  is_free_delivery_active: boolean;
  free_delivery_above: number;
  announcement_text: string;
  announcement_active: boolean;
  [key: string]: any;
}

interface SiteConfigState {
  config: SiteConfig;
  loading: boolean;
  fetchConfig: () => Promise<void>;
  updateConfig: (updates: Partial<SiteConfig>) => Promise<void>;
}

export const useSiteConfigStore = create<SiteConfigState>((set, get) => ({
  config: {
    delivery_charge: 99,
    is_free_delivery_active: false,
    free_delivery_above: 999,
    announcement_text: "🎁 Free delivery on orders above ₹999!",
    announcement_active: true,
  },
  loading: false,

  fetchConfig: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/site/config");
      if (res.data?.success) {
        set({ config: { ...get().config, ...res.data.data }, loading: false });
      }
    } catch (error) {
      console.error("Failed to fetch site config:", error);
      set({ loading: false });
    }
  },

  updateConfig: async (updates) => {
    try {
      const res = await api.patch("/site/config", updates);
      if (res.data?.success) {
        set({ config: { ...get().config, ...updates } });
      }
    } catch (error) {
      console.error("Failed to update site config:", error);
      throw error;
    }
  },
}));
