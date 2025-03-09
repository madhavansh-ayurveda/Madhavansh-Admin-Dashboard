import { User, ConsultationStats, DashboardStats } from "@/types";
import { AdminApi } from "./axios";
import { authAdminApi } from "./authAdminApi";
import { AxiosError } from "axios";
import { navigateTo } from "@/utils/navigation";

export const adminApi = {
  createAdmin: async (adminData: any) => {
    try {
      const response = await AdminApi.post("/manage", adminData);
      console.log(response);
      
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error(err.message);
      }
    }
  },
  getAllAdmins: async (page = 1, limit = 10) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await AdminApi.get(`/manage`);
      console.log(response);

      return response.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message?.toLowerCase().includes("jwt")
      ) {
        await authAdminApi.logout();
        // navigateTo('/login');
      }
      throw err;
    }
  },

  updateAdmin: async (adminData: any) => {
    try {
      const response = await AdminApi.put(`/manage`, adminData);
      return response.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message === "jwt malformed"
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },

  updatePermissions: async (adminId: string, permissions: string[]) => {
    try {
      const response = await AdminApi.put(`/manage/${adminId}/permissions`, {
        permissions,
      });
      return response.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message === "jwt malformed"
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },

  getAllUsers: async (
    page = 1,
    limit = 10,
    search?: string,
    minAge?: number,
    maxAge?: number,
    startDate?: string,
    endDate?: string
  ) => {
    try {
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
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message?.toLowerCase().includes("jwt")
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },

  getAllDoctors: async (): Promise<User[]> => {
    try {
      const response = await AdminApi.get("/doctors");
      return response.data.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message?.toLowerCase().includes("jwt")
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    try {
      const response = await AdminApi.patch(`/users/${userId}/role`, { role });
      return response.data.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message?.toLowerCase().includes("jwt")
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await AdminApi.get("/dashboard-stats");
      console.log(response);
      return response.data.data;
    } catch (err) {
      console.log(err);
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message?.toLowerCase().includes("jwt")
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      return {
        totalPatients: 0,
        totalDoctors: 0,
        totalConsultations: 0,
        totalRevenue: 0,
        uniqueConsultations: 0,
        totalOneTimePatients: 0,
      };
    }
    // if (!response.data.success && response.data.message=="No to"){
    //   return undefined;
    // }
  },

  getConsultationStats: async (): Promise<ConsultationStats> => {
    try {
      const response = await AdminApi.get("/consultation-stats");
      return response.data.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message?.toLowerCase().includes("jwt")
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },

  getAllConsultations: async (
    page: number,
    limit: number,
    searchTerm?: string,
    status?: string,
    types?: string[],
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { searchTerm }),
        ...(status && { status }),
        ...(types?.length && { types: types.join(",") }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await AdminApi.get(`/consultations?${queryParams}`);
      return response.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message?.toLowerCase().includes("jwt")
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },

  updateConsultation: async (id: string, consultationData: any) => {
    try {
      const response = await AdminApi.put(
        `/consultations/${id}`,
        consultationData
      );
      return response.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message?.toLowerCase().includes("jwt")
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },

  deleteConsultation: async (id: string, userId: string) => {
    try {
      const response = await AdminApi.delete(`/consultations/${userId}/${id}`);
      return response.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message?.toLowerCase().includes("jwt")
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },

  uploadPrescription: async (consultationId: string, formData: FormData) => {
    try {
      const response = await AdminApi.post(
        `/consultations/${consultationId}/prescription`,
        formData
      );
      return response.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message === "jwt malformed"
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },

  sendFeedbackForm: async (
    consultationId: string,
    scheduleData: { daysAfter: number; immediate: boolean }
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await AdminApi.post(
        `/feedback/send/${consultationId}/`,
        scheduleData
      );
      return response.data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.error?.message?.toLowerCase().includes("jwt")
      ) {
        await authAdminApi.logout();
        navigateTo("/login");
      }
      throw err;
    }
  },
};
