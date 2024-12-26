import { useState, useEffect } from 'react'
import { doctorApi, type Doctor, type CreateDoctorDto } from '@/api/doctorApi'
import AddDoctorForm from '@/components/doctors/AddDoctorForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function Doctors() {
    const [showAddForm, setShowAddForm] = useState(false)
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await doctorApi.getAllDoctors()
            console.log(response.data)
            setDoctors(response.data)
        } catch (err) {
            setError('Failed to fetch doctors. Please try again later.')
            console.error('Error fetching doctors:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddDoctor = async (data: CreateDoctorDto) => {
        try {
            const newDoctor = await doctorApi.createDoctor(data)
            setDoctors(prev => [newDoctor, ...prev])
            setShowAddForm(false)
        } catch (err) {
            console.error('Error adding doctor:', err)
            // You might want to show an error message to the user here
        }
    }

    const handleUpdateDoctor = async (data: CreateDoctorDto) => {
        try {
            if (!editingDoctor?._id) return;
            const updatedDoctor = await doctorApi.updateDoctor(editingDoctor._id, data);
            setDoctors(prev => prev.map(doc => 
                doc._id === updatedDoctor._id ? updatedDoctor : doc
            ));
            setEditingDoctor(null);
        } catch (err) {
            console.error('Error updating doctor:', err);
            // Add error handling here
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>
    }

    if (error) {
        return (
            <div className="text-red-600 flex justify-center items-center h-64">
                {error}
                <button 
                    onClick={fetchDoctors}
                    className="ml-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                    Retry
                </button>
            </div>
        )
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

            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Doctor</DialogTitle>
                    </DialogHeader>
                    <AddDoctorForm
                        onSubmit={handleAddDoctor}
                        onCancel={() => setShowAddForm(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingDoctor} onOpenChange={(open) => !open && setEditingDoctor(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Doctor Details</DialogTitle>
                    </DialogHeader>
                    {editingDoctor && (
                        <AddDoctorForm
                            initialData={editingDoctor}
                            onSubmit={handleUpdateDoctor}
                            onCancel={() => setEditingDoctor(null)}
                            isEditing
                        />
                    )}
                </DialogContent>
            </Dialog>

            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {doctors.length > 0 && doctors.map(doctor => (
                            <tr key={doctor._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{doctor.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{doctor.specialization}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{doctor.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{doctor.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{doctor.experience}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingDoctor(doctor)}
                                    >
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 