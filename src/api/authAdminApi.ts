import { store } from "@/store";
import { logout } from "@/store/authSlice";
import { AdminApi } from "./axios";
import Cookies from "js-cookie";

export const authAdminApi = {
  login: async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email, password });
      const response = await AdminApi.post(`/auth/login`, {
        email,
        password,
      });
      console.log("Login response:", response);

      if (response.data.token) {
        AdminApi.defaults.headers.common[
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
      const response = await AdminApi.post(`/logout`);
      localStorage.removeItem("token");
      Cookies.remove('token')
      Cookies.remove('role')
      // localStorage.removeItem("adminToken");
      // Cookies.remove("adminToken");
      delete AdminApi.defaults.headers.common["Authorization"];

      // Dispatch logout action to clear Redux store
      store.dispatch(logout());

      return response.data;
    } catch (error) {
      // Even if the API call fails, we should still clear local state
      localStorage.removeItem("token");
      // localStorage.removeItem("adminToken");
      // Cookies.remove("adminToken");
      delete AdminApi.defaults.headers.common["Authorization"];
      store.dispatch(logout());
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await AdminApi.get(`/auth/check-auth`, {
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
AdminApi.interceptors.request.use(
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
AdminApi.interceptors.response.use(
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
