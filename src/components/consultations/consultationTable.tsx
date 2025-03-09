"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  DialogFooter,
  DialogClose,
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
import {
  Send,
  Trash2,
  Eye,
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  Stethoscope,
  CreditCard,
  AlertCircle,
  Save,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ClockIcon,
  MessageSquare,
  MoreVertical,
  User2Icon,
  IndianRupee,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Consultation } from "@/pages/Consultations";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { cn } from "@/lib/utils";
import MedicinePrescription from "./MedcinePercrptionSelect";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MotionDialogContent = motion(DialogContent);

interface FeedbackScheduleState {
  type: "immediate" | "scheduled";
  days?: number;
  discountAmount?: number;
}

interface ConsultationTableProps {
  data: Consultation[];
}

const ConsultationTable: React.FC<ConsultationTableProps> = ({ data }) => {
  const [consultations, setConsultations] = useState<Consultation[]>(data);
  // const [isConsultationUpdated, setIsConsultationUpdated] = (useState = useState<Consultation[]>(data))
  const [isConsultationUpdated, setIsConsultationUpdated] =
    useState<boolean>(false);
  // const [isConsultationEditing, setIsConsultationEditing] =
  //   useState<boolean>(false);
  const [editingConsultation, setEditingConsultation] =
    useState<Consultation | null>(null);
  const [feedbackSchedule, setFeedbackSchedule] =
    useState<FeedbackScheduleState>({
      type: "immediate",
      days: 1,
    });
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [discountValue, setDiscountValue] = useState<number | undefined>();
  const [discountAmount, setDiscountAmount] = useState<number | undefined>(0);
  const [discountType, setDiscountType] = useState<
    "percentage" | "fixed" | undefined
  >("percentage");
  const [activeTab, setActiveTab] = useState("details");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [consultationToDelete, setConsultationToDelete] =
    useState<Consultation | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setConsultations(data);
  }, [data]);

  useEffect(() => {
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-3.5 w-3.5" />;
      case "confirmed":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "cancelled":
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const handleUpdateConsultation = async (index: number) => {
    if (!editingConsultation) return;

    let updatedConsultation = editingConsultation;
    if (discountValue) {
      updatedConsultation = {
        ...editingConsultation,
        discount: {
          discountType: discountType,
          value: discountValue,
          amount: discountAmount,
        },
      };
    }

    try {
      const response = await adminApi.updateConsultation(
        editingConsultation._id,
        updatedConsultation
      );

      if (response.success) {
        // Update local state
        const updatedConsultations = [...consultations];
        updatedConsultations[index] = updatedConsultation;
        setConsultations(updatedConsultations);

        // Reset states
        setEditingConsultation(null);
        setIsConsultationUpdated(false);
        setFeedbackSchedule({
          type: "immediate",
          days: 1,
        });
        setShowDiscountInput(false);
        setDiscountValue(undefined);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error("Error updating consultation:", error);
    }
  };

  const handleSubmitFeedback = async (
    consultationId: string,
  ) => {
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
        // Update local state to reflect feedback status change
        const updatedConsultations = consultations.map((consultation) =>
          consultation._id === consultationId
            ? { ...consultation, feedbackStatus: "sent" }
            : consultation
        );

        setConsultations(updatedConsultations as Consultation[]);

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

  const confirmDeleteConsultation = (consultation: Consultation) => {
    setConsultationToDelete(consultation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConsultation = async () => {
    if (!consultationToDelete) return;

    try {
      const response = await adminApi.deleteConsultation(
        consultationToDelete._id,
        consultationToDelete.contact
      );

      if (response.success) {
        setConsultations((prevConsultations) =>
          prevConsultations.filter(
            (consultation) => consultation._id !== consultationToDelete._id
          )
        );
        setDeleteDialogOpen(false);
        setConsultationToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting consultation:", error);
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

        setDiscountAmount(Math.max(discountedAmount, 0));
      } else {
        setDiscountAmount(editingConsultation?.amount);
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Table className="border-collapse">
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[200px] font-medium text-xs uppercase">
              <User2Icon className="h-3.5 w-3.5 text-muted-foreground inline mr-2" />
              Patient
            </TableHead>
            <TableHead className="w-[150px] font-medium text-xs uppercase hidden md:table-cell">
              <Phone className="h-3.5 w-3.5 text-muted-foreground inline mr-2" />
              Contact
            </TableHead>
            <TableHead className="w-[150px] font-medium text-xs uppercase flex gap-3 justify-center items-center">
              <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
              Doctor
            </TableHead>
            <TableHead className="w-[120px] font-medium text-xs uppercase hidden lg:table-cell">
              Type
            </TableHead>
            <TableHead className="w-[120px] font-medium text-xs uppercase hidden sm:table-cell">
              Date & Time
            </TableHead>
            <TableHead className="w-[100px] font-medium text-xs uppercase">
              Status
            </TableHead>
            <TableHead className="w-[100px] font-medium text-xs uppercase flex justify-end items-center">
              <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
              Amount
            </TableHead>
            <TableHead className="w-[100px] font-medium text-xs uppercase text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {consultations.map((consultation, index) => (
            <TableRow
              key={consultation._id}
              className="group hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 hidden sm:flex">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(consultation.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{consultation.name}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {consultation.email}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{consultation.contact}</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <span>Dr. {consultation.doctor.doctorName}</span>
                </div>
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                <Badge variant="outline" className="font-normal">
                  {consultation.consultationType}
                </Badge>
              </TableCell>

              <TableCell className="hidden sm:table-cell">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{formatDate(consultation.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{consultation.timeSlot}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex w-fit items-center gap-1 py-0.5 px-1.5 text-xs capitalize",
                      getStatusColor(consultation.status)
                    )}
                  >
                    {getStatusIcon(consultation.status)}
                    <span>{consultation.status}</span>
                  </Badge>

                  <Badge
                    variant="outline"
                    className={cn(
                      "flex w-fit items-center gap-1 py-0.5 px-1.5 text-xs capitalize",
                      getPaymentStatusColor(consultation.paymentStatus)
                    )}
                  >
                    <CreditCard className="h-3 w-3" />
                    <span>{consultation.paymentStatus}</span>
                  </Badge>
                </div>
              </TableCell>

              <TableCell>
                <div className="font-medium">₹{consultation.amount}</div>
                {consultation.discount && (
                  <div className="text-xs text-muted-foreground line-through">
                    {consultation.amount + (consultation.discount.amount || 0)}
                  </div>
                )}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => setEditingConsultation(consultation)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </DialogTrigger>

                    {editingConsultation && (
                      <MotionDialogContent
                        className="max-w-7xl max-h-[90vh] overflow-y-auto"
                        // initial={{ opacity: 0, y: 20 }}
                        // animate={{ opacity: 1, y: 0 }}
                        // transition={{ duration: 0.2 }}
                      >
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-xl">
                            <FileText className="h-5 w-5" />
                            Consultation Details
                          </DialogTitle>
                        </DialogHeader>

                        <Tabs
                          defaultValue="details"
                          value={activeTab}
                          onValueChange={setActiveTab}
                          className="mt-4"
                        >
                          <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="details">
                              <User className="h-4 w-4 mr-2" />
                              Details
                            </TabsTrigger>
                            <TabsTrigger value="prescription">
                              <FileText className="h-4 w-4 mr-2" />
                              Prescription
                            </TabsTrigger>
                            <TabsTrigger value="feedback">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Feedback
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="details" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Patient Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Name
                                    </Label>
                                    <Input
                                      className="col-span-2"
                                      value={editingConsultation?.name || ""}
                                      onChange={(e) =>
                                        handleConsultationInputChange(
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    />
                                  </div>

                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Email
                                    </Label>
                                    <Input
                                      className="col-span-2"
                                      value={editingConsultation?.email || ""}
                                      onChange={(e) =>
                                        handleConsultationInputChange(
                                          "email",
                                          e.target.value
                                        )
                                      }
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    />
                                  </div>

                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Contact
                                    </Label>
                                    <Input
                                      className="col-span-2"
                                      value={editingConsultation?.contact || ""}
                                      onChange={(e) =>
                                        handleConsultationInputChange(
                                          "contact",
                                          e.target.value
                                        )
                                      }
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    />
                                  </div>

                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Symptoms
                                    </Label>
                                    <Textarea
                                      className="col-span-2 min-h-[80px]"
                                      value={
                                        editingConsultation?.symptoms || ""
                                      }
                                      onChange={(e) =>
                                        handleConsultationInputChange(
                                          "symptoms",
                                          e.target.value
                                        )
                                      }
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                                    Appointment Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Doctor
                                    </Label>
                                    <Input
                                      className="col-span-2"
                                      value={`Dr. ${
                                        editingConsultation?.doctor
                                          ?.doctorName || "N/A"
                                      }`}
                                      disabled
                                    />
                                  </div>

                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Department
                                    </Label>
                                    <Input
                                      className="col-span-2"
                                      value={
                                        editingConsultation?.department || ""
                                      }
                                      disabled
                                    />
                                  </div>

                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Date
                                    </Label>
                                    <Input
                                      type="date"
                                      className="col-span-2"
                                      value={
                                        editingConsultation?.date.split(
                                          "T"
                                        )[0] || ""
                                      }
                                      onChange={(e) =>
                                        handleConsultationInputChange(
                                          "date",
                                          e.target.value
                                        )
                                      }
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    />
                                  </div>

                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Time Slot
                                    </Label>
                                    <Input
                                      className="col-span-2"
                                      value={
                                        editingConsultation?.timeSlot || ""
                                      }
                                      onChange={(e) =>
                                        handleConsultationInputChange(
                                          "timeSlot",
                                          e.target.value
                                        )
                                      }
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    />
                                  </div>

                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Mode
                                    </Label>
                                    <Select
                                      value={editingConsultation?.mode || ""}
                                      onValueChange={(e) =>
                                        handleConsultationInputChange("mode", e)
                                      }
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    >
                                      <SelectTrigger className="col-span-2">
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
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Consultation Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Type
                                    </Label>
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
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    >
                                      <SelectTrigger className="col-span-2">
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

                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Status
                                    </Label>
                                    <Select
                                      value={editingConsultation?.status}
                                      onValueChange={(value) =>
                                        handleConsultationInputChange(
                                          "status",
                                          value
                                        )
                                      }
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    >
                                      <SelectTrigger className="col-span-2">
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

                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Payment Status
                                    </Label>
                                    <Select
                                      value={editingConsultation?.paymentStatus}
                                      onValueChange={(value) =>
                                        handleConsultationInputChange(
                                          "paymentStatus",
                                          value
                                        )
                                      }
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    >
                                      <SelectTrigger className="col-span-2">
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

                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Notes
                                    </Label>
                                    <Textarea
                                      className="col-span-2 min-h-[80px]"
                                      value={editingConsultation?.notes || ""}
                                      onChange={(e) =>
                                        handleConsultationInputChange(
                                          "notes",
                                          e.target.value
                                        )
                                      }
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    Payment Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-muted-foreground">
                                      Original Amount (₹)
                                    </Label>
                                    <div className="col-span-2 space-y-2">
                                      <div className="flex gap-2">
                                        <Input
                                          type="number"
                                          value={editingConsultation?.amount}
                                          disabled
                                        />
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            setShowDiscountInput(
                                              !showDiscountInput
                                            )
                                          }
                                          className="whitespace-nowrap"
                                          disabled={
                                            editingConsultation.status ===
                                            "completed"
                                          }
                                        >
                                          {showDiscountInput
                                            ? "Cancel Discount"
                                            : "Apply Discount"}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  {showDiscountInput && (
                                    <div className="grid grid-cols-3 items-center gap-4">
                                      <Label className="text-muted-foreground">
                                        Discounted Amount (₹)
                                      </Label>
                                      <div className="col-span-2 space-y-2">
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
                                                Number.parseFloat(
                                                  e.target.value
                                                )
                                              );
                                              applyDiscount(
                                                Number.parseFloat(
                                                  e.target.value
                                                )
                                              );
                                            }}
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
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="prescription"
                            className="space-y-6"
                          >
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  Prescription Files
                                </CardTitle>
                                <CardDescription>
                                  Upload and manage prescription files for this
                                  consultation
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 items-center gap-4">
                                  <div className="flex flex-col gap-2">
                                    <Label>Upload Prescriptions</Label>
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
                                          }
                                        }
                                      }}
                                      disabled={
                                        editingConsultation.status ===
                                        "completed"
                                      }
                                    />
                                  </div>

                                  {editingConsultation?.prescription?.files &&
                                  editingConsultation.prescription.files
                                    .length > 0 ? (
                                    <div className="mt-4 space-y-2">
                                      <Label>Uploaded Prescriptions</Label>
                                      <div className="grid grid-cols-1 gap-2 mt-2">
                                        {editingConsultation.prescription.files.map(
                                          (fileUrl, index) => (
                                            <div
                                              key={index}
                                              className="flex items-center justify-between p-3 border rounded-md"
                                            >
                                              <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                  Prescription {index + 1}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-8"
                                                  asChild
                                                >
                                                  <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1"
                                                  >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    <span>View</span>
                                                  </a>
                                                </Button>
                                                <Button
                                                  variant="destructive"
                                                  size="sm"
                                                  className="h-8"
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
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                  <span>Remove</span>
                                                </Button>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md">
                                      <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                                      <p className="text-sm font-medium">
                                        No prescriptions uploaded yet
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Upload prescription files using the
                                        input above
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                  Prescription Instructions
                                </CardTitle>
                                <CardDescription>
                                  Add detailed instructions for the patient
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 items-center gap-4">
                                  <Textarea
                                    className="min-h-[150px]"
                                    placeholder="Enter detailed instructions for the patient..."
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
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  Prescribed Medicines
                                </CardTitle>
                                <CardDescription>
                                  Select medicines to prescribe to the patient
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <MedicinePrescription
                                  onselect={setSelectedMedicines}
                                />

                                {selectedMedicines.length > 0 && (
                                  <div className="mt-4">
                                    <Label>Selected Medicines</Label>
                                    <div className="grid grid-cols-1 gap-2 mt-2">
                                      {selectedMedicines.map(
                                        (medicine, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-2 border rounded-md"
                                          >
                                            <span>{medicine}</span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="feedback" className="space-y-6">
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                  Feedback Management
                                </CardTitle>
                                <CardDescription>
                                  Schedule and manage patient feedback for this
                                  consultation
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {editingConsultation.status === "completed" ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                      <p className="text-sm">
                                        {editingConsultation.feedbackStatus ===
                                        "submitted"
                                          ? "Feedback has been submitted by the patient."
                                          : editingConsultation.feedbackStatus ===
                                            "sent"
                                          ? "Feedback form has been sent to the patient."
                                          : "This consultation is completed. You can now schedule a feedback form."}
                                      </p>
                                    </div>

                                    {editingConsultation.feedbackStatus ===
                                    "submitted" ? (
                                      <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                          navigate(
                                            `/feedback/${editingConsultation._id}`
                                          )
                                        }
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Feedback
                                      </Button>
                                    ) : (
                                      editingConsultation.feedbackStatus !==
                                        "sent" && (
                                        <>
                                          <div className="space-y-4 border-t pt-4">
                                            <h3 className="text-sm font-medium">
                                              Schedule Feedback
                                            </h3>
                                            <RadioGroup
                                              defaultValue="immediate"
                                              value={feedbackSchedule.type}
                                              onValueChange={(value) =>
                                                setFeedbackSchedule({
                                                  type: value as
                                                    | "immediate"
                                                    | "scheduled",
                                                  days:
                                                    value === "scheduled"
                                                      ? 30
                                                      : 0,
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

                                            {feedbackSchedule.type ===
                                              "scheduled" && (
                                              <div className="flex gap-4 items-center">
                                                <Input
                                                  type="number"
                                                  min="1"
                                                  max="90"
                                                  value={feedbackSchedule.days}
                                                  onChange={(e) =>
                                                    setFeedbackSchedule({
                                                      ...feedbackSchedule,
                                                      days: Number.parseInt(
                                                        e.target.value
                                                      ),
                                                    })
                                                  }
                                                  className="w-20"
                                                />
                                                <span className="text-sm">
                                                  days after consultation
                                                  (Default: 30 days)
                                                </span>
                                              </div>
                                            )}

                                            <Button
                                              variant="outline"
                                              className="flex items-center gap-2 w-full"
                                              onClick={() =>
                                                handleSubmitFeedback(
                                                  editingConsultation._id,
                                                )
                                              }
                                            >
                                              <Send className="h-4 w-4" />
                                              {feedbackSchedule.type ===
                                              "immediate"
                                                ? "Send Feedback Form Now"
                                                : "Schedule Feedback Form"}
                                            </Button>
                                          </div>
                                        </>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md">
                                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium">
                                      Feedback not available
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 text-center">
                                      Feedback can only be scheduled after the
                                      consultation is marked as completed
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {editingConsultation?.additionalInfo && (
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Additional Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {editingConsultation.additionalInfo.img &&
                                      editingConsultation.additionalInfo.img
                                        .length > 0 && (
                                        <div className="space-y-2">
                                          <Label>Images</Label>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {editingConsultation.additionalInfo.img.map(
                                              (imgUrl, index) => (
                                                <a
                                                  key={`img-${index}`}
                                                  href={imgUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="block border rounded-md overflow-hidden hover:border-primary transition-colors"
                                                >
                                                  <img
                                                    src={
                                                      imgUrl ||
                                                      "/placeholder.svg"
                                                    }
                                                    alt={`Additional image ${
                                                      index + 1
                                                    }`}
                                                    className="w-full h-32 object-cover"
                                                  />
                                                  <div className="p-2 text-xs text-center">
                                                    Image {index + 1}
                                                  </div>
                                                </a>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {editingConsultation.additionalInfo.file &&
                                      editingConsultation.additionalInfo.file
                                        .length > 0 && (
                                        <div className="space-y-2">
                                          <Label>Files</Label>
                                          <div className="grid grid-cols-1 gap-2">
                                            {editingConsultation.additionalInfo.file.map(
                                              (fileUrl, index) => (
                                                <div
                                                  key={`file-${index}`}
                                                  className="flex items-center justify-between p-3 border rounded-md"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                      Additional File{" "}
                                                      {index + 1}
                                                    </span>
                                                  </div>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                    asChild
                                                  >
                                                    <a
                                                      href={fileUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center gap-1"
                                                    >
                                                      <Download className="h-3.5 w-3.5" />
                                                      <span>Download</span>
                                                    </a>
                                                  </Button>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>
                        </Tabs>

                        <DialogFooter className="flex justify-between items-center gap-2 pt-4 border-t mt-6">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Created:{" "}
                              {new Date(
                                editingConsultation.createdAt
                              ).toLocaleString()}
                            </span>
                            <Separator orientation="vertical" className="h-3" />
                            <span>
                              Updated:{" "}
                              {new Date(
                                editingConsultation.updatedAt
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              onClick={() => handleUpdateConsultation(index)}
                              disabled={!isConsultationUpdated}
                              className="gap-2"
                            >
                              {isConsultationUpdated ? (
                                <>
                                  <Save className="h-4 w-4" />
                                  Save Changes
                                </>
                              ) : (
                                "No Changes"
                              )}
                            </Button>
                          </div>
                        </DialogFooter>
                      </MotionDialogContent>
                    )}
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        // onClick={() => setEditingConsultation(consultation)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {consultation.invoiceId ? "View Invoice" : "Generate Invoice"}
                      </DropdownMenuItem>
                      {consultation.status === "completed" &&
                        consultation.feedbackStatus !== "submitted" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingConsultation(consultation);
                              setActiveTab("feedback");
                            }}
                            className="cursor-pointer"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Feedback
                          </DropdownMenuItem>
                        )}
                      {consultation.feedbackStatus === "submitted" && (
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/feedback/${consultation._id}`)
                          }
                          className="cursor-pointer"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Feedback
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => confirmDeleteConsultation(consultation)}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Consultation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this consultation for{" "}
              {consultationToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConsultation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConsultationTable;
