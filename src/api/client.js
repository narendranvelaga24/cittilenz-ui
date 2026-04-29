import axios from "axios";
import { env } from "../lib/env";
import { clearSession, getStoredToken } from "../lib/storage";

export const api = axios.create({
  baseURL: env.baseUrl,
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration / invalid JWT
    if (error.response?.status === 401) {
      clearSession();
      if (window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }
    // Handle 403 (Access Denied) - don't redirect, let component handle UI
    if (error.response?.status === 403) {
      // Component will see error and display "Access Denied" message
    }
    return Promise.reject(error);
  },
);
