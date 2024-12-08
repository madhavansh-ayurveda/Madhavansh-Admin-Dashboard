import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Doctors from './pages/Doctors'
import Consultations from './pages/Consultations'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <AuthProvider>
            <Router>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/doctors" element={<Doctors />} />
                        <Route path="/consultations" element={<Consultations />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App