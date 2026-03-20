import axios from "axios";
import { useAuthStore } from "../store/auth.store";


const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // cookie auto-send
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Request interceptor – simple, no unused variable
axiosClient.interceptors.request.use(
  (config) => config, // cookie auto-send → no need for isLoggedIn
  (error) => Promise.reject(error)
);

// Response interceptor – handle refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // call refresh endpoint
        await axiosClient.post("/auth/refresh-token");
        // retry original request
        return axiosClient(originalRequest);
      } catch (_err) {
        // refresh failed → logout
        useAuthStore.getState().clearAuth();
        return Promise.reject(_err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;