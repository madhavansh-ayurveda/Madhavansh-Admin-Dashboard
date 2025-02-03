import { Medicine } from "@/types";
import { AdminApi } from "./axios";

export const medicineApi = {
    addMedicine: async (medicine: Medicine) => {
        const response = await AdminApi.post('/medicines-stock/', medicine);
        return response.data;
    },
    getMedicines: async () => {
        const response = await AdminApi.get('/medicines-stock');
        return response.data;
    },
    deleteMedicine: async (name: string) => {
        const response = await AdminApi.delete(`/medicines-stock/${name}`);
        return response.data;
    },
    editMedicine: async (id: string, medicine: Medicine) => {
        const response = await AdminApi.put(`/medicines-stock/${id}`, medicine);
        return response.data;
    }
}