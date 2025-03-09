'use client'

import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { Toaster } from '@/components/ui/sonner'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
// import { ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from '@/hooks/use-theme'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const location = useLocation()
  const [pageTitle, setPageTitle] = useState("Dashboard")

  // Handle sidebar state based on screen size
  useEffect(() => {
    setMounted(true)
    
    // Close sidebar on mobile when route changes
    if (!isDesktop) {
      setSidebarOpen(false)
    }
  }, [isDesktop])

  // Set initial sidebar state based on screen size
  useEffect(() => {
    if (mounted) {
      setSidebarOpen(isDesktop)
    }
  }, [isDesktop, mounted])

  // Update page title based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setPageTitle('Dashboard');
    else {
      // Convert path to title (e.g., /medicine-stock -> Medicine Stock)
      const title = path.substring(1)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setPageTitle(title || 'Dashboard');
    }
  }, [location.pathname]);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="relative min-h-screen bg-background">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <div 
          className={cn(
            "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
            sidebarOpen ? "lg:pl-72" : "lg:pl-0"
          )}
        >
          <Header 
            onMenuButtonClick={() => setSidebarOpen(prev => !prev)} 
            sidebarOpen={sidebarOpen}
            pageTitle={pageTitle}
          />
          
          <main className="flex-1 p-4 md:p-6 pt-16 md:pt-20">
            <div className="mx-auto max-w-7xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Sidebar toggle for desktop */}
          {/* {mounted && isDesktop && (
            <div className="fixed bottom-6 left-6 z-50">
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "h-10 w-10 rounded-full shadow-md bg-background border-primary/20 transition-all duration-300",
                  !sidebarOpen && "rotate-180"
                )}
                onClick={() => setSidebarOpen(prev => !prev)}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </div>
          )} */}
        </div>

        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  )
}
