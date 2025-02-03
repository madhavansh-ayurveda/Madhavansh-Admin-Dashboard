import { medicineApi } from "@/api/medicineApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Medicine } from "@/types";
import { useEffect, useState } from "react";
import MultiSelect from "@/components/ui/multiple-select";
import toast from "react-hot-toast";

const MedicineStock = () => {
  const [medicines, setMedicines] = useState<Medicine[] | undefined>();
  const [department, setDepartment] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "gram",
    stock: "",
  });

  const units = ["gram", "mg", "ml", "tablet", "capsule"];
  // const departmentSpeciality = [
  //   { value: "Skin & Hair", label: "Skin & Hair" },
  //   { value: "Infertility and PCOD", label: "Infertility and PCOD" },
  //   {
  //     value: "Kidney and Gallbladder Stone",
  //     label: "Kidney and Gallbladder Stone",
  //   },
  //   {
  //     value: "Arthritis and Pain Management",
  //     label: "Arthritis and Pain Management",
  //   },
  //   { value: "Life style disorder", label: "Life style disorder" },
  //   { value: "Glaucoma", label: "Glaucoma" },
  //   { value: "Immunity booster dose", label: "Immunity booster dose" },
  // ];
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newMedicine = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      relatedToTreatments: department,
    };
    try {
      const response = await medicineApi.addMedicine(newMedicine);
      // if (response)
      console.log(response);
      setMedicines((prev) => {
        prev?.push(newMedicine);
        return prev;
      });
      setFormData({ name: "", price: "", unit: "gram", stock: "" });
      setDepartment([]);
    } catch (err) {
      console.log("Medicine Error", err);
      const error = err as any;
      if (error.response.data?.message === "Medicine already exists") {
        toast.error("Medicine already in Arsenal");
      }
    }
  };

  const handleDelete = async (name: string) => {
    try {
      console.log(name);
      
      await medicineApi.deleteMedicine(name);
      setMedicines(medicines?.filter((medicine) => medicine.name !== name));
    } catch (err: any) {
      if (err.response.data.message == "Medicine not found") {
        setMedicines(medicines?.filter((medicine) => medicine.name !== name));
        toast.error("Medicine not found");
      }
    }
  };

  useEffect(() => {
    try {
      const fetchMedicine = async () => {
        setMedicines(await medicineApi.getMedicines());
      };
      fetchMedicine();
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">
          Medicine Stocks
        </h1>

        {/* Add Medicine Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Add Medicine
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap gap-4 items-center"
          >
            <Input
              type="text"
              placeholder="Medicine Name"
              className="p-2 border rounded-md w-72"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            {/* Price */}
            <div className="flex gap-1 flex-wrap items-center">
              <Input
                type="number"
                step="0.1"
                placeholder="Price"
                className="p-2 border rounded-md flex-1 w-24"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
              <Input
                placeholder="per"
                className="max-w-[50px] pointer-events-none"
                disabled
              />
              <select
                className="p-2 border rounded-md"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock */}
            <div className="flex flex-wrap gap-1 items-center">
              <Input
                type="number"
                placeholder="Stock Quantity"
                className="p-2 border rounded-md w-32"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                required
              />
              <select
                className="p-2 border rounded-md"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <MultiSelect
                options={[
                  "Skin & Hair",
                  "Infertility and PCOD",
                  "Kidney and Gallbladder Stone",
                  "Arthritis and Pain Management",
                  "Life style disorder",
                  "Glaucoma",
                  "Immunity booster dose",
                ]}
                onChange={(e: string[]) => {
                  setDepartment(e);
                }}
              />
            </div>

            <Button
              type="submit"
              className="bg-primary hover:bg-gray-700 py-2 px-8 rounded-md transition-colors"
            >
              Add
            </Button>
          </form>
        </div>

        {/* Medicine List Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 border-b shadow-md">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines?.map((medicine) => (
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {medicine.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rs. {medicine.price.toFixed(2) + " "}
                    <span className="text-gray-500 text-sm">
                      ({"per " + medicine.unit})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {medicine.stock.toLocaleString() + " "}
                    <span className="text-gray-500 text-sm">
                      ({medicine.unit})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(medicine.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicineStock;
