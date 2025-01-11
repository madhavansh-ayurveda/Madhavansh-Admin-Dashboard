import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminApi } from "@/api/adminApi";
import { User } from "@/types";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { setCacheData, selectCacheData, CACHE_DURATIONS } from "@/store/cacheSlice";
import { RootState } from "@/store";
import { Button } from "@/components/ui/button";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const dispatch = useDispatch();
  const cacheKey = `users_page_${currentPage}_search_${searchTerm}`;
  const cachedData = useSelector((state: RootState) => 
    selectCacheData(state, cacheKey, CACHE_DURATIONS.USERS)
  );

  useEffect(() => {
    const fetchUsers = async () => {
      if (cachedData) {
        setUsers(cachedData.data);
        setTotalPages(cachedData.totalPages || 1);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await adminApi.getAllUsers(currentPage, itemsPerPage);
        setUsers(response.data);
        setTotalPages(response.totalPages);

        console.log(response);
        

        dispatch(setCacheData({
          key: cacheKey,
          data: response.data,
          totalPages: response.totalPages
        }));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchTerm, dispatch]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.age && user.age.toString().includes(searchTerm))
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow space-y-6 p-4">
        <h1 className="text-xl md:text-2xl font-semibold">Users Management</h1>
        <Input
          type="text"
          placeholder="Search Users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 lg:w-1/3"
        />

        {loading ? (
          <div className="text-center">Loading users...</div>
        ) : (
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Age</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user._id} className="text-sm md:text-base">
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email || " NA "}</TableCell>
                    <TableCell className="hidden sm:table-cell">{user.contact}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.age || " NA "}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
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
