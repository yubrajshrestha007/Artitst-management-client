// /home/mint/Desktop/ArtistMgntFront/client/app/(profile)/artist/artist-client.tsx
"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/auth";
import DashboardLayout from "@/app/dashboard/components/dashboard-layout";
import DashboardHeader from "@/app/dashboard/components/dashboard-headers";
import ArtistProfileForm from "@/app/dashboard/components/artist-profile";
import { ArtistProfileDisplay } from "@/app/(profile)/artist/artist-profile-display"; // Import display component
import { CustomModal } from "@/components/ui/custom-modal"; // For delete confirmation
import { Button } from "@/components/ui/button"; // For buttons
import {
  useCreateArtistProfileMutation,
  useUpdateArtistProfileMutation,
  useDeleteArtistProfileMutation, // Import delete mutation
} from "@/shared/queries/artist-profile";
import { useMyArtistProfileQuery } from "@/shared/queries/profiles";
import { useManagersQuery } from "@/shared/queries/manager-profile"; // To get manager name
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { ArtistProfile } from "@/types/auth";
import { useQueryClient } from "@tanstack/react-query"; // Import queryClient

export default function ArtistProfilePageClient() {
  const { isAuthenticated, role, userId } = useAuth();
  const queryClient = useQueryClient(); // Get query client instance

  // State to control view vs edit/create mode
  const [isEditing, setIsEditing] = useState(false);
  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch profile
  const { data: profile, isLoading: myProfileLoading, refetch: refetchProfile } =
    useMyArtistProfileQuery(isAuthenticated && role === 'artist'); // Only fetch if authenticated artist

  // Fetch managers list to display name
  const { data: managersData, isLoading: managersLoading } = useManagersQuery();
  const managerMap = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(managersData)) {
      managersData.forEach(m => {
        if (m.id && m.name) map.set(m.id, m.name);
      });
    }
    return map;
  }, [managersData]);

  // Mutations
  const { mutate: createArtistProfile, isPending: isCreating } = useCreateArtistProfileMutation({
    onSuccess: () => {
      toast.success("Profile created successfully!");
      refetchProfile(); // Refetch profile data
      setIsEditing(false); // Exit editing mode
    },
    onError: (error: Error) => {
      toast.error(`Error creating profile: ${error.message}`);
    },
  });
  const { mutate: updateArtistProfile, isPending: isUpdating } = useUpdateArtistProfileMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      refetchProfile(); // Refetch profile data
      setIsEditing(false); // Exit editing mode
    },
    onError: (error: Error) => {
      toast.error(`Error updating profile: ${error.message}`);
    },
  });
  const { mutate: deleteArtistProfile, isPending: isDeleting } = useDeleteArtistProfileMutation({
      onSuccess: () => {
          toast.success("Profile deleted successfully!");
          queryClient.invalidateQueries({ queryKey: ['myArtistProfile'] }); // Invalidate to clear data
          setIsDeleteModalOpen(false);
          setIsEditing(false); // Ensure not in edit mode after delete
      },
      onError: (error: Error) => {
          toast.error(`Error deleting profile: ${error.message}`);
          setIsDeleteModalOpen(false);
      },
  });

  // --- Permission Checks ---
  if (!isAuthenticated) {
    return ( <DashboardLayout><div className="p-4 text-center">Please log in.</div></DashboardLayout> );
  }
  if (role !== "artist") {
    return ( <DashboardLayout><DashboardHeader /><div className="p-4 text-center text-red-500">Permission Denied.</div></DashboardLayout> );
  }

  // --- Combined Loading State ---
  const isLoading = myProfileLoading || managersLoading; // Include manager loading

  // --- Handlers ---
  const handleProfileSubmit = (data: Partial<ArtistProfile>) => {
    if (profile?.id) { // Update existing
      updateArtistProfile({ id: profile.id, data });
    } else if (userId) { // Create new
      createArtistProfile({ ...data, user_id: userId });
    } else {
      toast.error("Cannot save profile: User information missing.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Optionally reset form state if using react-hook-form, though initialData change should handle it
  };

  const handleDeleteRequest = () => {
    if (profile) { // Only allow delete if profile exists
        setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (profile?.id) {
        deleteArtistProfile(profile.id);
    }
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-1 justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading profile...</span>
        </div>
      );
    }

    // If profile exists and NOT editing: Show Display + Buttons
    if (profile && !isEditing) {
      const managerName = profile.manager_id_id ? managerMap.get(profile.manager_id_id) : null;
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Artist Profile</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteRequest} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete Profile
              </Button>
            </div>
          </div>
          <ArtistProfileDisplay profile={profile} managerName={managerName} />
        </div>
      );
    }

    // If editing existing profile OR creating new profile: Show Form
    if (isEditing || !profile) {
      return (
        <div className="space-y-4">
           <h1 className="text-2xl font-bold">
             {profile ? "Edit Profile" : "Create Profile"}
           </h1>
           <ArtistProfileForm
             onSubmit={handleProfileSubmit}
             initialData={profile} // Pass current profile (null if creating)
             currentUserId={userId}
             isLoading={isCreating || isUpdating} // Pass combined mutation loading state
             onCancel={profile ? handleCancel : undefined} // Only show cancel if updating existing
             // onDeleteSuccess is handled by the delete button outside the form now
           />
        </div>
      );
    }

    // Should not be reached if logic is correct, but added as fallback
    return <div>An unexpected error occurred.</div>;
  };

  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {renderContent()}
      </div>
      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete your artist profile? This action cannot be undone."
        isConfirmLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
