"use client";

import type React from "react";

import {
  Menu,
  Bell,
  Search,
  X,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authAdminApi } from "@/api/authAdminApi";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

interface HeaderProps {
  onMenuButtonClick: () => void;
  sidebarOpen: boolean;
  pageTitle?: string;
}
type Theme = "light" | "dark" | "system";

export default function Header({
  onMenuButtonClick,
  sidebarOpen,
}: HeaderProps) {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<
    {
      id: string;
      title: string;
      message: string;
      read: boolean;
      time: string;
    }[]
  >([]);
  const [adminName, setAdminName] = useState<string>("Admin");
  const [adminInitials, setAdminInitials] = useState<string>("AD");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Get admin name from localStorage
    const storedName = localStorage.getItem("adminName");
    if (storedName) {
      setAdminName(storedName);
      setAdminInitials(getInitials(storedName));
    }

    // Mock notifications - in a real app, fetch these from an API
    setNotifications([
      {
        id: "1",
        title: "New Consultation",
        message: "A new consultation has been scheduled for Dr. Sharma",
        read: false,
        time: "10 min ago",
      },
      {
        id: "2",
        title: "User Registration",
        message: "New user Rajesh Kumar registered on the platform",
        read: false,
        time: "1 hour ago",
      },
      {
        id: "3",
        title: "System Update",
        message: "System will be updated tonight at 2 AM for maintenance",
        read: true,
        time: "Yesterday",
      },
      {
        id: "4",
        title: "Medicine Stock Alert",
        message: "Ashwagandha powder is running low in inventory",
        read: true,
        time: "2 days ago",
      },
    ]);
  }, []);

  useEffect(() => {
    // Focus search input when shown
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    try {
      await authAdminApi.logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login", { replace: true });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement global search functionality
    console.log("Searching for:", searchQuery);
    // Reset search after submission
    setSearchQuery("");
    setShowSearch(false);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        sidebarOpen ? "lg:pl-72" : "lg:pl-0",
        "transition-all duration-300 ease-in-out dark:text-white"
      )}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuButtonClick}
            className="lg:hidden rounded-full hover:bg-primary/10"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <AnimatePresence mode="wait">
            {!showSearch && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden md:block"
              >
                <h1 className="text-lg font-semibold">Ayurveda Admin</h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <AnimatePresence mode="wait">
            {showSearch ? (
              <motion.form
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md"
                onSubmit={handleSearch}
              >
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search for patients, doctors, medicines..."
                  className="pr-8 border-primary/20 focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowSearch(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSearch(true)}
                  aria-label="Search"
                  className="rounded-full border-primary/20 hover:bg-primary/5"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-primary/20 hover:bg-primary/5"
              >
                {theme === "light" && <Sun className="h-4 w-4" />}
                {theme === "dark" && <Moon className="h-4 w-4" />}
                {theme === "system" && <Laptop className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as Theme)}
              >
                {" "}
                <DropdownMenuRadioItem value="light">
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-full border-primary/20 hover:bg-primary/5"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadNotificationsCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs hover:bg-primary/5"
                    onClick={markAllNotificationsAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                <div className="max-h-[300px] overflow-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="cursor-pointer flex flex-col items-start p-3 focus:bg-primary/5"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div
                          className={cn(
                            "h-2 w-2 mt-1.5 rounded-full flex-shrink-0",
                            notification.read ? "bg-muted" : "bg-primary"
                          )}
                        />
                        <div className="space-y-1 w-full">
                          <div className="flex justify-between items-start w-full">
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No notifications
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer justify-center text-primary text-sm hover:bg-primary/5"
                onClick={() => navigate("/notifications")}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/5"
              >
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {adminInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {adminName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@ayurveda.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button
                  className="w-full flex cursor-pointer"
                  onClick={() => navigate("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  className="w-full flex cursor-pointer"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </button>
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
      </div>
    </header>
  );
}
