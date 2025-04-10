// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/artist-management-client.tsx
"use client";

import { useMemo } from "react";
import { useUsersQuery } from "@/shared/queries/users";
import { useAuth } from "@/hooks/auth";
import { useMyManagerProfileQuery } from "@/shared/queries/profiles";
import { useArtistProfileListQuery } from "@/shared/queries/artist-profile";
import { Loader2 } from "lucide-react"; // Import Loader2 for loading state
import UserManagementTable from "./management-table";

export default function ArtistManagementClient() {
  // All the hooks and client-side logic are now here
  const { data: usersData } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";
  const { userId } = useAuth(); // Get the logged-in user's ID

  // Fetch the manager's profile only if the user is logged in
  const { data: managerProfile, isLoading: isManagerProfileLoading } =
    useMyManagerProfileQuery(!!userId);

  // Fetch the list of all artist profiles
  const { data: artistProfileData, isLoading: isArtistProfilesLoading } =
    useArtistProfileListQuery();

  // Memoize the artist profiles list to prevent unnecessary recalculations
  const artistProfiles = useMemo(() =>
    Array.isArray(artistProfileData) ? artistProfileData : [],
    [artistProfileData]
  );

  // Get the manager's ID from their profile
  const managerId = managerProfile?.id;

  // Filter artist profiles based on the manager's ID if the current user is a manager
  const filteredArtistProfiles = useMemo(() => {
    // If not an artist manager or managerId is not yet available, return all profiles
    if (currentUserRole !== "artist_manager" || !managerId) {
      return artistProfiles;
    }
    // Otherwise, filter the profiles
    return artistProfiles.filter(
      (artist) => artist.manager_id_id === managerId
    );
  }, [artistProfiles, managerId, currentUserRole]);

  // Combine loading states
  const isLoading = isManagerProfileLoading || isArtistProfilesLoading;

  // Display loading state within this client component
  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading artist data...</span>
      </div>
    );
  }

  // Render the table with potentially filtered data
  return (
    <UserManagementTable
      currentUserRole={currentUserRole}
      type="artist"
      // Pass the filtered list if the user is a manager, otherwise pass the full list
      filteredData={currentUserRole === "artist_manager" ? filteredArtistProfiles : artistProfiles}
    />
  );
}
