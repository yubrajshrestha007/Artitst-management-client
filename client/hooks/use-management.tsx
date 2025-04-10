// /home/mint/Desktop/ArtistMgntFront/client/hooks/useManagementData.ts
import { useState, useMemo } from "react";
import { useUsersQuery } from "@/shared/queries/users";
import { useArtistProfileListQuery } from "@/shared/queries/artist-profile";
import { useManagersQuery } from "@/shared/queries/manager-profile";
import { ArtistProfile, ManagerProfile, User } from "@/types/auth";

type ManagementType = "user" | "artist" | "manager" | undefined;

export const useManagementData = (
    type: ManagementType,
    filteredDataProp?: ArtistProfile[] // For manager's specific artist list
) => {
  const [searchTerm, setSearchTerm] = useState("");

  // --- Queries ---
  const { data: usersData, isLoading: isUsersLoading } = useUsersQuery();
  const { data: artistProfileData, isLoading: isArtistProfilesLoading } = useArtistProfileListQuery();
  const { data: managerProfileData, isLoading: isManagerProfilesLoading } = useManagersQuery();

  // --- Memoized Raw Data ---
  const users = useMemo(() => usersData?.users || [], [usersData]);
  const allArtistProfiles = useMemo(
    () => (Array.isArray(artistProfileData) ? artistProfileData : []),
    [artistProfileData]
  );
  const managerProfiles: ManagerProfile[] = useMemo(
    () => (Array.isArray(managerProfileData) ? managerProfileData : []),
    [managerProfileData]
  );
  const managerMap = useMemo(() => {
    const map = new Map<string, string>();
    managerProfiles.forEach((manager) => {
      if (manager.id) {
        map.set(manager.id, manager.name || "Unnamed Manager");
      }
    });
    return map;
  }, [managerProfiles]);

  // --- Loading State ---
  const isLoadingQueries = isUsersLoading || isArtistProfilesLoading || isManagerProfilesLoading;

  // --- Memoized Filtered Data ---
  const dataToDisplay = useMemo(() => {
    const term = searchTerm.toLowerCase();
    switch (type) {
      case "user":
        return users.filter((user) => user.email.toLowerCase().includes(term));
      case "artist":
        const profilesToFilter = filteredDataProp || allArtistProfiles;
        return profilesToFilter.filter(
          (artist) =>
            artist.name?.toLowerCase().includes(term) ||
            managerMap.get(artist.manager_id_id || "")?.toLowerCase().includes(term)
        );
      case "manager":
        return managerProfiles.filter((manager) =>
          manager.name?.toLowerCase().includes(term)
        );
      default:
        return [];
    }
  }, [searchTerm, type, users, allArtistProfiles, managerProfiles, managerMap, filteredDataProp]);

  return {
    searchTerm,
    setSearchTerm,
    dataToDisplay,
    managerMap,
    isLoadingQueries,
    // Optionally return raw data if needed elsewhere
    // users,
    // allArtistProfiles,
    // managerProfiles,
  };
};
