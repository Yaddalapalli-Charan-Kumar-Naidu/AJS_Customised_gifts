import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  setAuth: (token: string, user: AdminUser) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      checkAuth: async () => {
        const { token } = get();
        if (!token) return false;
        try {
          const res = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ user: res.data.admin });
          return true;
        } catch (err) {
          set({ token: null, user: null });
          return false;
        }
      }
    }),
    {
      name: "ajs-auth-storage",
    }
  )
);
