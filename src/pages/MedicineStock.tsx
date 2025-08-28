import { useEffect, useState } from "react";
import { medicineApi } from "@/api/medicineApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Medicine } from "@/types";
import MultiSelect from "@/components/ui/multiple-select";
import { toast } from "sonner";
import AccessDenied from "@/components/AccessDenied";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Pill,
  Trash2,
  Filter,
  ArrowUpDown,
  Package,
  Download,
} from "lucide-react";
import Loading from "@/components/Loader";

const MedicineStock = () => {
  const [medicines, setMedicines] = useState<Medicine[] | undefined>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<
    Medicine[] | undefined
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "gram",
    stock: "",
  });

  // Check permissions
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  const hasAccess =
    permissions?.includes("medicine") ||
    localStorage.getItem("role") === "super_admin";

  const units = ["gram", "mg", "ml", "tablet", "capsule"];

  const departmentOptions = [
    "Skin & Hair",
    "Infertility and PCOD",
    "Kidney and Gallbladder Stone",
    "Arthritis and Pain Management",
    "Life style disorder",
    "Glaucoma",
    "Immunity booster dose",
  ];

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (!medicines) return;

    let result = [...medicines];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply department filter
    if (selectedDepartments?.length > 0) {
      result = result.filter((medicine) =>
        medicine.relatedToTreatments?.some((dept) =>
          selectedDepartments.includes(dept)
        )
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortBy === "stock") {
        return sortOrder === "asc" ? a.stock - b.stock : b.stock - a.stock;
      }
      return 0;
    });

    setFilteredMedicines(result);
  }, [medicines, searchQuery, selectedDepartments, sortBy, sortOrder]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await medicineApi.getMedicines();
      setMedicines(data);
      setFilteredMedicines(data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to load medicines. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      selectedDepartments?.length === 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const newMedicine = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        relatedToTreatments: selectedDepartments,
      };

      const response = await medicineApi.addMedicine(newMedicine);

      if (response) {
        toast.success("Medicine added successfully");

        // Update local state
        setMedicines((prev) => (prev ? [...prev, newMedicine] : [newMedicine]));

        // Reset form
        setFormData({ name: "", price: "", unit: "gram", stock: "" });
        setSelectedDepartments([]);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Medicine Error", err);
      const error = err as any;

      if (error.response?.data?.message === "Medicine already exists") {
        toast.error("Medicine already exists in inventory");
      } else {
        toast.error("Failed to add medicine. Please try again.");
      }
    }
  };

  const confirmDeleteMedicine = (medicine: Medicine) => {
    setMedicineToDelete(medicine);
  };

  const handleDelete = async () => {
    if (!medicineToDelete) return;

    try {
      await medicineApi.deleteMedicine(medicineToDelete.name);

      setMedicines((prev) =>
        prev
          ? prev.filter((medicine) => medicine.name !== medicineToDelete.name)
          : []
      );

      toast.success("Medicine deleted successfully");
    } catch (err: any) {
      if (err.response?.data?.message === "Medicine not found") {
        setMedicines((prev) =>
          prev
            ? prev.filter((medicine) => medicine.name !== medicineToDelete.name)
            : []
        );
        toast.warning("Medicine not found in inventory");
      } else {
        toast.error("Failed to delete medicine. Please try again.");
      }
    } finally {
      setMedicineToDelete(null);
    }
  };

  const exportToCSV = () => {
    if (!filteredMedicines || filteredMedicines.length === 0) return;

    const headers = ["Name", "Price", "Unit", "Stock", "Related Treatments"];
    const csvData = filteredMedicines.map((medicine) => [
      medicine.name,
      medicine.price.toString(),
      medicine.unit,
      medicine.stock.toString(),
      medicine.relatedToTreatments?.join(", ") || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "medicine_inventory.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="tracking-tight text-xl font-semibold flex items-center gap-2">
            Medicine Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your medicine stock
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={sortBy}
                onValueChange={(value: "name" | "price" | "stock") =>
                  setSortBy(value)
                }
              >
                <SelectTrigger className="w-[130px] h-9">
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>Sort by</span>
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </Button>

              <div className="relative">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                      {selectedDepartments.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          {selectedDepartments.length}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Filter Medicines</DialogTitle>
                      <DialogDescription>
                        Filter medicines by treatment categories
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                      <div className="space-y-4">
                        <Label>Treatment Categories</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {departmentOptions.map((dept) => (
                            <div
                              key={dept}
                              className={`flex items-center justify-between p-2 border rounded-md cursor-pointer transition-colors ${
                                selectedDepartments.includes(dept)
                                  ? "bg-primary/10 border-primary"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => {
                                setSelectedDepartments((prev) =>
                                  prev.includes(dept)
                                    ? prev.filter((d) => d !== dept)
                                    : [...prev, dept]
                                );
                              }}
                            >
                              <span className="text-sm">{dept}</span>
                              {selectedDepartments.includes(dept) && (
                                <Badge variant="secondary">Selected</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedDepartments([])}
                      >
                        Reset
                      </Button>
                      <Button type="submit">Apply Filters</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loading text="Loading medicines..." />
            </div>
          ) : filteredMedicines && filteredMedicines.length > 0 ? (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[30%]">Medicine Name</TableHead>
                    <TableHead className="w-[20%]">Price</TableHead>
                    <TableHead className="w-[20%]">Stock Available</TableHead>
                    <TableHead className="w-[20%] hidden md:table-cell">
                      Treatment Categories
                    </TableHead>
                    <TableHead className="w-[10%] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine) => (
                    <TableRow key={medicine.name} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary" />
                          {medicine.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>₹{medicine.price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">
                            per {medicine.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={
                              medicine.stock > 10
                                ? "default"
                                : medicine.stock > 0
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {medicine.stock.toLocaleString()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {medicine.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {medicine.relatedToTreatments
                            ?.slice(0, 2)
                            .map((treatment) => (
                              <Badge
                                key={treatment}
                                variant="outline"
                                className="text-xs"
                              >
                                {treatment}
                              </Badge>
                            ))}
                          {(medicine.relatedToTreatments?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(medicine.relatedToTreatments?.length || 0) - 2}{" "}
                              more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => confirmDeleteMedicine(medicine)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No medicines found</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                {searchQuery || selectedDepartments.length > 0
                  ? "Try adjusting your filters or search criteria to find what you're looking for."
                  : "Get started by adding your first medicine to the inventory."}
              </p>
              {searchQuery || selectedDepartments.length > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDepartments([]);
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Medicine Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
            <DialogDescription>
              Add a new medicine to your inventory
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Medicine Name</Label>
                <Input
                  id="name"
                  placeholder="Enter medicine name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="price"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                    <span className="text-muted-foreground">per</span>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unit: value })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      placeholder="Quantity"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      required
                    />
                    <Select
                      value={formData.unit}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unit: value })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Treatment Categories</Label>
                <MultiSelect
                  options={departmentOptions}
                  onChange={(selected: string[]) =>
                    setSelectedDepartments(selected)
                  }
                  value={selectedDepartments}
                  placeholder="Select treatment categories"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Medicine</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!medicineToDelete}
        onOpenChange={(open) => !open && setMedicineToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Medicine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this medicine? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {medicineToDelete && (
            <div className="py-4">
              <div className="flex items-center p-3 border rounded-md bg-muted/50">
                <Pill className="h-5 w-5 text-primary mr-2" />
                <div>
                  <p className="font-medium">{medicineToDelete.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Stock: {medicineToDelete.stock} {medicineToDelete.unit}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicineToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicineStock;
