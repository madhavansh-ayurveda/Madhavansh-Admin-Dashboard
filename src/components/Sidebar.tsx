// import React from 'react'
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  Settings,
  Stethoscope,
  X,
  Pill,
} from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Users", href: "/users", icon: Users },
  { name: "Doctors", href: "/doctors", icon: Stethoscope },
  { name: "Consultations", href: "/consultations", icon: Calendar },
  { name: "Medicine Stock", href: "/medicine-stock", icon: Pill },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-gray-600 bg-opacity-75 z-50 transition-opacity lg:hidden",
          open
            ? "opacity-100 ease-out duration-300"
            : "opacity-0 ease-in duration-200 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 flex flex-col w-56 bg-white border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          open ? "translate-x-0" : "-translate-x-full",
          "z-50"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/Madhav-Ayurveda-Logo.png"
              alt="Logo"
              className="h-8 w-8"
            />
            <span className="text-lg text-[#003366] font-semibold text-center tracking-tight">
              Madhavansh Ayurveda
            </span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
