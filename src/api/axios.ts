import axios from "axios";
import { store } from "@/store";

const API_URL = import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

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
    const state = store.getState();
    const token = state.auth.token;
    // console.log(token);

    if (token) {
      config.headers.Authorization = `${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
