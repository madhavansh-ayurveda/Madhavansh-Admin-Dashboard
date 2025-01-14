import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const loading = false;
    const user = useSelector((state: any) => state.auth.user);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
