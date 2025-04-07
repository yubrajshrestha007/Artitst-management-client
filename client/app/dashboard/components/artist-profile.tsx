// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/artist-profile.tsx
"use client";
import { useState, useMemo, useCallback } from "react";
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
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(
    null
  );
  const [allManagers, setAllManagers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const { data: usersData } = useUsersQuery();
  const currentUserId = usersData?.currentUserId || null;

  // Fetch artist profile by user ID
  const { data: artistProfileData } = useArtistProfileByUserIdQuery(
    currentUserId ? currentUserId.toString() : "",
    {
      enabled: !!currentUserId, // Only fetch if currentUserId is available
    }
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

  // Memoize fetchManagers
  const memoizedFetchManagers = useMemo(() => fetchManagers, []);

  // Function to reset the form data to default values
  const resetFormData = useCallback(() => {
    setFormData(defaultFormData);
    setSelectedManagerId(null);
  }, []);

  // Function to set the form data
  const setProfileData = useCallback(
    (profileData: ArtistProfile) => {
      setFormData(profileData);
      setSelectedManagerId(profileData.manager_id || null);
    },
    []
  );

  // Fetch managers only once
  useMemo(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const managersResult = await memoizedFetchManagers();
      if (managersResult) {
        setAllManagers(
          managersResult.map((manager) => ({
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
  }, [memoizedFetchManagers]);

  // Set initial data or artist profile data
  useMemo(() => {
    if (initialData) {
      setProfileData(initialData);
    } else if (artistProfileData) {
      setProfileData(artistProfileData);
    } else {
      resetFormData();
    }
  }, [initialData, artistProfileData, setProfileData, resetFormData]);

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
    },
    []
  );

  const handleManagerChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const managerId = e.target.value;
      setSelectedManagerId(managerId === "" ? null : managerId);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit({
          ...formData,
          id: initialData?.id || artistProfileData?.id,
          user_id: currentUserId,
          manager_id: selectedManagerId, // Use selectedManagerId here
        });
      } catch (error) {
        toast.error("Error submitting the form.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      initialData?.id,
      artistProfileData?.id,
      currentUserId,
      selectedManagerId,
      onSubmit,
    ]
  );

  const handleDelete = useCallback(async () => {
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
  }, [initialData?.id, artistProfileData?.id, deleteArtistProfile]);

  // Filter out the current manager from the list of all managers
  const availableManagers = useMemo(
    () =>
      allManagers.filter((manager) =>
        selectedManagerId ? manager.id !== selectedManagerId : true
      ),
    [allManagers, selectedManagerId]
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
            {selectedManagerId ? (
              <div className="mb-2">
                Current Manager:{" "}
                {
                  allManagers.find((m) => m.id === selectedManagerId)?.name
                }
              </div>
            ) : (
              <div className="mb-2">No Manager Assigned</div>
            )}

            {(selectedManagerId || availableManagers.length > 0) && (
              <select
                id="manager_id"
                name="manager_id"
                value={selectedManagerId || ""}
                onChange={handleManagerChange}
                className="border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="">
                  {selectedManagerId ? "Change Manager" : "Select a manager"}
                </option>
                {availableManagers.map(
                  (manager: { id: string; name: string }) => {
                    // Check if manager.id is an empty string and skip rendering if it is
                    if (manager.id === "") {
                      return null;
                    }
                    return (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    );
                  }
                )}
              </select>
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
