// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/artist-profile.tsx
"use client"
import { useState, useEffect, useMemo } from "react";
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

// Default form data for a new artist profile
const defaultFormData: ArtistProfile = {
  name: "",
  date_of_birth: null,
  gender: "",
  address: "",
  first_release_year: null,
  no_of_albums_released: 0,
  manager_id: null,
};

export default function ArtistProfileForm({
  onSubmit,
  initialData,
}: ArtistProfileFormProps) {
  const [formData, setFormData] = useState<ArtistProfile>(defaultFormData);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentManager, setCurrentManager] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [allManagers, setAllManagers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const { data: usersData } = useUsersQuery();
  const currentUserId = usersData?.currentUserId || null;

  // Fetch artist profile by user ID
  const {
    data: artistProfileData,
    isLoading: isArtistProfileLoading,
    isError: isArtistProfileError,
  } = useArtistProfileByUserIdQuery(
    currentUserId ? currentUserId.toString() : "",
    {
      enabled: !!currentUserId, // Only fetch if currentUserId is available
    }
  );

  const { mutate: deleteArtistProfile, isLoading: isDeleteLoading } =
    useDeleteArtistProfileMutation({
      onSuccess: () => {
        toast.success("Artist profile deleted successfully");
        // Redirect or update UI as needed
      },
      onError: (error) => {
        toast.error(`Error deleting artist profile: ${error.message}`);
      },
    });

  // Memoize fetchManagers
  const memoizedFetchManagers = useMemo(() => fetchManagers, []);

  // Function to reset the form data to default values
  const resetFormData = () => {
    setFormData(defaultFormData);
    setCurrentManager(null);
  };

  // Function to set the form data and current manager
  const setProfileData = (profileData: ArtistProfile) => {
    setFormData(profileData);
    if (profileData.manager_id) {
      const manager = allManagers.find((m) => m.id === profileData.manager_id);
      setCurrentManager(manager || null);
    } else {
      setCurrentManager(null);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        // Fetch managers
        const managersResult = await memoizedFetchManagers();

        if (managersResult.data?.managers) {
          setAllManagers(
            managersResult.data.managers.map((manager) => ({
              id: manager.id || "",
              name: manager.name,
            }))
          );
        }
      } catch (error) {
        setIsError(true);
        toast.error("Error loading managers.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [memoizedFetchManagers]); // Only run when memoizedFetchManagers changes

  useEffect(() => {
    if (initialData) {
      setProfileData(initialData);
    } else if (artistProfileData) {
      setProfileData(artistProfileData);
    } else {
      resetFormData();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        id: initialData?.id || artistProfileData?.id,
        user_id: currentUserId,
      });
    } catch (error) {
      toast.error("Error submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (initialData?.id || artistProfileData?.id) {
      setIsDeleting(true);
      try {
        const idToDelete = initialData?.id || artistProfileData?.id;
        if (idToDelete) {
          await deleteArtistProfile(idToDelete);
        } else {
          toast.error("No valid ID found to delete the artist profile.");
        }
      } catch (error) {
        toast.error("Error deleting artist profile.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Filter out the current manager from the list of all managers
  const availableManagers = allManagers.filter((manager) =>
    currentManager ? manager.id !== currentManager.id : true
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error loading data.</div>;
  }

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
          required
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
          required
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
        {isLoading ? (
          <div>Loading managers...</div>
        ) : isError ? (
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
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Submitting..."
            : initialData || artistProfileData
            ? "Update Profile"
            : "Create Profile"}
        </button>
        {(initialData || artistProfileData) && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white rounded-md p-2 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Profile"}
          </button>
        )}
      </div>
    </form>
  );
}
