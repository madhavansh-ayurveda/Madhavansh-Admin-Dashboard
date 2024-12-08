import { useState } from 'react'
import { doctorApi, type Doctor, type CreateDoctorDto } from '@/api/doctorApi'
import AddDoctorForm from '@/components/doctors/AddDoctorForm'

export default function Doctors() {
    const [showAddForm, setShowAddForm] = useState(false)
    const [doctors, setDoctors] = useState<Doctor[]>([])

    const handleAddDoctor = async (data: CreateDoctorDto) => {
        const newDoctor = await doctorApi.createDoctor(data)
        setDoctors(prev => [newDoctor, ...prev])
        setShowAddForm(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Doctors Management</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                    Add New Doctor
                </button>
            </div>

            {showAddForm && (
                <AddDoctorForm
                    onSubmit={handleAddDoctor}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {/* Rest of your doctors list table */}
            <div className="mt-6">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Specialization</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map(doctor => (
                            <tr key={doctor._id}>
                                <td>{doctor.name}</td>
                                <td>{doctor.specialization}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 