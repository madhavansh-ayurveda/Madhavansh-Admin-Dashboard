import { AdminApi } from "@/api/axios";
import { useState, useEffect } from "react";
// import { API } from "aws-amplify";
import { Medicine } from "@/types";
import MultiSelect from "../ui/multiple-select";

const MedicinePrescription = ({}: //   consultationId,
{
  consultationId: string;
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  //   const [prescription, setPrescription] = useState([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    // const fetchDepartments = async () => {
    //   //   const data = await AdminApi.get("/medicines/departments");
    //   //   setDepartments(data);
    // };
    // fetchDepartments();
    console.log(departments);
  }, [departments]);

  useEffect(() => {
    const fetchMedicines = async () => {
      const params = {
        queryStringParameters: {
          department: selectedDepartment,
          search: searchTerm,
        },
      };
      const data: Medicine[] = await AdminApi.get(`/medicines/${params}`);
      setMedicines(data);
    };
    fetchMedicines();
  }, [selectedDepartment, searchTerm]);

  //   const addToPrescription = (medicine: any) => {
  //     setPrescription([
  //       ...prescription,
  //       {
  //         medicineName: medicine.name,
  //         dose: "",
  //         instructions: "",
  //         price: medicine.price,
  //       },
  //     ]);
  //   };

  //   const updatePrescription = (index, field, value) => {
  //     const updated = [...prescription];
  //     updated[index][field] = value;
  //     setPrescription(updated);
  //   };

  //   const calculateTotalCost = () => {
  //     return prescription.reduce((total, item) => total + item.price, 0);
  //   };

  //   const submitPrescription = async () => {
  //     try {
  //       await API.put("api", `/consultations/${consultationId}`, {
  //         body: {
  //           prescription: {
  //             medicine: {
  //               list: prescription,
  //               totalCost: calculateTotalCost(),
  //             },
  //             instructions: "",
  //             endDate: new Date().toISOString(),
  //           },
  //         },
  //       });

  //       // Update stock (using quantity from dose if needed)
  //       await API.post("api", "/medicines/update-stock", {
  //         body: prescription.map((med) => ({
  //           _id: med._id,
  //           quantity: parseInt(med.dose.match(/\d+/)?.[0] || 1),
  //         })),
  //       });

  //       alert("Prescription updated successfully!");
  //     } catch (error) {
  //       console.error("Error updating prescription:", error);
  //     }
  //   };

  return (
    <div className="prescription-container">
      <div className="filters flex gap-4">
        {/* <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select> */}
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
            setDepartments(e);
          }}
          placeholder="Select Department"
        />
        <MultiSelect options={[]} placeholder="Select Medicine"/>
      </div>

      <div className="medicine-list">
        {medicines.map((medicine) => (
          <div key={medicine.name} className="medicine-item">
            <h4>{medicine.name}</h4>
            <p>
              Price: ₹{medicine.price} | Stock: {medicine.stock} {medicine.unit}
            </p>
            <button
              //   onClick={() => addToPrescription(medicine)}
              disabled={medicine.stock === 0}
            >
              {medicine.stock === 0 ? "Out of Stock" : "Prescribe"}
            </button>
          </div>
        ))}
      </div>

      {/* {prescription.length > 0 && (
        <div className="prescription-review">
          <h3>Current Prescription (Total: ₹{calculateTotalCost()})</h3>
          {prescription.map((item, index) => (
            <div key={index} className="prescription-item">
              <h4>{item.medicineName}</h4>
              <input
                type="text"
                placeholder="Dose (e.g., 2 tablets daily)"
                value={item.dose}
                onChange={(e) =>
                  updatePrescription(index, "dose", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Special instructions"
                value={item.instructions}
                onChange={(e) =>
                  updatePrescription(index, "instructions", e.target.value)
                }
              />
            </div>
          ))}
          <button
          //    onClick={submitPrescription}
          >
            Save Prescription
          </button>
        </div>
      )} */}
    </div>
  );
};

export default MedicinePrescription;
