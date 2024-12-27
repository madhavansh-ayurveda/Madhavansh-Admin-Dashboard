import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const AdminApi = axios.create({
    baseURL: `${API_URL}/api/admin`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});