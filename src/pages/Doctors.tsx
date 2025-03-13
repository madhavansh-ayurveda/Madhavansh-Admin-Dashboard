import { useState, useEffect, useRef } from "react";
import { doctorApi, type Doctor, type CreateDoctorDto } from "@/api/doctorApi";
import AddDoctorForm from "@/components/doctors/AddDoctorForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Search, Plus, Edit, RefreshCw, UserPlus, Filter, X, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import {
  setCacheData,
  selectCacheData,
  clearCacheByPrefix,
  CACHE_DURATIONS,
} from "@/store/cacheSlice";
import { RootState } from "@/store";
import { toast } from "sonner";
import AccessDenied from "@/components/AccessDenied";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Doctors() {
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  const hasDoctorsPermission = permissions?.includes("doctors") || localStorage.getItem("role") === "super_admin";
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const dispatch = useDispatch();
  const cacheKey = `doctors_page_${currentPage}_search_${searchTerm}`;
  const cachedData = useSelector((state: RootState) =>
    selectCacheData(state, cacheKey, CACHE_DURATIONS.DOCTORS)
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (cachedData && !isRefreshing) {
        setDoctors(cachedData.data);
        setTotalPages(cachedData.totalPages || 1);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await doctorApi.getAllDoctors();
        setTotalPages(response.totalPages);
        setDoctors(response.data);

        dispatch(
          setCacheData({
            key: cacheKey,
            data: response.data,
            totalPages: Math.ceil(response.data.length / itemsPerPage),
          })
        );
      } catch (err) {
        setError("Failed to fetch doctors. Please try again later.");
        console.error("Error fetching doctors:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchDoctors();
  }, [cachedData, isRefreshing, cacheKey, dispatch, itemsPerPage]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "/" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === "Escape") {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // Filter doctors based on search term across all fields
  const filteredDoctors = doctors?.filter(
    (doctor) =>
      doctor?.name.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      doctor?.email.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      doctor?.phone.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      doctor?.specialization?.some((spec) =>
        spec.toLowerCase()?.includes(searchTerm.toLowerCase())
      ) ||
      doctor.department?.some((dept) =>
        dept.toLowerCase()?.includes(searchTerm.toLowerCase())
      )
  );

  const indexOfLastDoctor = currentPage * itemsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - itemsPerPage;
  const currentDoctors = filteredDoctors?.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );

  const handleAddDoctor = async (data: CreateDoctorDto) => {
    try {
      const newDoctor = await doctorApi.createDoctor(data);
      setDoctors((prev) => [newDoctor, ...prev]);
      dispatch(clearCacheByPrefix("doctors_")); // Clear all doctor-related cache
      setShowAddForm(false);
      toast.success("Doctor added successfully");
    } catch (err) {
      console.error("Error adding doctor:", err);
      toast.error("Failed to add doctor");
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      await doctorApi.deleteDoctor(id);
      setDoctors((prev) => prev.filter((doctor) => doctor._id !== id));
      dispatch(clearCacheByPrefix("doctors_"));
      toast.success("Doctor deleted successfully");
    } catch (err) {
      console.error("Error deleting doctor:", err);
      toast.error("Failed to delete doctor");
    } finally {
    }
  };

  const handleUpdateDoctor = async (data: CreateDoctorDto) => {
    try {
      if (!editingDoctor?._id) return;
      const updatedDoctor = await doctorApi.updateDoctor(
        editingDoctor._id,
        data
      );

      setDoctors((prev) =>
        prev.map((doc) => (doc._id === updatedDoctor._id ? updatedDoctor : doc))
      );
      dispatch(clearCacheByPrefix("doctors_"));
      setEditingDoctor(null);
      toast.success("Doctor updated successfully");
    } catch (err) {
      console.error("Error updating doctor:", err);
      toast.error("Failed to update doctor");
    }
  };

  const refreshData = () => {
    setIsRefreshing(true);
  };

  if (!hasDoctorsPermission) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Doctor Management
              </CardTitle>
              <CardDescription>
                View, add, edit, and manage all doctors in the system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={refreshData}
                      disabled={isLoading || isRefreshing}
                      className="rounded-full"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="sr-only">Refresh</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                onClick={() => setShowAddForm(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add New Doctor</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-0 space-y-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search doctors by name, email, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
                className="pl-9 w-full"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Specialization
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Department
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Experience
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSearchTerm("")}>
                  Clear filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Card>
            {isLoading ? (
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            ) : error ? (
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                    <X className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{error}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    There was a problem loading the doctors data.
                  </p>
                  <Button onClick={refreshData} className="mt-4">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Specialization</TableHead>
                      <TableHead className="hidden md:table-cell">Department</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Phone</TableHead>
                      <TableHead className="hidden xl:table-cell">Experience</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentDoctors?.length > 0 ? (
                      currentDoctors.map((doctor) => (
                        <TableRow key={doctor._id}>
                          <TableCell className="font-medium">{doctor.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {doctor.specialization?.slice(0, 2).map((spec, i) => (
                                <Badge key={i} variant="outline" className="bg-primary/5 text-primary">
                                  {spec}
                                </Badge>
                              ))}
                              {doctor.specialization?.length > 2 && (
                                <Badge variant="outline" className="bg-muted">
                                  +{doctor.specialization.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {doctor.department?.slice(0, 2).map((dept, i) => (
                                <Badge key={i} variant="secondary" className="bg-secondary/20">
                                  {dept}
                                </Badge>
                              ))}
                              {doctor.department?.length > 2 && (
                                <Badge variant="secondary" className="bg-muted">
                                  +{doctor.department.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {doctor.email}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {doctor.phone}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {doctor.experience} years
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setEditingDoctor(doctor)}
                                      className="h-8 w-8 text-primary"
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit doctor</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete Dr. {doctor.name}'s record. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleDeleteDoctor(doctor._id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {searchTerm ? (
                            <div className="flex flex-col items-center justify-center py-4">
                              <Search className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-lg font-medium">No doctors found</p>
                              <p className="text-sm text-muted-foreground">
                                No doctors match your search criteria
                              </p>
                              <Button 
                                variant="link" 
                                onClick={() => setSearchTerm("")}
                                className="mt-2"
                              >
                                Clear search
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <Stethoscope className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-lg font-medium">No doctors yet</p>
                              <p className="text-sm text-muted-foreground">
                                Get started by adding a new doctor
                              </p>
                              <Button 
                                variant="default" 
                                onClick={() => setShowAddForm(true)}
                                className="mt-4"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Doctor
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </CardContent>
        
        <CardFooter className="px-0 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Showing {currentDoctors?.length > 0 ? indexOfFirstDoctor + 1 : 0} to{" "}
            {Math.min(indexOfLastDoctor, filteredDoctors?.length)} of {filteredDoctors?.length} doctors
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i;
                  if (pageNum > totalPages) {
                    pageNum = totalPages - (4 - i);
                  }
                }
                
                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'pointer-events-none' : ''}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add New Doctor
            </DialogTitle>
            <DialogDescription>
              Fill in the details to add a new doctor to the system
            </DialogDescription>
          </DialogHeader>
          <AddDoctorForm
            onSubmit={handleAddDoctor}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingDoctor}
        onOpenChange={(open) => !open && setEditingDoctor(null)}
      >
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Doctor Details
            </DialogTitle>
            <DialogDescription>
              Update the information for Dr. {editingDoctor?.name}
            </DialogDescription>
          </DialogHeader>
          {editingDoctor && (
            <AddDoctorForm
              initialData={editingDoctor}
              onSubmit={handleUpdateDoctor}
              onCancel={() => setEditingDoctor(null)}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
