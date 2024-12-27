import { useState } from "react";
import type { Availability, CreateDoctorDto, Doctor, Slot } from "@/api/doctorApi";

interface AddDoctorFormProps {
  onSubmit: (data: CreateDoctorDto) => Promise<void>;
  onCancel: () => void;
  initialData?: Doctor;
  isEditing?: boolean;
}

const SPECIALIZATIONS = ["Ayurveda", "Panchakarma", "Yoga", "General"];
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AddDoctorForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: AddDoctorFormProps) {
  const [formData, setFormData] = useState<CreateDoctorDto>(() => {
    if (initialData) {
      return {
        ...initialData,
        availability: {
          days: initialData.availability?.days || [],
          slots: initialData.availability?.slots || [],
        }
      };
    }
    return {
      name: "",
      email: "",
      phone: "",
      specialization: [],
      qualification: "",
      experience: 0,
      registrationNumber: "",
      status: "active",
      availability: {
        days: [],
        slots: [],
      },
      profileImage: "",
    };
  });

  const [availabilityInputs, setAvailabilityInputs] = useState<Availability>(() => {
    if (initialData?.availability) {
        const availability = initialData.availability;

        return {
            days: availability.days || [],
            slots: availability.slots || []
        };
    }

    return {
        days: [],
        slots: []
    };
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvailabilityChange = (oldDay: string, newDay: string) => {
    const newAvailability = { ...availabilityInputs };
    console.log(availabilityInputs);
    console.log(newAvailability);
    
    const slots = newAvailability[oldDay];
    delete newAvailability[oldDay];
    newAvailability[newDay] = slots;
    setAvailabilityInputs(newAvailability);
  };

  const handleSlotChange = (
    day: string,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const newAvailability = { ...availabilityInputs };
    newAvailability[day][slotIndex][field] = value;
    setAvailabilityInputs(newAvailability);
  };

  const addSlot = (day: string) => {
    const newAvailability = { ...availabilityInputs };
    newAvailability[day] = [
      ...newAvailability[day],
      { startTime: "", endTime: "" },
    ];
    setAvailabilityInputs(newAvailability);
  };

  const addDay = () => {
    const availableDays = DAYS.filter((day) => !availabilityInputs[day]);
    if (availableDays.length > 0) {
      const newAvailability = { ...availabilityInputs };
      newAvailability[availableDays[0]] = [{ startTime: "", endTime: "" }];
      setAvailabilityInputs(newAvailability);
    }
  };

  const deleteDay = (day: string) => {
    const newAvailability = { ...availabilityInputs };
    delete newAvailability[day];
    setAvailabilityInputs(newAvailability);
  };

  const deleteSlot = (day: string, slotIndex: number) => {
    const newAvailability = { ...availabilityInputs };
    newAvailability[day] = newAvailability[day].filter(
      (_, index) => index !== slotIndex
    );
    if (newAvailability[day].length === 0) {
      delete newAvailability[day];
    }
    setAvailabilityInputs(newAvailability);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const days: string[] = [];
    const slots: Array<Array<{ startTime: string; endTime: string }>> = [];

    Object.entries(availabilityInputs).forEach(([day, daySlots]) => {
      days.push(day);
      slots.push(daySlots);
    });
    console.log({ days, slots });

    const finalFormData = {
      ...formData,
      availability: [{ days, slots }],
    };
    console.log("finalFormData", finalFormData);

    const formattedAvailability = {
      days: finalFormData.availability[0].days,
      slots: finalFormData.availability[0].slots
    };

    await onSubmit({
      ...formData,
      availability: formattedAvailability
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Specialization
          </label>
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          >
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Qualification
          </label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Experience (years)
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Registration Number
          </label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on-leave">On Leave</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700">Availability</h3>
        {Object.entries(availabilityInputs).map(([day, slots]) => (
          <div key={day} className="mt-4 p-4 border rounded-md">
            <div className="flex justify-between items-center">
              <select
                value={day}
                onChange={(e) => handleAvailabilityChange(day, e.target.value)}
                className="w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => deleteDay(day)}
                className="text-red-600 hover:text-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {slots.map((slot, slotIndex) => (
              <div key={slotIndex} className="mt-2 flex gap-2 items-center">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    handleSlotChange(
                      day,
                      slotIndex,
                      "startTime",
                      e.target.value
                    )
                  }
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) =>
                    handleSlotChange(day, slotIndex, "endTime", e.target.value)
                  }
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => deleteSlot(day, slotIndex)}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSlot(day)}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              + Add Slot
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addDay}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700"
          disabled={Object.keys(availabilityInputs).length === DAYS.length}
        >
          + Add Day
        </button>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
        >
          {isEditing ? 'Update Doctor' : 'Add Doctor'}
        </button>
      </div>
    </form>
  );
}
