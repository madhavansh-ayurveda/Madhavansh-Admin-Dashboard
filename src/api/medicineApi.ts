import { Medicine } from "@/types";
import { AdminApi } from "./axios";

export const medicineApi = {
    addMedicine: async (medicine: Medicine) => {
        const response = await AdminApi.post('/api/medicines-stock', medicine);
        return response.data;
    },
    getMedicines: async () => {
        const response = await AdminApi.get('/api/medicines-stock');
        return response.data;
    },
    deleteMedicine: async (id: string) => {
        const response = await AdminApi.delete(`/api/medicines-stock/${id}`);
        return response.data;
    },
    editMedicine: async (id: string, medicine: Medicine) => {
        const response = await AdminApi.put(`/api/medicines-stock/${id}`, medicine);
        return response.data;
    }
}