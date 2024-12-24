import { useEffect, useState } from 'react'
import { adminApi } from '@/api/adminApi'
import { Card } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'

interface ApiResponse {
    success: boolean;
    count: number;
    data: Consultation[];
}

interface Consultation {
    amount: number;
    consultationType: 'General Consultation' | 'Follow-up' | 'Specific Treatment' | 'Emergency';
    createdAt: string;
    _id: string;
    patient: {
        _id: string;
        name: string;
        email: string;
    };
    doctorId: string;
    date: string;
    timeSlot: string;
    symptoms: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    prescription: {
        medicines: Array<{
            name: string;
            dosage: string;
            duration: string;
        }>;
        instructions?: string;
    };
    paymentStatus: 'pending' | 'completed' | 'refunded';
    updatedAt: string;
    __v: number;
}

export default function Consultations() {
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchConsultations = async () => {
            try {
                const response = await adminApi.getAllConsultations()
                console.log('response', response);

                if (response.data) {
                    setConsultations(response.data)
                } else {
                    setConsultations(response)
                }
            } catch (error) {
                console.error('Error fetching consultations:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchConsultations()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'confirmed':
                return 'bg-blue-100 text-blue-800'
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Consultations Management</h1>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {consultations && consultations.length > 0 && consultations.map((consultation) => (
                            <TableRow key={consultation._id}>
                                <TableCell>{consultation.patient.name}</TableCell>
                                <TableCell>Dr. {consultation.doctorId}</TableCell>
                                <TableCell>{consultation.consultationType}</TableCell>
                                <TableCell>
                                    {new Date(consultation.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{consultation.timeSlot}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(consultation.status)}`}>
                                        {consultation.status}
                                    </span>
                                </TableCell>
                                <TableCell>₹{consultation.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
} 