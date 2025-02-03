import React, { useEffect, useState } from "react";
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
// import {
//   // setCacheData,
//   // selectCacheData,
//   clearCacheByPrefix,
//   // CACHE_DURATIONS,
// } from "@/store/cacheSlice";
// import { useDispatch } from "react-redux";
// import { useSelector } from "react-redux";
import { adminApi } from "@/api/adminApi";
import { cn } from "@/lib/utils";
// import MultiSelect from "../ui/multiple-select";
import MedicinePrescription from "./MedcinePercrptionSelect";

interface FeedbackScheduleState {
  type: "immediate" | "scheduled";
  days?: number;
  discountAmount?: number;
}

interface ConsultationTableProps {
  data: Consultation[];
}

const ConsultationTable: React.FC<ConsultationTableProps> = ({ data }) => {
  const [consultationsArray, setConsultationsArray] =
    useState<Consultation[]>(data);
  const [isConsultationUpdated, setIsConsultationUpdated] =
    useState<boolean>(false);
  const [editingConsultation, setEditingConsultation] =
    useState<Consultation | null>(null);
  const [feedbackSchedule, setFeedbackSchedule] =
    useState<FeedbackScheduleState>({
      type: "immediate",
      days: 1,
    });
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue, setDiscountValue] = useState<number | undefined>();
  const [discountAmount, setDiscountAmount] = useState<number | undefined>(0);
  const [discountType, setDiscountType] = useState<
    "percentage" | "fixed" | undefined
  >("percentage");
  // const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // console.log(consultationsArray);
    if (editingConsultation?.discount) {
      setShowDiscountInput(true);
      setDiscountAmount(editingConsultation.discount.amount);
      setDiscountType(
        editingConsultation.discount.discountType as "percentage" | "fixed"
      );
      setDiscountValue(editingConsultation.discount.value);
    }
  }, [editingConsultation]);

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

    let editConsultationData = editingConsultation;
    if (discountValue) {
      editConsultationData = {
        ...editingConsultation,
        discount: {
          discountType: discountType,
          value: discountValue,
          amount: discountAmount,
        },
      };
    }

    try {
      // console.log(editConsultationData);

      await adminApi.updateConsultation(
        editingConsultation._id,
        editConsultationData
      );
      // dispatch(clearCacheByPrefix("consultationsArray_")); // Clear all consultation-related cache

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
      setConsultationsArray((prevconsultationsArray) =>
        prevconsultationsArray.filter((consultation) => consultation._id !== id)
      );
    }
  };

  const applyDiscount = (discount: number) => {
    if (editingConsultation && discount) {
      if (!isNaN(discount)) {
        let discountedAmount = editingConsultation.amount;
        if (discountType === "percentage") {
          discountedAmount =
            editingConsultation.amount -
            (editingConsultation.amount * discount) / 100;
        } else {
          discountedAmount = editingConsultation.amount - discount;
        }
        setDiscountAmount(discountedAmount);
        // handleConsultationInputChange(
        //   "amount",
        //   Math.max(discountedAmount, 0)
        // );
      } else {
        setDiscountAmount(editingConsultation?.amount);
      }
    }
  };

  return (
    <>
      <Table className="">
        <TableHeader
          className={cn(
            "top-0 border-b shadow-md"
            // isSidebarOpen ? "bg-gray-200" : "bg-gray-50"
          )}
        >
          <TableRow>
            <TableHead className="min-w-[100px] border uppercase font-medium text-xs">
              Patient
            </TableHead>
            <TableHead className="min-w-[100px] border uppercase font-medium text-xs">
              Contact
            </TableHead>
            <TableHead className="min-w-[100px] border uppercase font-medium text-xs">
              Doctor
            </TableHead>
            <TableHead className="hidden md:table-cell min-w-[100px] border uppercase font-medium text-xs">
              Type
            </TableHead>
            <TableHead className="hidden sm:table-cell min-w-[50px] border uppercase font-medium text-xs">
              Date
            </TableHead>
            <TableHead className="hidden sm:table-cell min-w-[50px] border uppercase font-medium text-xs">
              Time
            </TableHead>
            <TableHead className=" hidden sm:table-cell min-w-[60px] border uppercase font-medium text-xs">
              Status
            </TableHead>
            <TableHead className="min-w-[50px] border uppercase font-medium text-xs">
              Amount
            </TableHead>
            <TableHead className="min-w-[100px] border uppercase font-medium text-xs">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {consultationsArray &&
            consultationsArray.length > 0 &&
            consultationsArray.map((consultation) => (
              <TableRow
                key={consultation._id}
                className={`text-sm md:text-base hover:bg-gray-100`}
              >
                <TableCell className="whitespace-nowrap min-w-[100px] border-b">
                  {consultation.name || "N/A"}
                </TableCell>
                <TableCell className="whitespace-nowrap min-w-[100px] border-b">
                  {consultation.contact}
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
                <TableCell className="hidden sm:table-cell min-w-[50px] border-b">
                  {consultation.timeSlot}
                </TableCell>
                <TableCell className="hidden sm:table-cell min-w-[50px] border-b">
                  <span
                    className={`p-2 px-4 text-xs font-semibold rounded-full ${getStatusColor(
                      consultation.status
                    )}`}
                  >
                    {consultation.status}
                  </span>
                </TableCell>
                <TableCell>₹{consultation.amount}</TableCell>
                <TableCell className="flex flex-col min-w-[100px] border-b sm:flex-row gap-2 md:gap-5 lg:gap-4 items-start sm:items-center p-0 py-4 px-2">
                  <div className="flex flex-col gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingConsultation(consultation);
                            // setOriginalAmount(consultation.amount);
                          }}
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
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                              {/* Basic Information */}
                              {/* <div className="space-y-4"> */}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Patient Name</label>
                                <Input
                                  className="col-span-3"
                                  value={editingConsultation?.name || ""}
                                  disabled
                                />
                              </div>

                              {/* Doctor */}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Doctor</label>
                                <Input
                                  className="col-span-3"
                                  value={`Dr. ${
                                    editingConsultation?.doctor?.doctorName ||
                                    "N/A"
                                  }`}
                                  disabled
                                />
                              </div>

                              {/* Email */}
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

                              {/* Date */}
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

                              {/* Contact */}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Contact</label>
                                <Input
                                  className="col-span-3"
                                  value={editingConsultation?.contact || ""}
                                  onChange={(e) =>
                                    handleConsultationInputChange(
                                      "contact",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    editingConsultation.status === "completed"
                                  }
                                />
                              </div>

                              {/* Department */}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Department</label>
                                <Input
                                  className="col-span-3"
                                  value={editingConsultation?.department || ""}
                                  onChange={(e) =>
                                    handleConsultationInputChange(
                                      "department",
                                      e.target.value
                                    )
                                  }
                                  disabled
                                  // disabled={
                                  //   editingConsultation.status === "completed"
                                  // }
                                />
                              </div>

                              {/* Mode */}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Mode</label>
                                <Select
                                  value={editingConsultation?.mode || ""}
                                  onValueChange={(e) =>
                                    handleConsultationInputChange("mode", e)
                                  }
                                  disabled={
                                    editingConsultation.status === "completed"
                                  }
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="online">
                                      Online
                                    </SelectItem>
                                    <SelectItem value="offline">
                                      Offline
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Time Slot */}
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

                              {/* Status */}
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

                              {/* Payment Status */}
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

                              {/* Type */}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Consultation Type</label>
                                <Select
                                  value={editingConsultation?.consultationType}
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

                              {/* Amount */}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Original Amount (₹)</label>
                                <div className="col-span-3 space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      value={editingConsultation?.amount}
                                      disabled
                                    />
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowDiscountInput(
                                          !showDiscountInput
                                        );
                                      }}
                                      className="w-56"
                                    >
                                      {showDiscountInput
                                        ? "Cancel Discount"
                                        : "Apply Discount"}
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Discounted Amount */}
                              {showDiscountInput && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label>Discounted Amount (₹)</label>
                                  <div className="col-span-3 space-y-2">
                                    <Input
                                      type="number"
                                      value={
                                        discountAmount ||
                                        editingConsultation.amount
                                      }
                                      disabled
                                    />
                                    <div className="flex gap-2 items-center">
                                      <Select
                                        value={discountType}
                                        onValueChange={(value) =>
                                          setDiscountType(
                                            value as "percentage" | "fixed"
                                          )
                                        }
                                      >
                                        <SelectTrigger className="w-24">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="percentage">
                                            %
                                          </SelectItem>
                                          <SelectItem value="fixed">
                                            ₹
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Input
                                        type="number"
                                        placeholder={
                                          discountType === "percentage"
                                            ? "Discount %"
                                            : "Discount amount"
                                        }
                                        value={discountValue}
                                        onChange={(e) => {
                                          setDiscountValue(
                                            parseFloat(e.target.value)
                                          );
                                          applyDiscount(
                                            parseFloat(e.target.value)
                                          );
                                        }}
                                        className=""
                                        min={0}
                                        max={
                                          discountType === "percentage"
                                            ? 100
                                            : editingConsultation.amount
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                              {/* </div> */}
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
                                {/* Pescription Upload */}
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

                                {/* Medicine */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label htmlFor="">Medicine</label>
                                  {/* <MultiSelect
                                    options={[
                                      "Skin & Hair",
                                      "Infertility and PCOD",
                                      "Kidney and Gallbladder Stone",
                                      "Arthritis and Pain Management",
                                      "Life style disorder",
                                      "Glaucoma",
                                      "Immunity booster dose",
                                    ]}
                                  /> */}
                                  <MedicinePrescription consultationId={consultation._id}/>
                                </div>
                              </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4 mt-4">
                              <h3 className="text-lg font-semibold">
                                Additional Information
                              </h3>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Created At</label>
                                <Input
                                  className="col-span-3"
                                  value={new Date(
                                    editingConsultation?.createdAt || ""
                                  ).toLocaleString()}
                                  disabled
                                />
                              </div>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <label>Last Updated</label>
                                <Input
                                  className="col-span-3"
                                  value={new Date(
                                    editingConsultation?.updatedAt || ""
                                  ).toLocaleString()}
                                  disabled
                                />
                              </div>

                              {editingConsultation?.additionalInfo && (
                                <>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label>Additional Files</label>
                                    <div className="col-span-3">
                                      {editingConsultation.additionalInfo.img?.map(
                                        (imgUrl, index) => (
                                          <div
                                            key={`img-${index}`}
                                            className="mb-2"
                                          >
                                            <a
                                              href={imgUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline"
                                            >
                                              View Image {index + 1}
                                            </a>
                                          </div>
                                        )
                                      )}
                                      {editingConsultation.additionalInfo.file?.map(
                                        (fileUrl, index) => (
                                          <div
                                            key={`file-${index}`}
                                            className="mb-2"
                                          >
                                            <a
                                              href={fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline"
                                            >
                                              View File {index + 1}
                                            </a>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
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
          {!consultationsArray.length && (
            <p className="flex justify-center py-4">
              No consultationsArray found.
            </p>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default ConsultationTable;
