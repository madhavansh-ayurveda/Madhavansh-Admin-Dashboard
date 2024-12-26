import axios from "axios";
import Cookies from "js-cookie";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// const API_URL = `${BASE_URL}/api/admin/auth`;

// Create an axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for handling cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export const authAdminApi = {
  login: async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email, password });
      const response = await api.post(`/api/admin/auth/login`, {
        email,
        password,
      });
      console.log("Login response:", response);

      if (response.data.token) {
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
      }

      return response.data;
    } catch (error: any) {
      console.error("Login error details:", error.response || error);
      if (error.response) {
        throw new Error(error.response.data.message || "Login failed");
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post(`/api/admin/auth/logout`);
      localStorage.removeItem("token");
      // Remove token from default headers
      delete api.defaults.headers.common["Authorization"];
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await api.get(`/api/admin/auth/check`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      localStorage.removeItem("token");
      throw error;
    }
  },
};

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Optionally redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
