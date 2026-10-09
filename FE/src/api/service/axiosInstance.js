import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "*/*",
  },
});

// Pre-warm backend on load to eliminate Render cold start
try {
  const warmBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (warmBase && typeof window !== "undefined") {
    fetch(`${warmBase}/health`).catch(() => {});
  }
} catch {
  // Silent fail
}

// gắn token nếu có
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
