"use client";

import { useUsersQuery } from "@/shared/queries/users";
import { useArtistProfileListQuery } from "@/shared/queries/artist-profile";
import { useManagersQuery } from "@/shared/queries/manager-profile";
import { useMusicListQuery } from "@/shared/queries/music";
import { useMyArtistProfileQuery } from "@/shared/queries/profiles";
import { Loader2, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";

export default function DashboardCards() {
  const { data: usersData, isLoading: isLoadingUsers } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";

  // Always call hooks — even if you don't use their result later
  const artistProfilesQuery = useArtistProfileListQuery();
  const managerProfilesQuery = useManagersQuery();
  const musicListQuery = useMusicListQuery();
  const isAuthenticated = !!usersData; // Assuming authentication is based on the presence of user data
  const myArtistProfileQuery = useMyArtistProfileQuery(isAuthenticated);

  // Extract data safely
  const allArtistProfiles = Array.isArray(artistProfilesQuery.data) ? artistProfilesQuery.data : [];
  const managerProfiles = Array.isArray(managerProfilesQuery.data) ? managerProfilesQuery.data : [];
  const allMusic = Array.isArray(musicListQuery.data) ? musicListQuery.data : [];
  const myArtistProfile = myArtistProfileQuery.data || null;
  const users = usersData?.users || [];

  const myArtistProfileId = myArtistProfile?.id || null;

  const totalArtistCount = currentUserRole !== "artist" ? allArtistProfiles.length : 0;
  const artistManagerCount = currentUserRole === "super_admin" ? managerProfiles.length : 0;
  const totalUserCount = currentUserRole === "super_admin" ? users.length : 0;

  const myMusicCount = useMemo(() => {
    if (currentUserRole !== "artist" || !myArtistProfileId) return 0;
    return allMusic.filter((music) => music.created_by_id === myArtistProfileId).length;
  }, [currentUserRole, myArtistProfileId, allMusic]);

  const getLatestValidDate = (items: Array<{ created?: string | Date | null }>): Date | null => {
    const validDates = items
      .map((item) => {
        if (!item?.created) return null;
        const date = new Date(item.created);
        return isNaN(date.getTime()) ? null : date;
      })
      .filter((date): date is Date => date !== null);

    return validDates.length > 0 ? new Date(Math.max(...validDates.map((d) => d.getTime()))) : null;
  };

  const latestArtistCreation = useMemo(() => getLatestValidDate(allArtistProfiles), [allArtistProfiles]);
  const latestManagerCreation = useMemo(() => getLatestValidDate(managerProfiles), [managerProfiles]);
  const latestMusicCreation = useMemo(
    () => getLatestValidDate(allMusic.map((music) => ({ created: music.created }))),
    [allMusic]
  );

  const isLoading =
    isLoadingUsers ||
    artistProfilesQuery.isLoading ||
    managerProfilesQuery.isLoading ||
    musicListQuery.isLoading ||
    myArtistProfileQuery.isLoading;

  const formatRelativeTime = (date: Date | null): string | null => {
    if (!date || isNaN(date.getTime())) return null;
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (err) {
      console.error("Date formatting error", err);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      {currentUserRole === "super_admin" && (
        <>
          <Card
            title="Artists"
            count={totalArtistCount}
            subtitle="Total Artist Profiles"
            latest={formatRelativeTime(latestArtistCreation)}
            color="blue"
          />
          <Card
            title="Artist Managers"
            count={artistManagerCount}
            subtitle="Total Manager Profiles"
            latest={formatRelativeTime(latestManagerCreation)}
            color="green"
          />
          <Card
            title="Total Users"
            count={totalUserCount}
            subtitle="Total Registered Users"
            color="yellow"
          />
        </>
      )}

      {currentUserRole === "artist_manager" && (
        <Card
          title="Managed Artists"
          count={totalArtistCount}
          subtitle="Total Artist Profiles Managed"
          latest={formatRelativeTime(latestArtistCreation)}
          color="purple"
        />
      )}

      {currentUserRole === "artist" && (
        <Card
          title="My Music"
          count={myMusicCount}
          subtitle="Total Tracks Uploaded"
          latest={formatRelativeTime(latestMusicCreation)}
          color="red"
          icon={<Music className="w-6 h-6 text-red-500 mt-2" />}
        />
      )}
    </div>
  );
}

function Card({
  title,
  count,
  subtitle,
  latest,
  color,
  icon,
}: {
  title: string;
  count: number;
  subtitle: string;
  latest?: string | null;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-${color}-100 border border-${color}-300 aspect-video rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow`}
    >
      <h3 className={`text-lg font-semibold text-${color}-700`}>{title}</h3>
      <p className={`text-4xl font-bold text-${color}-600 mt-2`}>{count}</p>
      <p className={`text-sm text-${color}-500 mt-1`}>{subtitle}</p>
      {latest && (
        <p className={`text-xs text-${color}-400 mt-1`}>Last created {latest}</p>
      )}
      {icon && icon}
    </div>
  );
}
