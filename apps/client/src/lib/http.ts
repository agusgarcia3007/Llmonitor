import axios from "axios";
import { authClient } from "./auth-client";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 403 = Authentication error -> logout user
    if (error.response?.status === 403) {
      await authClient.signOut();
      document.cookie =
        "isAuthenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
    }
    // 402 = Payment Required -> subscription issue, don't logout
    // Let the component handle the subscription error appropriately
    return Promise.reject(error);
  }
);
