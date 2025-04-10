// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/manager-profile.tsx
import { useState, useEffect, useCallback } from "react";
import { ManagerProfile } from "@/types/auth";
import { useDeleteManagerProfileMutation } from "@/shared/queries/manager-profile";
import { toast } from "sonner";
import { isValid, parseISO } from "date-fns";
interface ManagerProfileFormProps {
  onSubmit: (data: Partial<ManagerProfile>) => void;
  initialData?: ManagerProfile;
  onCancel?: () => void;
}

export default function ManagerProfileForm({
  onSubmit,
  initialData,
  onCancel,
}: ManagerProfileFormProps) {
  const [formData, setFormData] = useState<Partial<ManagerProfile>>({
    name: "",
    company_name: "",
    company_email: "",
    company_phone: "",
    gender: "",
    address: "",
    date_of_birth: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const isUpdateMode = !!initialData?.id;

  const { mutate: deleteManagerProfile } = useDeleteManagerProfileMutation({
    onSuccess: () => {
      toast.success("Manager profile deleted successfully");
      onCancel?.();
    },
    onError: (error: unknown) => { // <-- FIX: Changed 'any' to 'unknown'
      let message = "Error deleting manager profile";
      // Add type checking
      if (error instanceof Error) {
        message = error.message || message; // Use error message if available
      } else if (typeof error === 'string') {
        message = error;
      }
      toast.error(message);
    },
  });

  useEffect(() => {
    if (initialData) {
      // Format date for input when setting initial data
      setFormData({
          ...initialData,
          date_of_birth: initialData.date_of_birth ? new Date(initialData.date_of_birth).toISOString().split('T')[0] : null
      });
    } else {
      setFormData({
        name: "",
        company_name: "",
        company_email: "",
        company_phone: "",
        gender: "",
        address: "",
        date_of_birth: null,
      });
    }
  }, [initialData]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
      if (name === "date_of_birth") {
        setDateError(null);
        if (value) {
          // Basic validation, more robust validation might be needed
          const parsedDate = parseISO(value);
          if (!isValid(parsedDate)) {
            setDateError("Invalid date format");
          }
        }
      }
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (dateError) {
          toast.error("Please fix the errors before submitting.");
          return;
      }
      setIsSubmitting(true);

      // Prepare data, ensure date is correctly formatted or null
      const dataToSubmit: Partial<ManagerProfile> = {
        ...formData,
        // Format date for backend, ensure it's null if empty/invalid
        date_of_birth: formData.date_of_birth && isValid(parseISO(formData.date_of_birth.toString()))
            ? new Date(formData.date_of_birth).toISOString()
            : null,
      };

      // Remove user_id if it exists, as it shouldn't be sent on update/create via this form typically
      delete dataToSubmit.user_id;

      console.log("Submitting Manager Profile:", dataToSubmit);
      onSubmit(dataToSubmit);
      // Consider resetting submitting state in a .finally or after onSubmit promise resolves if it's async
      setIsSubmitting(false);
    },
    [formData, onSubmit, dateError]
  );

  const handleDelete = useCallback(() => {
    if (initialData?.id) {
      setIsDeleting(true);
      deleteManagerProfile(initialData.id);
    }
  }, [initialData?.id, deleteManagerProfile]);

  // Helper to format date string (YYYY-MM-DD) from various types
  const getFormattedDateValue = (date: string | Date | null | undefined): string => {
      if (!date) return "";
      try {
          return new Date(date).toISOString().split('T')[0];
      } catch {
          return "";
      }
  }

  return (
    // Consider using shadcn Form components for consistency if available in your project
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      {/* Use Label and Input components for consistency */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full" // Replace with shadcn Input if used
          required
          disabled={isSubmitting || isDeleting}
        />
      </div>
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          id="company_name"
          name="company_name"
          value={formData.company_name || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full" // Replace with shadcn Input if used
          required
          disabled={isSubmitting || isDeleting}
        />
      </div>
      <div>
        <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
        <input
          type="email"
          id="company_email"
          name="company_email"
          value={formData.company_email || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full" // Replace with shadcn Input if used
          required
          disabled={isSubmitting || isDeleting}
        />
      </div>
      <div>
        <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 mb-1">Company Phone</label>
        <input
          type="text" // Consider type="tel"
          id="company_phone"
          name="company_phone"
          value={formData.company_phone || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full" // Replace with shadcn Input if used
          required
          disabled={isSubmitting || isDeleting}
        />
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        {/* Replace with shadcn Select if used */}
        <select
          id="gender"
          name="gender"
          value={formData.gender || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
          disabled={isSubmitting || isDeleting}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full" // Replace with shadcn Input if used
          // required // Address might be optional
          disabled={isSubmitting || isDeleting}
        />
      </div>
      <div>
        <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <input
          type="date"
          id="date_of_birth"
          name="date_of_birth"
          value={getFormattedDateValue(formData.date_of_birth)} // Use helper for value
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full" // Replace with shadcn Input if used
          disabled={isSubmitting || isDeleting}
        />
        {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
      </div>

      {/* Use DialogFooter for consistency if this form is in a Dialog */}
      {/* Example using standard buttons, replace with shadcn Button if used */}
      <div className="flex justify-between pt-4">
         {/* Cancel Button */}
         {onCancel && (
             <button
                type="button"
                onClick={onCancel}
                className="bg-gray-200 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-300 disabled:opacity-50" // Replace with shadcn Button variant="outline"
                disabled={isSubmitting || isDeleting}
             >
                Cancel
             </button>
         )}
         {/* Delete Button (only in update mode) */}
         {isUpdateMode && (
           <button
             type="button"
             onClick={handleDelete}
             className="bg-red-500 text-white rounded-md px-4 py-2 hover:bg-red-700 disabled:opacity-50" // Replace with shadcn Button variant="destructive"
             disabled={isDeleting || isSubmitting}
           >
             {isDeleting ? "Deleting..." : "Delete Profile"}
           </button>
         )}
         {/* Submit Button */}
         <button
           type="submit"
           className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-700 disabled:opacity-50" // Replace with shadcn Button variant="default"
           disabled={isSubmitting || isDeleting || !!dateError}
         >
           {isSubmitting
             ? "Submitting..."
             : isUpdateMode
             ? "Update Profile"
             : "Create Profile"}
         </button>
      </div>
    </form>
  );
}
