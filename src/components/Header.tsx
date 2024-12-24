import { Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authAdminApi } from '@/api/authAdminApi'

interface HeaderProps {
    onMenuButtonClick: () => void
}

export default function Header({ onMenuButtonClick }: HeaderProps) {
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await authAdminApi.logout()
            navigate('/login', { replace: true })
        } catch (error) {
            console.error('Logout failed:', error)
            navigate('/login', { replace: true })
        }
    }

    return (
        <header className="bg-white border-b border-gray-200 h-16">
            <div className="flex items-center justify-between px-6 h-full">
                <button
                    onClick={onMenuButtonClick}
                    className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}