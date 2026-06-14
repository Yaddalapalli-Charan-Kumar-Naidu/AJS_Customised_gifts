"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Gift, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setAuth(res.data.token, res.data.admin);
      toast.success("Welcome back! 👋");
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white p-8 sm:p-10 rounded-[2.5rem] shadow-glass relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 shadow-md"
            style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)" }}>
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-500 text-sm">Sign in to manage AJS Customized Gifts</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ajsgifts.com"
                className="w-full bg-white/50 border border-pink-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-pink-400 outline-none transition-all"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/50 border border-pink-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-pink-400 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white shadow-luxury transition-all mt-8 ${
              loading ? "bg-pink-300 cursor-not-allowed" : "btn-luxury"
            }`}
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Secure Area • AJS Gifts System</p>
        </div>
      </motion.div>
    </main>
  );
}
