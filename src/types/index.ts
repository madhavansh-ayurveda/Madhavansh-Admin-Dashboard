// User interface representing the structure of a user object
export interface User {
    _id: string;                // Unique identifier for the user
    name: string;               // Name of the user
    email: string;              // Email address of the user
    password?: string;          // Password (optional, not exposed in API)
    age?: number;               // Age of the user (optional)
    contact: string;            // Contact number of the user
    isVerified: boolean;        // Verification status of the user
    createdAt: string;          // Timestamp of user creation
    updatedAt?: string;         // Timestamp of last update (optional)
} 


export interface DashboardStats {
    totalPatients: number;
    totalDoctors: number;
    totalConsultations: number;
    totalRevenue: number;
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
