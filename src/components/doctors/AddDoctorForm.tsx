// import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { CreateDoctorDto } from '@/api/doctorApi'

interface AddDoctorFormProps {
    onSubmit: (data: CreateDoctorDto) => Promise<void>
    onCancel: () => void
}

export default function AddDoctorForm({ onSubmit, onCancel }: AddDoctorFormProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateDoctorDto>()

    const specializations = ['Ayurveda', 'Panchakarma', 'Yoga', 'General']

    const onFormSubmit = async (data: CreateDoctorDto) => {
        try {
            await onSubmit(data)
            toast.success('Doctor added successfully')
        } catch (error) {
            toast.error('Failed to add doctor')
            console.error('Add doctor error:', error)
        }
    }

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Doctor</h2>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            {...register('password', { required: 'Password is required', minLength: 6 })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                            {...register('phone', { required: 'Phone is required' })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm">{errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Specialization</label>
                        <select
                            {...register('specialization', { required: 'Specialization is required' })}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select Specialization</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                        {errors.specialization && (
                            <p className="text-red-500 text-sm">{errors.specialization.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Qualification</label>
                        <input
                            {...register('qualification', { required: 'Qualification is required' })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.qualification && (
                            <p className="text-red-500 text-sm">{errors.qualification.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Experience (years)</label>
                        <input
                            type="number"
                            {...register('experience', { required: 'Experience is required', min: 0 })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.experience && (
                            <p className="text-red-500 text-sm">{errors.experience.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Registration Number</label>
                        <input
                            {...register('registrationNumber', { required: 'Registration number is required' })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.registrationNumber && (
                            <p className="text-red-500 text-sm">{errors.registrationNumber.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                        {...register('bio')}
                        className="w-full p-2 border rounded"
                        rows={4}
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Doctor'}
                    </button>
                </div>
            </form>
        </Card>
    )
} 