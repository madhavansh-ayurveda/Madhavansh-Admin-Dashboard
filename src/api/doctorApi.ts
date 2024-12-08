import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: `${API_URL}/doctors`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export interface Doctor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    specialization: 'Ayurveda' | 'Panchakarma' | 'Yoga' | 'General';
    qualification: string;
    experience: number;
    registrationNumber: string;
    status: 'active' | 'inactive' | 'on-leave';
    bio?: string;
    profileImage?: string;
    createdAt: string;
}

export interface CreateDoctorDto {
    name: string;
    email: string;
    password: string;
    phone: string;
    specialization: Doctor['specialization'];
    qualification: string;
    experience: number;
    registrationNumber: string;
    bio?: string;
}

export const doctorApi = {
    createDoctor: async (data: CreateDoctorDto): Promise<Doctor> => {
        const response = await axiosInstance.post('/', data);
        return response.data.data;
    },

    getAllDoctors: async (): Promise<Doctor[]> => {
        const response = await axiosInstance.get('/');
        return response.data.data;
    },

    updateDoctorStatus: async (id: string, status: Doctor['status']): Promise<Doctor> => {
        const response = await axiosInstance.patch(`/${id}/status`, { status });
        return response.data.data;
    }
}; 