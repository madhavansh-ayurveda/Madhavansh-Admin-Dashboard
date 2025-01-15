import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/api/adminApi";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { CheckCheck } from "lucide-react";
import ConsultationTable from "@/components/consultations/consultationTable";

export interface Consultation {
  _id: string;
  amount: number;
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
  contact: string;
  date: string;
  timeSlot: string;
  symptoms: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  prescription: {
    files?: string[];
    instructions?: string;
  };
  paymentStatus: "pending" | "completed" | "refunded";
  updatedAt: string;
  __v: number;
}

export default function Consultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  // const [editingConsultation, setEditingConsultation] =
    // useState<Consultation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [isSearch, setIsSearch] = useState<string>("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        const limit = 10;
        const response = await adminApi.getAllConsultations(
          currentPage,
          limit,
          searchTerm,
          selectedStatus,
          selectedTypes,
          startDate,
          endDate
        );
        setSelectedTypes;
        if (response.success) {
          setConsultations(response.data);
          setTotalPages(response.totalPages);
        }
      } catch (error) {
        console.error("Error fetching consultations:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log(isSearch);

    fetchConsultations();
  }, [
    currentPage,
    selectedStatus,
    selectedTypes,
    startDate,
    endDate,
    searchTerm,
  ]);


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
    <div className="flex flex-col min-h-[90vh]">
      <div className="flex-grow space-y-6 p-4">
        <h1 className="text-xl md:text-2xl font-semibold">
          Consultations Management
        </h1>

        {/* Search Filters */}
        <div className="flex gap-4 flex-wrap items-center">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search Consultations"
            value={isSearch}
            onChange={(e) => setIsSearch(e.target.value)}
            className="w-full md:w-1/2 lg:w-1/3"
          />

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
                    }}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="startdate flex gap-4 flex-wrap items-center">
            <label htmlFor=""> Start Date:</label>
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full md:w-1/2 lg:w-1/2"
            />
          </div>
          <div className=" flex gap-4 flex-wrap items-center">
            <label htmlFor=""> End Date:</label>
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full md:w-1/2 lg:w-1/2"
            />
          </div>
          <Button
            onClick={() => setSearchTerm(isSearch)}
            className="text-sm md:text-base"
          >
            Search
          </Button>
        </div>

        <Card className="overflow-x-auto">
          <div className="relative overflow-y-auto max-h-[60vh]">
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
