import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAdminApi } from '@/api/authAdminApi'

interface AdminUser {
    _id: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: AdminUser | null;
    loading: boolean;
    setUser: (user: AdminUser | null) => void;
    clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authAdminApi.checkAuth()
                setUser(userData.user)
            } catch (error) {
                console.error('Auth check failed:', error)
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [])

    const clearAuth = () => {
        setUser(null)
        localStorage.removeItem('token')
    }

    return (
        <AuthContext.Provider value={{ user, loading, setUser, clearAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 