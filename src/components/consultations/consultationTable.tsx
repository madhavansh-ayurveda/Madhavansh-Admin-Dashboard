import React, { useState } from "react";
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
import { Send, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Consultation } from "@/pages/Consultations";
import { useNavigate } from "react-router-dom";
import {
  // setCacheData,
  // selectCacheData,
  clearCacheByPrefix,
  // CACHE_DURATIONS,
} from "@/store/cacheSlice";
import { useDispatch } from "react-redux";
import { adminApi } from "@/api/adminApi";

interface FeedbackScheduleState {
  type: "immediate" | "scheduled";
  days?: number;
}

interface ConsultationTableProps {
  data: Consultation[];
}

const ConsultationTable: React.FC<ConsultationTableProps> = ({ data }) => {
  const [consultations, setConsultations] = useState<Consultation[]>(data);
  const [isConsultationUpdated, setIsConsultationUpdated] =
    useState<boolean>(false);
  const [editingConsultation, setEditingConsultation] =
    useState<Consultation | null>(null);
  const [feedbackSchedule, setFeedbackSchedule] =
    useState<FeedbackScheduleState>({
      type: "immediate",
      days: 1,
    });
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const handleConsultationInputChange = (
    field: keyof Consultation,
    value: any
  ) => {
    if (editingConsultation) {
      setEditingConsultation({
        ...editingConsultation,
        [field]: value,
      });
      setIsConsultationUpdated(true);
    }
  };

  const handleUpdateConsultation = async () => {
    if (!editingConsultation) return;

    try {
      await adminApi.updateConsultation(
        editingConsultation._id,
        editingConsultation
      );
      dispatch(clearCacheByPrefix("consultations_")); // Clear all consultation-related cache

      // Reset states
      setEditingConsultation(null);
      setFeedbackSchedule({
        type: "immediate",
        days: 1,
      });
      setEditingConsultation(null);
    } catch (error) {
      console.error("Error updating consultation:", error);
    }
  };

  const handleSubmitFeedback = async (
    consultationId: string,
    email: string
  ) => {
    email;
    try {
      const payload = {
        daysAfter:
          feedbackSchedule.type === "scheduled"
            ? feedbackSchedule.days || 1
            : 0,
        immediate: feedbackSchedule.type === "immediate",
      };
      const response = await adminApi.sendFeedbackForm(consultationId, payload);
      if (response.success) {
        console.log("Feedback form scheduled successfully");
        // Reset states
        setEditingConsultation(null);
        setFeedbackSchedule({
          type: "immediate",
          days: 1,
        });
      }
    } catch (error) {
      console.error("Error scheduling feedback form:", error);
    }
  };

  const handleDeleteConsultation = async (id: string, contact: string) => {
    const response = await adminApi.deleteConsultation(id, contact);
    console.log(response);

    if (response.success) {
      setConsultations((prevConsultations) =>
        prevConsultations.filter((consultation) => consultation._id !== id)
      );
    }
  };

  return (
    <>
      <Table className="">
        <TableHeader className="sticky top-0 bg-white z-10 border-b shadow-md">
          <TableRow>
            <TableHead className="min-w-[100px] border">Patient</TableHead>
            <TableHead className="min-w-[100px] border">Doctor</TableHead>
            <TableHead className="hidden md:table-cell min-w-[100px] border">
              Type
            </TableHead>
            <TableHead className="hidden sm:table-cell min-w-[50px] border">
              Date
            </TableHead>
            <TableHead className="hidden sm:table-cell min-w-[50px] border">
              Time
            </TableHead>
            <TableHead className="min-w-[100px] border">Status</TableHead>
            <TableHead className="min-w-[50px] border">Amount</TableHead>
            <TableHead className="min-w-[100px] border">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {consultations &&
            consultations.length > 0 &&
            consultations.map((consultation) => (
              <TableRow
                key={consultation._id}
                className={`text-sm md:text-base hover:bg-gray-100`}
              >
                <TableCell className="whitespace-nowrap min-w-[100px] border-b">
                  {consultation.name || "N/A"}
                </TableCell>
                <TableCell className="whitespace-nowrap min-w-[100px] border-b">
                  Dr. {consultation.doctor.doctorName || "N/A"}
                </TableCell>
                <TableCell className="hidden md:table-cell min-w-[100px] border-b">
                  {consultation.consultationType}
                </TableCell>
                <TableCell className="hidden sm:table-cell min-w-[100px] border-b">
                  {new Date(consultation.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="hidden sm:table-cell min-w-[100px] border-b">
                  {consultation.timeSlot}
                </TableCell>
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
                <TableCell className="flex flex-col min-w-[100px] border-b sm:flex-row gap-2 md:gap-5 lg:gap-4 items-start sm:items-center p-0 py-4">
                  <div className="flex flex-col gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setEditingConsultation(consultation)}
                        >
                          View More
                        </Button>
                      </DialogTrigger>
                      {editingConsultation && (
                        <DialogContent className="max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                          <DialogHeader>
                            <DialogTitle className="text-lg md:text-xl">
                              Consultation Details
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Basic Information */}
                              <div className="space-y-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label>Patient Name</label>
                                  <Input
                                    className="col-span-3"
                                    value={editingConsultation?.name || ""}
                                    disabled
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label>Email</label>
                                  <Input
                                    className="col-span-3"
                                    value={editingConsultation?.email || ""}
                                    onChange={(e) =>
                                      handleConsultationInputChange(
                                        "email",
                                        e.target.value
                                      )
                                    }
                                    disabled
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label>Amount (₹)</label>
                                  <Input
                                    type="number"
                                    className="col-span-3"
                                    value={editingConsultation?.amount || 0}
                                    onChange={(e) =>
                                      handleConsultationInputChange(
                                        "amount",
                                        parseInt(e.target.value)
                                      )
                                    }
                                    disabled={
                                      editingConsultation.status === "completed"
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label>Date</label>
                                  <Input
                                    type="date"
                                    className="col-span-3"
                                    value={
                                      editingConsultation?.date.split("T")[0] ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleConsultationInputChange(
                                        "date",
                                        e.target.value
                                      )
                                    }
                                    disabled={
                                      editingConsultation.status === "completed"
                                    }
                                  />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label>Time Slot</label>
                                  <Input
                                    className="col-span-3"
                                    value={editingConsultation?.timeSlot || ""}
                                    onChange={(e) =>
                                      handleConsultationInputChange(
                                        "timeSlot",
                                        e.target.value
                                      )
                                    }
                                    disabled={
                                      editingConsultation.status === "completed"
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label>Status</label>
                                  <Select
                                    value={editingConsultation?.status}
                                    onValueChange={(value) =>
                                      handleConsultationInputChange(
                                        "status",
                                        value
                                      )
                                    }
                                    disabled={
                                      editingConsultation.status === "completed"
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">
                                        Pending
                                      </SelectItem>
                                      <SelectItem value="confirmed">
                                        Confirmed
                                      </SelectItem>
                                      <SelectItem value="completed">
                                        Completed
                                      </SelectItem>
                                      <SelectItem value="cancelled">
                                        Cancelled
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label>Payment Status</label>
                                  <Select
                                    value={editingConsultation?.paymentStatus}
                                    onValueChange={(value) =>
                                      handleConsultationInputChange(
                                        "paymentStatus",
                                        value
                                      )
                                    }
                                    disabled={
                                      editingConsultation.status === "completed"
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">
                                        Pending
                                      </SelectItem>
                                      <SelectItem value="completed">
                                        Completed
                                      </SelectItem>
                                      <SelectItem value="refunded">
                                        Refunded
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label>Consultation Type</label>
                                  <Select
                                    value={
                                      editingConsultation?.consultationType
                                    }
                                    onValueChange={(value) =>
                                      handleConsultationInputChange(
                                        "consultationType",
                                        value
                                      )
                                    }
                                    disabled={
                                      editingConsultation.status === "completed"
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="General Consultation">
                                        General Consultation
                                      </SelectItem>
                                      <SelectItem value="Follow-up">
                                        Follow-up
                                      </SelectItem>
                                      <SelectItem value="Specific Treatment">
                                        Specific Treatment
                                      </SelectItem>
                                      <SelectItem value="Emergency">
                                        Emergency
                                      </SelectItem>
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
                                  onChange={(e) =>
                                    handleConsultationInputChange(
                                      "symptoms",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    editingConsultation.status === "completed"
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Notes</label>
                                <Textarea
                                  className="col-span-3"
                                  value={editingConsultation?.notes || ""}
                                  onChange={(e) =>
                                    handleConsultationInputChange(
                                      "notes",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    editingConsultation.status === "completed"
                                  }
                                />
                              </div>
                            </div>

                            {/* Prescription Section */}
                            <div className="mt-4">
                              <h3 className="text-lg font-semibold mb-2">
                                Prescription
                              </h3>
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
                                            Array.from(files).forEach(
                                              (file) => {
                                                formData.append(
                                                  "prescriptions",
                                                  file
                                                );
                                              }
                                            );

                                            // Upload the files
                                            const response =
                                              await adminApi.uploadPrescription(
                                                editingConsultation?._id || "",
                                                formData
                                              );

                                            // Update the consultation with the new file URLs
                                            handleConsultationInputChange(
                                              "prescription",
                                              {
                                                ...editingConsultation?.prescription,
                                                files: [
                                                  ...(editingConsultation
                                                    ?.prescription?.files ||
                                                    []),
                                                  ...response.fileUrls,
                                                ],
                                              }
                                            );
                                          } catch (error) {
                                            console.error(
                                              "Error uploading prescriptions:",
                                              error
                                            );
                                            // Add error handling here (e.g., show a toast message)
                                          }
                                        }
                                      }}
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    />
                                    {editingConsultation?.prescription?.files &&
                                      editingConsultation.prescription.files
                                        .length > 0 && (
                                        <div className="mt-2 space-y-2">
                                          {editingConsultation.prescription.files.map(
                                            (fileUrl, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center gap-2"
                                              >
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
                                                    const updatedFiles =
                                                      editingConsultation.prescription.files?.filter(
                                                        (_, i) => i !== index
                                                      );
                                                    handleConsultationInputChange(
                                                      "prescription",
                                                      {
                                                        ...editingConsultation.prescription,
                                                        files: updatedFiles,
                                                      }
                                                    );
                                                  }}
                                                  disabled={
                                                    editingConsultation.status ===
                                                    "completed"
                                                  }
                                                >
                                                  Remove
                                                </Button>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>

                                {/* Instructions */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label>Instructions</label>
                                  <Textarea
                                    className="col-span-3"
                                    value={
                                      editingConsultation?.prescription
                                        ?.instructions || ""
                                    }
                                    onChange={(e) => {
                                      handleConsultationInputChange(
                                        "prescription",
                                        {
                                          ...editingConsultation?.prescription,
                                          instructions: e.target.value,
                                        }
                                      );
                                    }}
                                    disabled={
                                      editingConsultation.status === "completed"
                                    }
                                  />
                                </div>
                              </div>
                            </div>

                            {consultation.status === "completed" && (
                              <div className="space-y-4 mt-4 border-t pt-4">
                                <h3 className="text-lg font-semibold">
                                  Schedule Feedback
                                </h3>
                                <RadioGroup
                                  defaultValue="immediate"
                                  onValueChange={(value) =>
                                    setFeedbackSchedule({
                                      type: value as "immediate" | "scheduled",
                                      days: value === "scheduled" ? 30 : 0,
                                    })
                                  }
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="immediate"
                                      id="immediate"
                                    />
                                    <Label htmlFor="immediate">
                                      Send Immediately
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="scheduled"
                                      id="scheduled"
                                    />
                                    <Label htmlFor="scheduled">
                                      Schedule for Later
                                    </Label>
                                  </div>
                                </RadioGroup>

                                <div className="flex gap-4 items-center">
                                  {feedbackSchedule.type === "scheduled" && (
                                    <>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="90"
                                        value={feedbackSchedule.days}
                                        onChange={(e) =>
                                          setFeedbackSchedule({
                                            ...feedbackSchedule,
                                            days: parseInt(e.target.value),
                                          })
                                        }
                                        className="w-20 "
                                      />
                                      <span>
                                        days after consultation (Default After
                                        30days)
                                      </span>
                                    </>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  className="flex items-center gap-2"
                                  onClick={() =>
                                    handleSubmitFeedback(
                                      consultation._id,
                                      consultation.email
                                    )
                                  }
                                >
                                  <Send className="h-4 w-4" />
                                  {feedbackSchedule.type === "immediate"
                                    ? "Send Now"
                                    : "Schedule"}
                                </Button>
                              </div>
                            )}

                            {/* New button to view feedback */}
                            {consultation.feedbackStatus === "submitted" && (
                              <Button
                                variant="outline"
                                onClick={() =>
                                  navigate(`/feedback/${consultation._id}`)
                                }
                              >
                                View Feedback
                              </Button>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 mt-4">
                              <Button
                                variant="outline"
                                onClick={() => setEditingConsultation(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="default"
                                onClick={handleUpdateConsultation}
                                disabled={isConsultationUpdated}
                              >
                                Update Consultation
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>

                  <Trash2
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                    onClick={() =>
                      handleDeleteConsultation(
                        consultation._id,
                        consultation.contact
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          {!consultations.length && (
            <p className="flex justify-center py-4">No consultations found.</p>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default ConsultationTable;
