import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreateDoctorDto, Doctor } from "../../api/doctorApi";
import { doctorApi } from "../../api/doctorApi";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface AddDoctorFormProps {
  initialData?: Doctor;
  onSuccess?: (doctor: Doctor) => void;
  mode?: "create" | "edit";
  onSubmit: (data: CreateDoctorDto) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const specializationOptions = ["Ayurveda", "Panchakarma", "Yoga", "General"];
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const statusOptions = ["active", "inactive", "on-leave"];

// First, define the status type
type DoctorStatus = "active" | "inactive" | "on-leave";

// Add this type
type Specialization = 'Ayurveda' | 'Panchakarma' | 'Yoga' | 'General';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export function AddDoctorForm({
  initialData,
  onSuccess,
  mode = "create",
}: AddDoctorFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >(initialData?.specialization || []);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialData?.availability?.days || []
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[][]>(
    initialData?.availability?.slots || []
  );

  const form = useForm<CreateDoctorDto>({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      specialization: initialData?.specialization || [],
      qualification: initialData?.qualification || "",
      experience: initialData?.experience || 0,
      registrationNumber: initialData?.registrationNumber || "",
      status: initialData?.status || "active",
      availability: {
        days: initialData?.availability?.days || [],
        slots: initialData?.availability?.slots || [],
      },
      profileImage: initialData?.profileImage || "",
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        specialization: initialData.specialization,
        qualification: initialData.qualification,
        experience: initialData.experience,
        registrationNumber: initialData.registrationNumber,
        status: initialData.status,
        availability: initialData.availability,
        profileImage: initialData.profileImage,
      });
      setSelectedSpecializations(initialData.specialization);
      setSelectedDays(initialData.availability.days);
      setTimeSlots(initialData.availability.slots);
    }
  }, [initialData, form]);

  const handleAddTimeSlot = (dayIndex: number) => {
    setTimeSlots(prev => {
      const newSlots = [...prev];
      if (!newSlots[dayIndex]) {
        newSlots[dayIndex] = [];
      }
      newSlots[dayIndex] = [...newSlots[dayIndex], { startTime: "09:00", endTime: "17:00", isBooked: false }];
      return newSlots;
    });
  };

  const handleRemoveTimeSlot = (dayIndex: number, slotIndex: number) => {
    setTimeSlots(prev => {
      const newSlots = [...prev];
      newSlots[dayIndex] = newSlots[dayIndex].filter((_, i) => i !== slotIndex);
      return newSlots;
    });
  };

  const handleTimeSlotChange = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(prev => {
      const newSlots = [...prev];
      newSlots[dayIndex] = newSlots[dayIndex].map((slot, i) => 
        i === slotIndex ? { ...slot, [field]: value } : slot
      );
      return newSlots;
    });
  };

  // Update form when slots change
  useEffect(() => {
    form.setValue("availability.slots", timeSlots);
  }, [timeSlots]);

  const onSubmit = async (data: CreateDoctorDto) => {
    try {
      setIsLoading(true);
      let response: Doctor;

      if (mode === "edit" && initialData?._id) {
        response = {
          ...data,
          _id: initialData._id,
        };
        toast({
          title: "Success",
          description: "Doctor updated successfully",
        });
      } else {
        response = await doctorApi.createDoctor(data);
        toast({
          title: "Success",
          description: "Doctor added successfully",
        });
      }

      if (onSuccess) {
        onSuccess(response);
      }

      if (mode === "create") {
        form.reset();
        setSelectedSpecializations([]);
        setSelectedDays([]);
        setTimeSlots([]);
      }
    } catch (error: any) {
      // Extract error message from the API response
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to process doctor data';
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      
      // Log the full error for debugging
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Edit Doctor" : "Add New Doctor"}
        </CardTitle>
        <CardDescription>
          {mode === "edit"
            ? "Update the doctor's details below"
            : "Enter the doctor's details below"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <FormLabel htmlFor="name">Name</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Dr. John Doe"
                  required
                />
              </FormControl>
              <FormMessage />
            </div>

            {/* Email */}
            <div>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="doctor@example.com"
                  required
                />
              </FormControl>
              <FormMessage />
            </div>

            {/* Phone */}
            <div>
              <FormLabel htmlFor="phone">Phone</FormLabel>
              <FormControl>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="+91 9876543210"
                  required
                />
              </FormControl>
              <FormMessage />
            </div>

            {/* Specializations */}
            <div>
              <FormLabel>Specializations</FormLabel>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {specializationOptions.map((spec) => (
                  <label key={spec} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSpecializations.includes(spec)}
                      onChange={() => {
                        let newSpecializations;
                        if (selectedSpecializations.includes(spec)) {
                          newSpecializations = selectedSpecializations.filter(
                            (item) => item !== spec
                          );
                        } else {
                          newSpecializations = [...selectedSpecializations, spec];
                        }
                        setSelectedSpecializations(newSpecializations);
                        form.setValue("specialization", newSpecializations as Specialization[]);
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Qualification */}
            <div>
              <FormLabel htmlFor="qualification">Qualification</FormLabel>
              <FormControl>
                <Input
                  id="qualification"
                  {...form.register("qualification")}
                  placeholder="BAMS, MD"
                />
              </FormControl>
              <FormMessage />
            </div>

            {/* Experience */}
            <div>
              <FormLabel htmlFor="experience">Experience (years)</FormLabel>
              <FormControl>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  {...form.register("experience")}
                  required
                />
              </FormControl>
              <FormMessage />
            </div>

            {/* Registration Number */}
            <div>
              <FormLabel htmlFor="registrationNumber">
                Registration Number
              </FormLabel>
              <FormControl>
                <Input
                  id="registrationNumber"
                  {...form.register("registrationNumber")}
                  placeholder="REG123456"
                  required
                />
              </FormControl>
              <FormMessage />
            </div>

            {/* Status */}
            <div>
              <FormLabel htmlFor="status">Status</FormLabel>
              <FormControl>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value: DoctorStatus) => {
                    form.setValue("status", value);
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status as DoctorStatus}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </div>

            {/* Available Days */}
            <div>
              <FormLabel>Available Days</FormLabel>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={() => {
                        let newDays;
                        if (selectedDays.includes(day)) {
                          newDays = selectedDays.filter((item) => item !== day);
                        } else {
                          newDays = [...selectedDays, day];
                        }
                        setSelectedDays(newDays);
                        form.setValue("availability.days", newDays);
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              {selectedDays.map((day, dayIndex) => (
                <div key={day} className="mt-4 p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{day}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTimeSlot(dayIndex)}
                    >
                      Add Time Slot
                    </Button>
                  </div>
                  
                  {(timeSlots[dayIndex] || []).map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex gap-4 items-center mt-2">
                      <div className="flex-1">
                        <FormLabel>Start Time</FormLabel>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <FormLabel>End Time</FormLabel>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-6"
                        onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? mode === "edit"
                  ? "Updating Doctor..."
                  : "Adding Doctor..."
                : mode === "edit"
                ? "Update Doctor"
                : "Add Doctor"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default AddDoctorForm;
