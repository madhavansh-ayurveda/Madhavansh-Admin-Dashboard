import { AdminApi } from "./axios";

export const invoiceApi = {
  genearteInvoice: async () => {
    const response = await AdminApi.post("/consultations/invoices/generate", {
      patient: "67a1b4e555dfd79c97f8bb93",
      consultation: { selected: true, doctor: "Dr. Smith", fee: 50 },
      medicines: [{ name: "Paracetamol", quantity: 2, price: 5, total: 10 }],
      subTotal: 60,
      tax: 5,
      grandTotal: 65,
    });
    return response.data;
  },
};
