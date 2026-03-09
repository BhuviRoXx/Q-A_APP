import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "http://192.168.0.226:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Automatically attach access token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// If access token expired (401), automatically refresh it and retry
api.interceptors.response.use(
  (response) => response, // success — just return response
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");

        if (!refreshToken) throw new Error("No refresh token");

        // Call Django's token refresh endpoint
        const res = await axios.post(`${BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;

        // Save new access token
        await SecureStore.setItemAsync("access_token", newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear tokens (user must login again)
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        await SecureStore.deleteItemAsync("user");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;