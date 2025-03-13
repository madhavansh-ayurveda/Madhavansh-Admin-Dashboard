import { useEffect, useState, useRef, useCallback } from "react";
import { adminApi } from "@/api/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  SlidersHorizontal,
  Download,
  FileText,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConsultationTable from "@/components/consultations/consultationTable";
import AccessDenied from "@/components/AccessDenied";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { format } from "date-fns";

export interface Consultation {
  _id: string;
  amount: number;
  discount?: {
    discountType?: string;
    value?: number;
    amount?: number;
  };
  consultationType:
    | "General Consultation"
    | "Follow-up"
    | "Specific Treatment"
    | "Emergency";
  createdAt: string;
  name: string;
  email: string;
  doctor: {
    doctorName: string;
    doctorId: string;
  };
  department: string;
  contact: string;
  date: string;
  mode: string;
  timeSlot: string;
  symptoms: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  prescription: {
    files?: string[];
    instructions?: string;
  };
  additionalInfo?: {
    img?: string[];
    file?: string[];
  };
  feedbackStatus?: "pending" | "sent" | "submitted";
  scheduledFeedbackDate?: Date;
  feedbackId?: string;
  invoiceId?: string;
  paymentStatus: "pending" | "completed" | "refunded";
  updatedAt: string;
  __v: number;
}

