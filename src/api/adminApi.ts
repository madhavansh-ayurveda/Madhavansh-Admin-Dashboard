import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: `${API_URL}/admin`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export interface DashboardStats {
    totalPatients: number;
    totalDoctors: number;
    totalConsultations: number;
    totalRevenue: number;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    age: number;
    createdAt: string;
}

export interface ConsultationStats {
    statusStats: Array<{
        _id: string;
        count: number;
        totalAmount: number;
    }>;
    monthlyStats: Array<{
        _id: {
            month: number;
            year: number;
        };
        count: number;
        totalAmount: number;
    }>;
}

export const adminApi = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await axiosInstance.get('/dashboard-stats');
        return response.data.data;
    },

    getAllUsers: async (): Promise<User[]> => {
        const response = await axiosInstance.get('/users');
        console.log(response.data.data)
        return response.data.data;
    },

    getAllDoctors: async (): Promise<User[]> => {
        const response = await axiosInstance.get('/doctors');
        return response.data.data;
    },

    updateUserRole: async (userId: string, role: string): Promise<User> => {
        const response = await axiosInstance.patch(`/users/${userId}/role`, { role });
        return response.data.data;
    },

    getConsultationStats: async (): Promise<ConsultationStats> => {
        const response = await axiosInstance.get('/consultation-stats');
        return response.data.data;
    },

    getAllConsultations: async () => {
        const response = await axiosInstance.get('/consultations');
        return response.data.data;
    },
}; 