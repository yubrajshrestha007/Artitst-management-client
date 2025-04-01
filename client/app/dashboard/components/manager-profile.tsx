// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/manager-profile.tsx
import { useState, useEffect } from "react";
import { ManagerProfile } from "@/shared/queries/manager-profile";
import { useUsersQuery } from "@/shared/queries/users";
import { useDeleteManagerProfileMutation } from "@/shared/queries/manager-profile";
import { toast } from "sonner";

interface ManagerProfileFormProps {
  onSubmit: (data: ManagerProfile) => void;
  initialData?: ManagerProfile;
}

export default function ManagerProfileForm({
  onSubmit,
  initialData,
}: ManagerProfileFormProps) {
  const [formData, setFormData] = useState<ManagerProfile>({
    name: "",
    company_name: "",
    company_email: "",
    company_phone: "",
    gender: "",
    address: "",
    date_of_birth: null,
    user_id: null,
  });

  const { data: usersData } = useUsersQuery();
  const currentUserId = usersData?.currentUserId || null; // Get the current user ID
  const { mutate: deleteManagerProfile } = useDeleteManagerProfileMutation({
    onSuccess: () => {
      toast.error("Manager profile deleted successfully");
      // Redirect or update UI as needed
    },
    onError: (error) => {
      toast.error(`Error deleting manager profile: ${error}`);
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        user_id: currentUserId, // Set the user_id when creating a new profile
      }));
    }
  }, [initialData, currentUserId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: initialData?.id, user_id: currentUserId }); // Include user_id when submitting
  };

  const handleDelete = () => {
    if (initialData?.id) {
      deleteManagerProfile(initialData.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      <div>
        <label htmlFor="company_name">Company Name</label>
        <input
          type="text"
          id="company_name"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      <div>
        <label htmlFor="company_email">Company Email</label>
        <input
          type="email"
          id="company_email"
          name="company_email"
          value={formData.company_email}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      <div>
        <label htmlFor="company_phone">Company Phone</label>
        <input
          type="text"
          id="company_phone"
          name="company_phone"
          value={formData.company_phone}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      <div>
        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      <div>
        <label htmlFor="date_of_birth">Date of Birth</label>
        <input
          type="date"
          id="date_of_birth"
          name="date_of_birth"
          value={formData.date_of_birth || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-700"
        >
          {initialData ? "Update Profile" : "Create Profile"}
        </button>
        {initialData && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white rounded-md p-2 hover:bg-red-700"
          >
            Delete Profile
          </button>
        )}
      </div>
    </form>
  );
}
