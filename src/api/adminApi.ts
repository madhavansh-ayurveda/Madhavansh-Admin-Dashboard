import { User, ConsultationStats, DashboardStats } from "@/types";
import { AdminApi } from "./axios";
// import axios from "axios";

export const adminApi = {
  getAllUsers: async (
    page = 1,
    limit = 10,
    search?: string,
    minAge?: number,
    maxAge?: number,
    startDate?: string,
    endDate?: string
  ) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(minAge && { minAge: minAge.toString() }),
      ...(maxAge && { maxAge: maxAge.toString() }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    const response = await AdminApi.get(`/users?${queryParams}`);
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
    const response = await AdminApi.get("/dashboard-stats");
    return response.data.data;
  },

  getConsultationStats: async (): Promise<ConsultationStats> => {
    const response = await AdminApi.get("/consultation-stats");
    return response.data.data;
  },

  getAllConsultations: async (
    page: number,
    limit: number,
    search?: string,
    status?: string,
    types?: string[],
    startDate?: string,
    endDate?: string
  ) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(types?.length && { types: types.join(",") }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const response = await AdminApi.get(`/consultations?${queryParams}`);
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
    return response.data;
  },

  uploadPrescription: async (consultationId: string, formData: FormData) => {
    const response = await AdminApi.post(
      `/consultations/${consultationId}/prescription`,
      formData
    );
    return response.data;
  },

  sendFeedback: async ({
    consultationId,
    feedback,
    rating,
    userEmail,
  }: {
    consultationId: string;
    feedback: string;
    rating: number;
    userEmail: string;
  }) => {
    const response = await AdminApi.post("/api/feedback", {
      consultationId,
      feedback,
      rating,
      userEmail,
    });
    return response.data;
  },
};
