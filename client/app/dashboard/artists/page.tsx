// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/artists/page.tsx
"use client";
import DashboardHeader from "@/app/dashboard/components/dashboard-headers";
import DashboardLayout from "@/app/dashboard/components/dashboard-layout";
import UserManagementTable from "@/app/dashboard/components/management-table";
import { useUsersQuery } from "@/shared/queries/users";
import { useAuth } from "@/hooks/auth"; // Import useAuth
import { useMyManagerProfileQuery } from "@/shared/queries/profiles"; // Import useMyManagerProfileQuery
import { useMemo } from "react";
import { useArtistProfileListQuery } from "@/shared/queries/artist-profile";

export default function ArtistProfileManagementPage() {
  const { data: usersData } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";
  const { userId } = useAuth(); // Get the logged-in user's ID
  const { data: managerProfile, isLoading: isManagerProfileLoading } =
    useMyManagerProfileQuery(!!userId); // Fetch the manager's profile
  const { data: artistProfileData, isLoading: isArtistProfilesLoading } =
    useArtistProfileListQuery();
  const artistProfiles = Array.isArray(artistProfileData) ? artistProfileData : [];

  // Get the manager's ID from the profile
  const managerId = managerProfile?.id;

  // Filter artist profiles based on the manager's ID
  const filteredArtistProfiles = useMemo(() => {
    if (currentUserRole !== "artist_manager" || !managerId) {
      return artistProfiles; // Return all if not a manager or no manager ID
    }
    return artistProfiles.filter(
      (artist) => artist.manager_id_id === managerId
    );
  }, [artistProfiles, managerId, currentUserRole]);

  const isLoading = isManagerProfileLoading || isArtistProfilesLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="p-4 text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />
      <UserManagementTable
        currentUserRole={currentUserRole}
        type="artist"
        filteredData={filteredArtistProfiles} // Pass the filtered data
      />
    </DashboardLayout>
  );
}
