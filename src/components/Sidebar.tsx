"use client"

import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { Users, Calendar, Settings, Stethoscope, X, Pill, BookOpen, UserCheck2, LayoutDashboard, MessageSquare, LogOut } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { authAdminApi } from "@/api/authAdminApi"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  permission: string
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: "" },
  { name: "Users", href: "/users", icon: Users, permission: "users" },
  { name: "Doctors", href: "/doctors", icon: Stethoscope, permission: "doctors" },
  { name: "Consultations", href: "/consultations", icon: Calendar, permission: "consultations" },
  { name: "Medicine Inventory", href: "/medicine-stock", icon: Pill, permission: "medicine" },
  { name: "Blog Posts", href: "/blogs", icon: BookOpen, permission: "blog" },
  { name: "Admins", href: "/admins", icon: UserCheck2, permission: "admin" },
  { name: "Feedback", href: "/feedback", icon: MessageSquare, permission: "feedback" },
  { name: "Settings", href: "/settings", icon: Settings, permission: "" },
]

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [permissions, setPermissions] = useState<string[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [adminName, setAdminName] = useState<string>("Admin")
  const [adminInitials, setAdminInitials] = useState<string>("AD")
  // const [mounted, setMounted] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  // const [activeGroup, setActiveGroup] = useState<string | null>(null)

  useEffect(() => {
    // setMounted(true)

    try {
      // Get permissions from localStorage
      const storedPermissions = JSON.parse(localStorage.getItem("permissions") || "[]")
      setPermissions(storedPermissions)

      // Get role from localStorage
      const storedRole = localStorage.getItem("role")
      setRole(storedRole)

      // Get admin name from localStorage
      const storedName = localStorage.getItem("adminName")
      if (storedName) {
        setAdminName(storedName)
        setAdminInitials(getInitials(storedName))
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage:", error)
    }
  }, [])

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleLogout = async () => {
    try {
      await authAdminApi.logout()
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Logout failed:", error)
      navigate("/login", { replace: true })
    }
  }

  const filteredNavigation = navigation.filter((item) => {
    return role === "super_admin" || !item.permission || permissions.includes(item.permission)
  })

  // Group navigation items for visual organization
  const navGroups = [
    {
      id: "main",
      items: filteredNavigation.filter(item => 
        ["Dashboard", "Users", "Doctors", "Consultations"].includes(item.name)
      )
    },
    {
      id: "content",
      title: "Content",
      items: filteredNavigation.filter(item => 
        ["Medicine Inventory", "Blog Posts"].includes(item.name)
      )
    },
    {
      id: "admin",
      title: "Administration",
      items: filteredNavigation.filter(item => 
        ["Admins", "Feedback", "Settings"].includes(item.name)
      )
    }
  ]

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {open && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-gradient-to-b from-card to-background border-r shadow-lg",
          "flex flex-col lg:translate-x-0 transition-transform duration-300 ease-in-out",
          !open && !isDesktop && "-translate-x-full",
        )}
        initial={false}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b bg-card/80 backdrop-blur-sm">
          <Link to="/" className="flex items-center gap-3" onClick={() => !isDesktop && setOpen(false)}>
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center">
              <img src="/Madhav-Ayurveda-Logo.png" alt="Logo" className="h-6 w-6 object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Shree Madhavansh</span>
              <span className="text-xs text-muted-foreground">Ayurveda Admin</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="lg:hidden rounded-full hover:bg-primary/10"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4 px-2">
          <nav className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.id} className="space-y-2">
                {group.title && (
                  <h3 className="text-xs font-medium text-muted-foreground px-4 uppercase tracking-wider">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => !isDesktop && setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-all duration-200",
                          "hover:bg-primary/10 hover:text-primary",
                          isActive 
                            ? "bg-primary/15 text-primary font-medium shadow-sm" 
                            : "text-muted-foreground",
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <div className={cn(
                          "flex items-center justify-center h-8 w-8 rounded-md",
                          isActive ? "bg-primary/20 text-primary" : "text-muted-foreground"
                        )}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span>{item.name}</span>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User profile */}
        <div className="border-t p-4 bg-card/50 backdrop-blur-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 py-6 h-auto hover:bg-primary/5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{adminInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{adminName}</span>
                    <span className="text-xs text-muted-foreground capitalize">{role || "Admin"}</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <UserCheck2 className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    </>
  )
}
