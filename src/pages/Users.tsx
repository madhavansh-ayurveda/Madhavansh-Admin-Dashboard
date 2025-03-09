import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminApi } from "@/api/adminApi";
import { User } from "@/types";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  setCacheData,
  selectCacheData,
  CACHE_DURATIONS,
} from "@/store/cacheSlice";
import { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Filter } from "lucide-react";
import Cookies from "js-cookie";
import AccessDenied from "../components/AccessDenied";
export default function Users() {
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  if (!permissions?.includes("users") && Cookies.get("role") !== "super_admin") {
    return <AccessDenied />;
  }
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearch, setIsSearch] = useState<string>("");
  const [shouldFetch, setShouldFetch] = useState(true);
  const [filteredCleared, setFilterCleared] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    minAge: "",
    maxAge: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const cacheKey = `users_page_${currentPage}_search_${searchTerm}_filters_${JSON.stringify(
    filters
  )}`;
  const cachedData = useSelector((state: RootState) =>
    selectCacheData(state, cacheKey, CACHE_DURATIONS.USERS)
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (!shouldFetch) return;

    const fetchUsers = async () => {
      if (cachedData) {
        setUsers(cachedData.data);
        setTotalPages(cachedData.totalPages || 1);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await adminApi.getAllUsers(
          currentPage,
          itemsPerPage,
          searchTerm,
          filters.minAge ? parseInt(filters.minAge) : undefined,
          filters.maxAge ? parseInt(filters.maxAge) : undefined,
          filters.startDate,
          filters.endDate
        );
        setUsers(response.data);
        setTotalPages(response.totalPages);

        dispatch(
          setCacheData({
            key: cacheKey,
            data: response.data,
            totalPages: response.totalPages,
          })
        );
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
      if (filteredCleared) setShouldFetch(false);
    };

    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [
    currentPage,
    searchTerm,
    filters,
    dispatch,
    cachedData,
    itemsPerPage,
    shouldFetch,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(isSearch);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setShouldFetch(true);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    if (shouldFetch) {
      setFilters({
        minAge: "",
        maxAge: "",
        startDate: "",
        endDate: "",
      });
      setIsSearch("");
      setSearchTerm("");
      setFilterCleared(true);
      setCurrentPage(1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen dark:text-white" onKeyDown={handleKeyDown}>
      <div className="flex-grow space-y-6 p-4">
        <h1 className="text-xl md:text-2xl font-semibold">Users Management</h1>
        <div className="flex gap-4 flex-wrap items-center">
          <Input
            type="text"
            placeholder="Search by name, email or contact (Press Enter or click Search)"
            value={isSearch}
            ref={searchInputRef}
            onChange={(e) => {
              setIsSearch(e.target.value);
              setShouldFetch(true);
            }}
            className="w-full md:w-1/2 lg:w-1/3"
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
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm md:text-base"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Min Age
                </label>
                <Input
                  type="number"
                  name="minAge"
                  value={filters.minAge}
                  onChange={(e) => {
                    handleFilterChange(e);
                    setShouldFetch(true);
                  }}
                  placeholder="Min Age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Max Age
                </label>
                <Input
                  type="number"
                  name="maxAge"
                  value={filters.maxAge}
                  onChange={(e) => {
                    handleFilterChange(e);
                    setShouldFetch(true);
                  }}
                  placeholder="Max Age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={(e) => {
                    handleFilterChange(e);
                    setShouldFetch(true);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={(e) => {
                    handleFilterChange(e);
                    setShouldFetch(true);
                  }}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-sm md:text-base"
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="text-center">Loading users...</div>
        ) : (
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Contact
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Age</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users?.map((user) => (
                    <TableRow key={user._id} className="text-sm md:text-base">
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email || " NA "}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {user.contact}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.age || " NA "}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex flex-col min-w-[100px] border-b sm:flex-row gap-2 md:gap-5 lg:gap-8 items-start sm:items-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => {
                                // setSelectedUser(user);
                                setUpdatedUser(user);
                              }}
                            >
                              View More
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                            <DialogHeader>
                              <DialogTitle className="text-lg md:text-xl">
                                User Details
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {updatedUser && (
                                <>
                                  <label>
                                    <strong>Name:</strong>
                                    <Input
                                      value={updatedUser.name}
                                      onChange={(e) =>
                                        setUpdatedUser({
                                          ...updatedUser,
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label>
                                    <strong>Email:</strong>
                                    <Input
                                      type="email"
                                      value={updatedUser.email}
                                      onChange={(e) =>
                                        setUpdatedUser({
                                          ...updatedUser,
                                          email: e.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label>
                                    <strong>Contact:</strong>
                                    <Input
                                      value={updatedUser.contact}
                                      onChange={(e) =>
                                        setUpdatedUser({
                                          ...updatedUser,
                                          contact: e.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label>
                                    <strong>Age:</strong>
                                    <Input
                                      type="number"
                                      value={updatedUser.age || ""}
                                      onChange={(e) =>
                                        setUpdatedUser({
                                          ...updatedUser,
                                          age: Number(e.target.value),
                                        })
                                      }
                                    />
                                  </label>
                                  <Button
                                    className="w-[150px]"
                                    onClick={() => {}}
                                  >
                                    Update User
                                  </Button>
                                </>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Trash2
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          // onClick={() =>
                          //   handleDeleteConsultation(
                          //     consultation._id,
                          //     consultation.contact
                          //   )
                          // }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <p className="p-5 px-8">No Users found</p>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4 mt-auto">
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="text-sm md:text-base"
          >
            Previous
          </Button>
          <span className="text-sm md:text-base">
            Page {currentPage} of {totalPages}
          </span>
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
