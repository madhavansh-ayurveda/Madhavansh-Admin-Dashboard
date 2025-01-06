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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users Management</h1>
      <Input
        type="text"
        placeholder="Search Users"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email || " NA "}</TableCell>
                <TableCell>{user.contact}</TableCell>
                <TableCell>{user.age || " NA "}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <div className="flex justify-between mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
