import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.poojify.com/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token automatically
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";

    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    // Let the caller decide whether to also toast; but show network-level failures globally
    if (!error?.response) {
      toast.error("Network error. Check your connection.");
    }

    return Promise.reject({ message, status: error?.response?.status });
  }
);

export default axiosClient;
