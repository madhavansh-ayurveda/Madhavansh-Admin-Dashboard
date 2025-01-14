import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuButtonClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="mx-auto px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}