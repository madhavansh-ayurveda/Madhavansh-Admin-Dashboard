"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { adminApi } from "@/api/adminApi";
import AccessDenied from "@/components/AccessDenied";
// import Cookies from "js-cookie";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const roles = [
  { name: "Admin", value: "admin" },
  { name: "Content Manager", value: "content_manager" },
];

const allPermissions = [
  { id: "users", label: "Users Management" },
  { id: "doctors", label: "Doctors Management" },
  { id: "consultations", label: "Consultations" },
  { id: "medicine", label: "Medicine" },
  { id: "blog", label: "Blog" },
  { id: "admin", label: "Admin Access" },
];

type Admin = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  permissions: string[];
};

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  const userRole = localStorage.getItem("role");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);

  // Check permissions
  const hasAdminPermission =
    permissions?.includes("admin") || userRole === "super_admin";

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAdmins(admins);
    } else {
      const filtered = admins.filter(
        (admin) =>
          admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAdmins(filtered);
    }
  }, [searchQuery, admins]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllAdmins();
      setAdmins(response.data);
      setFilteredAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to load administrators. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleAddAdmin = async () => {
    try {
      const newAdmin = {
        name,
        email,
        phone,
        role,
        password,
        permissions: selectedPermissions,
      };

      const response = await adminApi.createAdmin(newAdmin);
      // console.log(response);
      setAdmins((prev) => [...prev, response as Admin]);
      console.log(admins);

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding admin:", error);
      setError("Failed to add administrator. Please try again.");
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setName(admin.name);
    setEmail(admin.email);
    setPhone(admin.phone);
    setRole(admin.role);
    setSelectedPermissions(admin.permissions);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAdmin) return;

    try {
      // Update permissions via API
      await adminApi.updatePermissions(editingAdmin._id, selectedPermissions);

      // Update local state
      setAdmins((prev) =>
        prev.map((admin) =>
          admin._id === editingAdmin._id
            ? { ...admin, permissions: selectedPermissions }
            : admin
        )
      );

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating admin:", error);
      setError("Failed to update administrator. Please try again.");
    }
  };

  const confirmDeleteAdmin = (admin: Admin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      // Here you would add the API call to delete the admin
      // await adminApi.deleteAdmin(adminToDelete._id)

      // Update local state
      setAdmins((prev) =>
        prev.filter((admin) => admin._id !== adminToDelete._id)
      );
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error("Error deleting admin:", error);
      setError("Failed to delete administrator. Please try again.");
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("");
    setSelectedPermissions([]);
    setIsEditing(false);
    setEditingAdmin(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "content_manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getRoleDisplayName = (roleValue: string) => {
    const role = roles.find((r) => r.value === roleValue);
    return role ? role.name : roleValue;
  };

  return (
    <>
      {!hasAdminPermission ? (
        <AccessDenied />
      ) : (
        <div className="mx-auto py-6 px-4 max-w-6xl animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl tracking-tight font-semibold flex items-center gap-2 dark:text-white">
                <Shield size={20} className="text-muted-foreground" />
                Admin Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage administrators and their permissions
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>

              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus size={16} />
                    <span>Add Admin</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {isEditing ? "Edit Admin" : "Add New Admin"}
                    </DialogTitle>
                    <DialogDescription>
                      {isEditing
                        ? "Update permissions for this administrator"
                        : "Create a new administrator account with specific permissions"}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.doe@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={role}
                          onValueChange={setRole}
                          disabled={isEditing}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {!isEditing && (
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-base">Permissions</Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          Select the areas this administrator can access and
                          manage
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allPermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2 rounded-md border p-3 shadow-sm transition-colors hover:bg-accent"
                          >
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={selectedPermissions.includes(
                                permission.id
                              )}
                              onCheckedChange={() =>
                                togglePermission(permission.id)
                              }
                            />
                            <Label
                              htmlFor={`permission-${permission.id}`}
                              className="flex-1 cursor-pointer font-medium"
                            >
                              {permission.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="sm:justify-between">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      onClick={isEditing ? handleSaveEdit : handleAddAdmin}
                      disabled={!name || (!isEditing && !password) || !role}
                    >
                      {isEditing ? "Save Changes" : "Create Admin"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/15 text-destructive rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <div className="rounded-lg border bg-card shadow-sm">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-muted mb-4"></div>
                    <div className="h-4 w-48 bg-muted rounded"></div>
                  </div>
                </div>
              ) : filteredAdmins?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <UserPlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">
                    No administrators found
                  </h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    {searchQuery
                      ? "Try a different search term"
                      : "Get started by adding a new administrator"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsDialogOpen(true)}>
                      Add Admin
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Administrator</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Permissions
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAdmins.map((admin) => (
                        <TableRow key={admin._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(admin.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{admin.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {admin.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getRoleBadgeColor(admin.role)}`}
                            >
                              {getRoleDisplayName(admin.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1.5">
                              {admin.role === "super_admin" ? (
                                <span className="text-sm text-muted-foreground">
                                  All permissions / No Restriction
                                </span>
                              ) : admin.permissions?.length > 0 ? (
                                admin.permissions.map((permission) => (
                                  <TooltipProvider key={permission}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {permission}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {allPermissions.find(
                                          (p) => p.id === permission
                                        )?.label || permission}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  No permissions
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditAdmin(admin)}
                              >
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => confirmDeleteAdmin(admin)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
          </div>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {adminToDelete?.name}'s
                  administrator account. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAdmin}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </>
  );
}
