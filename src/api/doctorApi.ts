import { AdminApi, api } from "./axios";

export interface Slot {
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export interface ApiResponse {
  data: Doctor[];
  message: string;
  status: string;
}

export interface Availability {
  days: string[];
  slots: Slot[][];
  _id?: string;
}

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: ("Ayurveda" | "Panchakarma" | "Yoga" | "General")[];
  department: (
    | "Skin & Hair"
    | "Infertility and PCOD"
    | "Kidney and Gallbladder Stone"
    | "Arthritis and Pain Management"
    | "Life style disorder"
    | "Glaucoma"
    | "Immunity booster dose"
  )[];
  qualification: string;
  experience: number;
  registrationNumber: string;
  availability: Availability;
  status: "active" | "inactive" | "on-leave";
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export type CreateDoctorDto = {
  name: string;
  email: string;
  phone: string;
  specialization: ("Ayurveda" | "Panchakarma" | "Yoga" | "General")[];
  department: (
    | "Skin & Hair"
    | "Infertility and PCOD"
    | "Kidney and Gallbladder Stone"
    | "Arthritis and Pain Management"
    | "Life style disorder"
    | "Glaucoma"
    | "Immunity booster dose"
  )[];
  qualification: string;
  status: "active" | "inactive" | "on-leave";
  experience: number;
  registrationNumber: string;
  availability: Availability;
  profileImage?: string;
};

export const doctorApi = {
  getAllDoctors: async (page = 1, limit = 10) => {
    const response = await AdminApi.get(`/doctors?page=${page}&limit=${limit}`);
    return response.data;
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  createDoctor: async (doctorData: CreateDoctorDto): Promise<Doctor> => {
    const response = await AdminApi.post("/doctors", doctorData);
    return response.data;
  },

  updateDoctorStatus: async (id: string, status: string): Promise<Doctor> => {
    const response = await AdminApi.patch(`/doctors/${id}/status`, { status });
    return response.data;
  },

  updateDoctorAvailability: async (
    id: string,
    availability: Doctor["availability"]
  ): Promise<Doctor> => {
    const response = await AdminApi.patch(`/doctors/${id}/availability`, {
      availability,
    });
    return response.data;
  },

  deleteDoctor: async (id: string): Promise<void> => {
    await AdminApi.delete(`/doctors/${id}`);
  },

  updateDoctor: async (id: string, data: CreateDoctorDto): Promise<Doctor> => {
    const response = await AdminApi.put(`/doctors/${id}`, data);
    return response.data.data;
  },
};
