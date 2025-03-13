import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_API_URL;

console.log(API_URL);
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const AdminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

AdminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authorization");
    // console.log(token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create a separate instance for file uploads
export const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000/api/admin",
  withCredentials: true,
});