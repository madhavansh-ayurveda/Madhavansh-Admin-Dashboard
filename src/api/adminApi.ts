import { User, ConsultationStats, DashboardStats } from "@/types";
import { AdminApi } from "./axios";

export const adminApi = {
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await AdminApi.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getAllDoctors: async (): Promise<User[]> => {
    const response = await AdminApi.get("/doctors");
    return response.data.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await AdminApi.patch(`/users/${userId}/role`, { role });
    return response.data.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    // console.log('getDashboardStats api hit client', api.defaults.baseURL)
    const response = await AdminApi.get("/dashboard-stats");
    console.log(response);

    return response.data.data;
  },

  getConsultationStats: async (): Promise<ConsultationStats> => {
    const response = await AdminApi.get("/consultation-stats");
    console.log(response);

    return response.data.data;
  },

  getAllConsultations: async (page = 1, limit = 10) => {
    const response = await AdminApi.get(
      `/consultations?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  updateConsultation: async (id: string, consultationData: any) => {
    const response = await AdminApi.put(
      `/consultations/${id}`,
      consultationData
    );
    return response.data;
  },

  deleteConsultation: async (id: string, userId: string) => {
    const response = await AdminApi.delete(`/consultations/${userId}/${id}`);
    console.log(response);
    return response.data;
  },

  uploadPrescription: async (consultationId: string, formData: FormData) => {
    const response = await AdminApi.post(
      `/consultations/${consultationId}/prescription`,
      formData
    );
    return response.data;
  },
};
