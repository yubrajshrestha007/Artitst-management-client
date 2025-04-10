// /home/mint/Desktop/ArtistMgntFront/client/hooks/use-management.ts
import { useState, useMemo } from "react";
import { useUsersQuery } from "@/shared/queries/users";
import { useArtistProfileListQuery } from "@/shared/queries/artist-profile";
import { useManagersQuery } from "@/shared/queries/manager-profile";
import { ArtistProfile, ManagerProfile, User } from "@/types/auth";

type ManagementType = "user" | "artist" | "manager" | undefined;

// --- Define the extended type ---
export interface ManagerProfileWithDetails extends ManagerProfile {
  managedArtistCount: number;
  managedArtistNames: string[]; // Array to hold artist names
}
// --- End extended type definition ---

export const useManagementData = (
    type: ManagementType,
    filteredDataProp?: ArtistProfile[]
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
  const rawManagerProfiles: ManagerProfile[] = useMemo(
    () => (Array.isArray(managerProfileData) ? managerProfileData : []),
    [managerProfileData]
  );

  // --- Calculate Manager Artist Counts AND Names ---
  const managerArtistDetailsMap = useMemo(() => {
    const map = new Map<string, { count: number; names: string[] }>();
    allArtistProfiles.forEach(artist => {
      if (artist.manager_id_id) {
        const current = map.get(artist.manager_id_id) || { count: 0, names: [] };
        current.count += 1;
        if (artist.name) { // Only add if name exists
            current.names.push(artist.name);
        }
        map.set(artist.manager_id_id, current);
      }
    });
    return map;
  }, [allArtistProfiles]);

  // --- Enhance Manager Profiles with Count and Names ---
  const managerProfiles: ManagerProfileWithDetails[] = useMemo(() => {
    return rawManagerProfiles.map(manager => {
      const details = manager.id ? managerArtistDetailsMap.get(manager.id) : undefined;
      return {
        ...manager,
        managedArtistCount: details?.count ?? 0,
        managedArtistNames: details?.names ?? [], // Add the names array
      };
    });
  }, [rawManagerProfiles, managerArtistDetailsMap]);
  // --- End Enhancement ---


  const managerMap = useMemo(() => {
    const map = new Map<string, string>();
    rawManagerProfiles.forEach((manager) => {
      if (manager.id) {
        map.set(manager.id, manager.name || "Unnamed Manager");
      }
    });
    return map;
  }, [rawManagerProfiles]);

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
    dataToDisplay: dataToDisplay as (User | ArtistProfile | ManagerProfileWithDetails)[],
    managerMap,
    isLoadingQueries,
  };
};
