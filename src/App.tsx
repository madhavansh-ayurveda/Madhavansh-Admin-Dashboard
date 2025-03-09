import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Doctors from './pages/Doctors'
import Consultations from './pages/Consultations'
import ProtectedRoute from './components/ProtectedRoute'
import MedicineStock from './pages/MedicineStock'
import BlogList from './pages/Blog/BlogList'
import CreateBlogPost from './pages/Blog/CreateBlogPost'
import EditBlogPost from './pages/Blog/EditBlogPost'
import AdminManagement from './pages/AdminMangement'
import InvoicePreview from './pages/Invoice'

function App() {
    return (
        <Router>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path='/' element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/consultations" element={<Consultations />} />
                    <Route path="/admins" element={<AdminManagement />} />
                    <Route path="/medicine-stock" element={<MedicineStock />} />
                    <Route path="/blogs" element={<BlogList />} />
                    <Route path="/blogs/create" element={<CreateBlogPost />} />
                    <Route path="/blogs/edit/:id" element={<EditBlogPost />} />
                    <Route path="/invoice" element={<InvoicePreview />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App