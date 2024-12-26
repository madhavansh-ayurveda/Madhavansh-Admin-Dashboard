import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApiResponse {
  success: boolean;
  count: number;
  data: Consultation[];
}

interface Consultation {
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
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response: ApiResponse = await adminApi.getAllConsultations();
        console.log("response", response);

        if (response.data) {
          setConsultations(response.data);
        } else {
          setConsultations([]);
        }
      } catch (error) {
        console.error("Error fetching consultations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (
    field: keyof Consultation,
    value: any
  ) => {
    if (editingConsultation) {
      setEditingConsultation({
        ...editingConsultation,
        [field]: value,
      });
    }
  };

  const handleUpdateConsultation = async () => {
    if (!editingConsultation) return;

    try {
      await adminApi.updateConsultation(editingConsultation._id, editingConsultation);
      // Refresh the consultations list
      const response: ApiResponse = await adminApi.getAllConsultations();
      if (response.data) {
        setConsultations(response.data);
      }
      setEditingConsultation(null);
    } catch (error) {
      console.error("Error updating consultation:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Consultations Management</h1>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations &&
              consultations.length > 0 &&
              consultations.map((consultation) => (
                <TableRow key={consultation._id}>
                  <TableCell>{consultation.name || "N/A"}</TableCell>
                  <TableCell>
                    Dr. {consultation.doctor.doctorName || "N/A"}
                  </TableCell>
                  <TableCell>{consultation.consultationType}</TableCell>
                  <TableCell>
                    {new Date(consultation.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{consultation.timeSlot}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        consultation.status
                      )}`}
                    >
                      {consultation.status}
                    </span>
                  </TableCell>
                  <TableCell>₹{consultation.amount}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setEditingConsultation(consultation)}
                        >
                          View More
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Consultation Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {/* Basic Information */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Patient Name</label>
                                <Input
                                  className="col-span-3"
                                  value={editingConsultation?.name || ""}
                                  onChange={(e) => handleInputChange("name", e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Email</label>
                                <Input
                                  className="col-span-3"
                                  value={editingConsultation?.email || ""}
                                  onChange={(e) => handleInputChange("email", e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Amount (₹)</label>
                                <Input
                                  type="number"
                                  className="col-span-3"
                                  value={editingConsultation?.amount || 0}
                                  onChange={(e) => handleInputChange("amount", parseInt(e.target.value))}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Date</label>
                                <Input
                                  type="date"
                                  className="col-span-3"
                                  value={editingConsultation?.date.split('T')[0] || ""}
                                  onChange={(e) => handleInputChange("date", e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Time Slot</label>
                                <Input
                                  className="col-span-3"
                                  value={editingConsultation?.timeSlot || ""}
                                  onChange={(e) => handleInputChange("timeSlot", e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Status</label>
                                <Select
                                  value={editingConsultation?.status}
                                  onValueChange={(value) => handleInputChange("status", value)}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Payment Status</label>
                                <Select
                                  value={editingConsultation?.paymentStatus}
                                  onValueChange={(value) => handleInputChange("paymentStatus", value)}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Consultation Type</label>
                                <Select
                                  value={editingConsultation?.consultationType}
                                  onValueChange={(value) => handleInputChange("consultationType", value)}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="General Consultation">General Consultation</SelectItem>
                                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                                    <SelectItem value="Specific Treatment">Specific Treatment</SelectItem>
                                    <SelectItem value="Emergency">Emergency</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Medical Information */}
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label>Symptoms</label>
                              <Textarea
                                className="col-span-3"
                                value={editingConsultation?.symptoms || ""}
                                onChange={(e) => handleInputChange("symptoms", e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label>Notes</label>
                              <Textarea
                                className="col-span-3"
                                value={editingConsultation?.notes || ""}
                                onChange={(e) => handleInputChange("notes", e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Prescription Section */}
                          <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Prescription</h3>
                            <div className="space-y-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Upload Prescriptions</label>
                                <div className="col-span-3">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    multiple
                                    onChange={async (e) => {
                                      const files = e.target.files;
                                      if (files && files.length > 0) {
                                        try {
                                          const formData = new FormData();
                                          Array.from(files).forEach(file => {
                                            formData.append('prescriptions', file);
                                          });
                                          
                                          // Upload the files
                                          const response = await adminApi.uploadPrescription(editingConsultation?._id || '', formData);
                                          
                                          // Update the consultation with the new file URLs
                                          handleInputChange("prescription", {
                                            ...editingConsultation?.prescription,
                                            files: [
                                              ...(editingConsultation?.prescription?.files || []),
                                              ...response.fileUrls
                                            ],
                                          });
                                        } catch (error) {
                                          console.error('Error uploading prescriptions:', error);
                                          // Add error handling here (e.g., show a toast message)
                                        }
                                      }
                                    }}
                                  />
                                  {editingConsultation?.prescription?.files && editingConsultation.prescription.files.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                      {editingConsultation.prescription.files.map((fileUrl, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                          <a 
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                          >
                                            View Prescription {index + 1}
                                          </a>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                              const updatedFiles = editingConsultation.prescription.files?.filter((_, i) => i !== index);
                                              handleInputChange("prescription", {
                                                ...editingConsultation.prescription,
                                                files: updatedFiles,
                                              });
                                            }}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Instructions */}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Instructions</label>
                                <Textarea
                                  className="col-span-3"
                                  value={editingConsultation?.prescription?.instructions || ""}
                                  onChange={(e) => {
                                    handleInputChange("prescription", {
                                      ...editingConsultation?.prescription,
                                      instructions: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end gap-4 mt-4">
                            <Button variant="outline" onClick={() => setEditingConsultation(null)}>
                              Cancel
                            </Button>
                            <Button variant="default" onClick={handleUpdateConsultation}>
                              Update Consultation
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
