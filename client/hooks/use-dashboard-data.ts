// /home/mint/Desktop/ArtistMgntFront/client/hooks/useDashboardData.ts
import { useMemo } from "react";
import { useUsersQuery } from "@/shared/queries/users";
import { useArtistProfileListQuery } from "@/shared/queries/artist-profile";
import { useManagersQuery } from "@/shared/queries/manager-profile";
import { useMusicListQuery } from "@/shared/queries/music";
import { useMyArtistProfileQuery, useMyManagerProfileQuery } from "@/shared/queries/profiles";
import { getLatestValidDate } from "@/lib/utils"; // Import helper

export const useDashboardData = () => {
  // --- Queries ---
  const { data: usersData, isLoading: isLoadingUsers } = useUsersQuery();
  const artistProfilesQuery = useArtistProfileListQuery();
  const managerProfilesQuery = useManagersQuery();
  const musicListQuery = useMusicListQuery();
  // Fetch current user's specific profile based on potential role
  const isAuthenticated = !!usersData; // Basic check
  const myArtistProfileQuery = useMyArtistProfileQuery(isAuthenticated);
  const myManagerProfileQuery = useMyManagerProfileQuery(isAuthenticated);

  // --- Memoized Raw Data ---
  const currentUserRole = useMemo(() => usersData?.currentUserRole || "", [usersData]);
  const users = useMemo(() => usersData?.users || [], [usersData]);
  const allArtistProfiles = useMemo(() =>
    Array.isArray(artistProfilesQuery.data) ? artistProfilesQuery.data : [],
    [artistProfilesQuery.data]
  );
  const managerProfiles = useMemo(() =>
    Array.isArray(managerProfilesQuery.data) ? managerProfilesQuery.data : [],
    [managerProfilesQuery.data]
  );
  const allMusic = useMemo(() =>
    Array.isArray(musicListQuery.data) ? musicListQuery.data : [],
    [musicListQuery.data]
  );
  const myArtistProfile = useMemo(() => myArtistProfileQuery.data || null, [myArtistProfileQuery.data]);
  const myManagerProfile = useMemo(() => myManagerProfileQuery.data || null, [myManagerProfileQuery.data]);

  // --- Calculations (Memoized) ---
  const myArtistProfileId = useMemo(() => myArtistProfile?.id || null, [myArtistProfile]);
  const myManagerId = useMemo(() => myManagerProfile?.id || null, [myManagerProfile]);

  const totalArtistCount = useMemo(() => allArtistProfiles.length, [allArtistProfiles]);
  const artistManagerCount = useMemo(() => managerProfiles.length, [managerProfiles]);
  const totalUserCount = useMemo(() => users.length, [users]);

  const managedArtistCount = useMemo(() => {
    if (currentUserRole !== "artist_manager" || !myManagerId) return 0;
    return allArtistProfiles.filter(artist => artist.manager_id_id === myManagerId).length;
  }, [currentUserRole, myManagerId, allArtistProfiles]);

  const myMusicCount = useMemo(() => {
    if (currentUserRole !== "artist" || !myArtistProfileId) return 0;
    return allMusic.filter(music => music.created_by_id === myArtistProfileId).length;
  }, [currentUserRole, myArtistProfileId, allMusic]);

  const latestArtistCreation = useMemo(() => getLatestValidDate(allArtistProfiles), [allArtistProfiles]);
  const latestManagerCreation = useMemo(() => getLatestValidDate(managerProfiles), [managerProfiles]);
  const latestMusicCreation = useMemo(() => getLatestValidDate(allMusic), [allMusic]); // Pass music items directly
  const latestUserCreation = useMemo(() => getLatestValidDate(users), [users]); // Assuming User type has 'created'

  // --- Loading State ---
  const isLoading = useMemo(() => (
    isLoadingUsers ||
    artistProfilesQuery.isLoading ||
    managerProfilesQuery.isLoading ||
    musicListQuery.isLoading ||
    myArtistProfileQuery.isLoading ||
    myManagerProfileQuery.isLoading
  ), [
    isLoadingUsers,
    artistProfilesQuery.isLoading,
    managerProfilesQuery.isLoading,
    musicListQuery.isLoading,
    myArtistProfileQuery.isLoading,
    myManagerProfileQuery.isLoading,
  ]);

  return {
    currentUserRole,
    isLoading,
    totalArtistCount,
    artistManagerCount,
    totalUserCount,
    managedArtistCount,
    myMusicCount,
    latestArtistCreation,
    latestManagerCreation,
    latestMusicCreation,
    latestUserCreation,
  };
};