export default function Consultations() {
  // Check permissions
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  const hasAccess =
    permissions?.includes("consultations") ||
    localStorage.getItem("role") === "super_admin";

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [shouldFetch, setShouldFetch] = useState(true);
  const [activeView, setActiveView] = useState<string>("all");
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    totalRevenue: 0,
  });

  setStats;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === "Escape") {
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Check if any filter is applied
  useEffect(() => {
    setIsFilterApplied(
      !!selectedStatus ||
        selectedTypes?.length > 0 ||
        !!startDate ||
        !!endDate ||
        !!debouncedSearchQuery
    );
  }, [selectedStatus, selectedTypes, startDate, endDate, debouncedSearchQuery]);

  // Fetch consultations based on filters and pagination
  const fetchConsultations = useCallback(async () => {
    if (!shouldFetch) return;

    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.getAllConsultations(
        currentPage,
        itemsPerPage,
        debouncedSearchQuery,
        selectedStatus,
        selectedTypes,
        startDate,
        endDate
      );

      if (response.success) {
        setConsultations(response.data);
        setTotalPages(response.totalPages);
        setTotalConsultations(response.totalCount || 0);
      } else {
        setError("Failed to load consultations. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
      setError("An error occurred while fetching consultations.");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    selectedStatus,
    selectedTypes,
    startDate,
    endDate,
    shouldFetch,
  ]);

  // Fetch consultations when dependencies change
  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    // try {
    // This is a placeholder - you would implement this API endpoint
    const response = await adminApi.getConsultationStats();
    console.log(response);

    //   if (response.success) {
    //     setStats(response.data)
    //   }
    // } catch (error) {
    //   console.error("Error fetching stats:", error)
    // }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle view change
  const handleViewChange = (view: string) => {
    setActiveView(view);

    // Apply appropriate filters based on view
    if (view === "all") {
      setSelectedStatus(undefined);
    } else if (view === "today") {
      const today = new Date();
      setStartDate(format(today, "yyyy-MM-dd"));
      setEndDate(format(today, "yyyy-MM-dd"));
    } else {
      setSelectedStatus(view);
    }

    setCurrentPage(1);
    setShouldFetch(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedStatus(undefined);
    setSelectedTypes([]);
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setActiveView("all");
    setCurrentPage(1);
    setShouldFetch(true);
  };

  // Export consultations
  const exportConsultations = () => {
    // This would be implemented to export data to CSV/Excel
    console.log("Export consultations");
  };

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return (
    <div className=" mx-auto max-w-[2000px] animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="dark:text-white">
          <h1 className="text-xl font-semibold flex items-center gap-2 tracking-tight">
            Consultation Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View and manage patient consultations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={exportConsultations}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export consultations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Consultation Statistics</SheetTitle>
                <SheetDescription>
                  Overview of consultation metrics and performance
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Consultations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ₹{stats.totalRevenue.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-sm font-medium text-muted-foreground mt-6 mb-3">
                  Status Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-sm">Pending</span>
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    >
                      {stats.pending}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-sm">Confirmed</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                    >
                      {stats.confirmed}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-sm">Completed</span>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      {stats.completed}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-sm">Cancelled</span>
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-800 hover:bg-red-100"
                    >
                      {stats.cancelled}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-sm font-medium text-muted-foreground mt-6 mb-3">
                  Time Period
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-3 border rounded-md">
                    <span className="text-sm text-muted-foreground mb-1">
                      Today
                    </span>
                    <span className="text-lg font-semibold">
                      {stats.todayCount}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 border rounded-md">
                    <span className="text-sm text-muted-foreground mb-1">
                      This Week
                    </span>
                    <span className="text-lg font-semibold">
                      {stats.weekCount}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 border rounded-md">
                    <span className="text-sm text-muted-foreground mb-1">
                      This Month
                    </span>
                    <span className="text-lg font-semibold">
                      {stats.monthCount}
                    </span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card className="md:col-span-5">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by ID, name, doctor, email or contact... (Ctrl + /)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-10 w-full"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Filters</span>
                      {isFilterApplied && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          {selectedTypes?.length +
                            (selectedStatus ? 1 : 0) +
                            (startDate ? 1 : 0) +
                            (endDate ? 1 : 0) +
                            (debouncedSearchQuery ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Consultations</SheetTitle>
                      <SheetDescription>
                        Narrow down consultations based on specific criteria
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "pending",
                            "confirmed",
                            "completed",
                            "cancelled",
                          ].map((status) => (
                            <div
                              key={status}
                              className={`flex items-center justify-center p-2 border rounded-md cursor-pointer transition-colors ${
                                selectedStatus === status
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() =>
                                setSelectedStatus(
                                  selectedStatus === status ? undefined : status
                                )
                              }
                            >
                              <span className="text-sm capitalize">
                                {status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">
                          Consultation Type
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "General Consultation",
                            "Follow-up",
                            "Specific Treatment",
                            "Emergency",
                          ].map((type) => (
                            <div
                              key={type}
                              className={`flex items-center justify-between p-2 border rounded-md cursor-pointer transition-colors ${
                                selectedTypes.includes(type)
                                  ? "bg-primary/10 border-primary"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => {
                                setSelectedTypes((prev) =>
                                  prev.includes(type)
                                    ? prev.filter((t) => t !== type)
                                    : [...prev, type]
                                );
                              }}
                            >
                              <span className="text-sm">{type}</span>
                              {selectedTypes.includes(type) && (
                                <Badge variant="secondary">Selected</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Date Range</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="startDate"
                              className="text-sm text-muted-foreground"
                            >
                              Start Date
                            </label>
                            <Input
                              id="startDate"
                              type="date"
                              value={startDate || ""}
                              onChange={(e) =>
                                setStartDate(e.target.value || undefined)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="endDate"
                              className="text-sm text-muted-foreground"
                            >
                              End Date
                            </label>
                            <Input
                              id="endDate"
                              type="date"
                              value={endDate || ""}
                              onChange={(e) =>
                                setEndDate(e.target.value || undefined)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Items per page</h3>
                        <Select
                          value={itemsPerPage.toString()}
                          onValueChange={(value) =>
                            setItemsPerPage(Number(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="10" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <SheetFooter>
                      <Button variant="outline" onClick={clearFilters}>
                        Reset Filters
                      </Button>
                      <SheetClose asChild>
                        <Button onClick={() => setShouldFetch(true)}>
                          Apply Filters
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                {isFilterApplied && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}

                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                    setShouldFetch(true);
                  }}
                >
                  <SelectTrigger className="w-[150px] h-10">
                    <span className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 inline mr-1" />
                      <span>{itemsPerPage} rows</span>
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 rows</SelectItem>
                    <SelectItem value="10">10 rows</SelectItem>
                    <SelectItem value="20">20 rows</SelectItem>
                    <SelectItem value="50">50 rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <Tabs
            defaultValue="all"
            value={activeView}
            onValueChange={handleViewChange}
            className="px-6"
          >
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">
                Pending
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="text-xs sm:text-sm">
                Confirmed
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                Completed
              </TabsTrigger>
              <TabsTrigger value="today" className="text-xs sm:text-sm">
                Today
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <>
                {consultations?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">
                      No consultations found
                    </h3>
                    <p className="text-muted-foreground text-center max-w-sm mb-6">
                      {isFilterApplied
                        ? "Try adjusting your filters or search criteria to find what you're looking for."
                        : "There are no consultations in the system yet."}
                    </p>
                    {isFilterApplied && (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="relative overflow-x-auto">
                    <ConsultationTable data={consultations} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pagination */}
      {!loading && consultations?.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalConsultations)} of{" "}
            {totalConsultations} consultations
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setCurrentPage((prev) => Math.max(prev - 1, 1));
                setShouldFetch(true);
              }}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                setShouldFetch(true);
              }}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
