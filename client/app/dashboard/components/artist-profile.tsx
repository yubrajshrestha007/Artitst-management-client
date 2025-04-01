// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/artist-profile.tsx
import { useState, useEffect } from "react";
import { ArtistProfile } from "@/shared/queries/artist-profile";
import { useUsersQuery } from "@/shared/queries/users";
import {
  useDeleteArtistProfileMutation,
  useArtistProfileByUserIdQuery,
} from "@/shared/queries/artist-profile";
import { toast } from "sonner";
import { fetchManagers } from "@/shared/queries/manager-profile";

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
  } = fetchManagers();
  const allManagers: { id: string; name: string }[] =
    managersData?.managers?.map((manager) => ({
      id: manager.id || "",
      name: manager.name,
    })) || [];

  // State to hold the current manager of the artist
  const [currentManager, setCurrentManager] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      // If initialData has a manager_id, find and set the current manager
      if (initialData.manager_id) {
        const manager = allManagers.find(
          (m) => m.id === initialData.manager_id
        );
        setCurrentManager(manager || null);
      } else {
        setCurrentManager(null);
      }
    } else if (artistProfileData) {
      setFormData(artistProfileData);
      // If artistProfileData has a manager_id, find and set the current manager
      if (artistProfileData.manager_id) {
        const manager = allManagers.find(
          (m) => m.id === artistProfileData.manager_id
        );
        setCurrentManager(manager || null);
      } else {
        setCurrentManager(null);
      }
    } else {
      setCurrentManager(null);
    }
  }, [initialData, artistProfileData, allManagers]);

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
    onSubmit({
      ...formData,
      id: initialData?.id || artistProfileData?.id,
      user_id: currentUserId,
    });
  };

  const handleDelete = () => {
    if (initialData?.id || artistProfileData?.id) {
      const idToDelete = initialData?.id || artistProfileData?.id;
      if (idToDelete) {
        deleteArtistProfile(idToDelete);
      } else {
        toast.error("No valid ID found to delete the artist profile.");
      }
    }
  };

  // Filter out the current manager from the list of all managers
  const availableManagers = allManagers.filter((manager) =>
    currentManager ? manager.id !== currentManager.id : true
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* ... (other form fields) */}
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
        ) : (
          <>
            {currentManager ? (
              <div className="mb-2">
                Current Manager: {currentManager.name}
              </div>
            ) : (
              <div className="mb-2">No Manager Assigned</div>
            )}

            {currentManager || availableManagers.length > 0 ? (
              <select
                id="manager_id"
                name="manager_id"
                value={formData.manager_id || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="">
                  {currentManager ? "Change Manager" : "Select a manager"}
                </option>
                {availableManagers.map(
                  (manager: { id: string; name: string }) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  )
                )}
              </select>
            ) : (
              <div>
                {currentManager
                  ? "No other managers available."
                  : "No managers available."}
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-700"
        >
          {initialData || artistProfileData
            ? "Update Profile"
            : "Create Profile"}
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
