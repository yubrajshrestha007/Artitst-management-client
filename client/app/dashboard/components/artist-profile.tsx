// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/artist-profile.tsx
import { useState, useEffect } from "react";
import { ArtistProfile } from "@/shared/queries/artist-profile";
import { useUsersQuery } from "@/shared/queries/users";
import {
  useDeleteArtistProfileMutation,
  useArtistProfileByUserIdQuery, // Import the new query
} from "@/shared/queries/artist-profile";
import { toast } from "sonner";
import { useManagersQuery } from "@/shared/queries/manager-profile"; // Import the new query

interface ArtistProfileFormProps {
  onSubmit: (data: ArtistProfile) => void;
  initialData?: ArtistProfile;
}

export default function ArtistProfileForm({
  onSubmit,
  initialData,
}: ArtistProfileFormProps) {
  const [formData, setFormData] = useState<ArtistProfile>({
    name: "",
    date_of_birth: null,
    gender: "",
    address: "",
    first_release_year: null,
    no_of_albums_released: 0,
    manager_id: null,
  });
  const { data: usersData } = useUsersQuery();
  const currentUserId = usersData?.currentUserId || null;

  // Fetch artist profile by user ID
  const { data: artistProfileData } = useArtistProfileByUserIdQuery(
    currentUserId ? currentUserId.toString() : ""
  );

  const { mutate: deleteArtistProfile } = useDeleteArtistProfileMutation({
    onSuccess: () => {
      toast.success("Artist profile deleted successfully");
      // Redirect or update UI as needed
    },
    onError: (error) => {
      toast.error(`Error deleting artist profile: ${error.message}`);
    },
  });

  // Fetch the list of managers
  const {
    data: managersData,
    isLoading: managersLoading,
    isError: managersError,
  } = useManagersQuery();
  const managers = managersData?.managers || [];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (artistProfileData) {
      setFormData(artistProfileData);
    }
  }, [initialData, artistProfileData]);

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
    onSubmit({ ...formData, id: initialData?.id || artistProfileData?.id, user_id: currentUserId });
  };

  const handleDelete = () => {
    if (initialData?.id || artistProfileData?.id) {
      deleteArtistProfile(initialData?.id || artistProfileData?.id);
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
        <label htmlFor="first_release_year">First Release Year</label>
        <input
          type="number"
          id="first_release_year"
          name="first_release_year"
          value={formData.first_release_year || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      <div>
        <label htmlFor="no_of_albums_released">No. of Albums Released</label>
        <input
          type="number"
          id="no_of_albums_released"
          name="no_of_albums_released"
          value={formData.no_of_albums_released}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      {/* Manager Select */}
      <div>
        <label htmlFor="manager_id">Manager</label>
        {managersLoading ? (
          <div>Loading managers...</div>
        ) : managersError ? (
          <div>Error loading managers.</div>
        ) : managers.length === 0 ? (
          <div>No managers found.</div>
        ) : (
          <select
            id="manager_id"
            name="manager_id"
            value={formData.manager_id || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 w-full"
          >
            <option value="">Select a manager</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-700"
        >
          {initialData || artistProfileData ? "Update Profile" : "Create Profile"}
        </button>
        {(initialData || artistProfileData) && (
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
