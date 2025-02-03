import { useEffect, useState, useRef, useCallback } from "react";
import { adminApi } from "@/api/adminApi";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { CheckCheck } from "lucide-react";
import ConsultationTable from "@/components/consultations/consultationTable";

export interface Consultation {
  _id: string;
  amount: number;
  discount?: {
    dtype: string;
    value: number;
    amount: number;
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
  paymentStatus: "pending" | "completed" | "refunded";
  updatedAt: string;
  __v: number;
}

export default function Consultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [isSearch, setIsSearch] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [shouldFetch, setShouldFetch] = useState(true);
  const [filteredCleared, setFilterCleared] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        inputRef.current?.blur();
      }
    };

    // Add the event listener to the document
    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const fetchConsultations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllConsultations(
        currentPage,
        itemsPerPage,
        searchTerm,
        selectedStatus,
        selectedTypes,
        startDate,
        endDate
      );

      if (response.success) {
        setConsultations(response.data);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
    if (filteredCleared) setShouldFetch(false);
  }, []);
  useEffect(() => {
    if (!shouldFetch) return;
    fetchConsultations();
  }, [
    currentPage,
    selectedStatus,
    selectedTypes,
    startDate,
    endDate,
    searchTerm,
    itemsPerPage,
  ]);

  const clearFilters = () => {
    setSelectedStatus(undefined);
    setSelectedTypes([]);
    setStartDate(undefined);
    setEndDate(undefined);
    setIsSearch("");
    setSearchTerm("");
    setItemsPerPage(10);
    setFilterCleared(true);
  };

  // const handleCompleteConsultation = async (id: string) => {
  //   // Mark consultation as completed
  //   await adminApi.completeConsultation(id);

  //   // Trigger feedback form
  //   // You can use a modal or a separate component to show the feedback form
  //   setShowFeedbackForm(true); // Assuming you have a state to control the feedback form visibility
  // };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow space-y-6 p-4">
        <h1 className="text-xl md:text-2xl font-semibold">Consultations</h1>
        {/* Search Filters */}
        <div className="flex gap-4 flex-wrap items-center">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search by ID, name, doctor, email or contact (Press Enter or click Search)"
            value={isSearch}
            onChange={(e) => {
              setIsSearch(e.target.value);
              setShouldFetch(true);
            }}
            className="w-full md:w-1/2 lg:w-1/5"
          />
          <Button
            onClick={() => {
              setSearchTerm(isSearch);
              setShouldFetch(true);
            }}
            className="text-sm md:text-base"
          >
            Search
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["pending", "confirmed", "completed", "cancelled"].map(
                (status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatus === status}
                    onCheckedChange={(checked) => {
                      setSelectedStatus(checked ? status : undefined);
                      setShouldFetch(true);
                    }}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-2 items-center">
            <span className="text-sm">Items per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setShouldFetch(true);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent className="w-[50px]">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => {
              if (shouldFetch) clearFilters();
            }}
            variant="outline"
            className="text-sm md:text-base"
          >
            Clear Filters
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm md:text-base"
          >
            {showFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
          </Button>

          {showFilters && (
            <Card className="w-full p-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-4 flex-wrap items-center">
                  <label htmlFor="startDate" className="min-w-[80px]">
                    Start Date:
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setShouldFetch(true);
                    }}
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-4 flex-wrap items-center">
                  <label htmlFor="endDate" className="min-w-[80px]">
                    End Date:
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setShouldFetch(true);
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card className="overflow-x-auto">
          <div className="relative overflow-y-auto max-h-[70vh] ">
            <ConsultationTable data={consultations} />
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4 mt-auto">
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="text-sm md:text-base"
          >
            Previous
          </Button>
          <span className="text-sm md:text-base">Page {currentPage}</span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="text-sm md:text-base"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
