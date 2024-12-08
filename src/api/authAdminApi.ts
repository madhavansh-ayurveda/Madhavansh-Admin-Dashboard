import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/admin/auth`;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:5174'
    }
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure CORS headers are present
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:5174';
    return config;
});

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data?.message || error.message);
    }
);

export const authAdminApi = {
    login: async (email: string, password: string) => {
        try {
            const response = await axiosInstance.post('/login', {
                email,
                password,
            });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            const response = await axiosInstance.post('/logout');
            localStorage.removeItem('token');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get('/check');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}; 