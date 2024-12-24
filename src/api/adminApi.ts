import axios from 'axios';
import { User, ConsultationStats, DashboardStats } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api/admin`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const adminApi = {
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get('/users');
        // console.log(response.data.data)
        return response.data.data;
    },

    getAllDoctors: async (): Promise<User[]> => {
        const response = await api.get('/doctors');
        return response.data.data;
    },

    updateUserRole: async (userId: string, role: string): Promise<User> => {
        const response = await api.patch(`/users/${userId}/role`, { role });
        return response.data.data;
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        // console.log('getDashboardStats api hit client', api.defaults.baseURL)
        const response = await api.get('/dashboard-stats');
        console.log(response);

        return response.data.data;
    },

    getConsultationStats: async (): Promise<ConsultationStats> => {
        const response = await api.get('/consultation-stats');
        console.log(response);

        return response.data.data;
    },

    getAllConsultations: async () => {
        const response = await api.get('/consultations');
        return response.data.data;
    },
}; 