import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

// Request interceptor — attach admin token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const storageStr = localStorage.getItem("ajs-auth-storage");
      if (storageStr) {
        const parsed = JSON.parse(storageStr);
        const token = parsed?.state?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const isAdminRoute = window.location.pathname.startsWith("/admin");
      if (isAdminRoute && window.location.pathname !== "/admin/login") {
        localStorage.removeItem("ajs-auth-storage");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
