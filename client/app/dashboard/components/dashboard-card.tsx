// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/dashboard-card.tsx
"use client";

import { useUsersQuery } from "@/shared/queries/users";
import { useArtistProfileListQuery } from "@/shared/queries/artist-profile";
import { useManagersQuery } from "@/shared/queries/manager-profile";
import { useMusicListQuery } from "@/shared/queries/music";
import { useMyArtistProfileQuery } from "@/shared/queries/profiles";
import { Loader2, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react"; // Ensure useMemo is imported

export default function DashboardCards() {
  const { data: usersData, isLoading: isLoadingUsers } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";

  // Always call hooks — even if you don't use their result later
  const artistProfilesQuery = useArtistProfileListQuery();
  const managerProfilesQuery = useManagersQuery();
  const musicListQuery = useMusicListQuery();
  const isAuthenticated = !!usersData; // Assuming authentication is based on the presence of user data
  const myArtistProfileQuery = useMyArtistProfileQuery(isAuthenticated);

  // --- FIX: Wrap derived data initializations in useMemo ---
  const allArtistProfiles = useMemo(() =>
    Array.isArray(artistProfilesQuery.data) ? artistProfilesQuery.data : [],
    [artistProfilesQuery.data] // Dependency is the raw query data
  );
  const managerProfiles = useMemo(() =>
    Array.isArray(managerProfilesQuery.data) ? managerProfilesQuery.data : [],
    [managerProfilesQuery.data] // Dependency is the raw query data
  );
  const allMusic = useMemo(() =>
    Array.isArray(musicListQuery.data) ? musicListQuery.data : [],
    [musicListQuery.data] // Dependency is the raw query data
  );
  // --- END FIX ---

  // Extract other data safely
  const myArtistProfile = myArtistProfileQuery.data || null;
  const users = usersData?.users || []; // This is likely fine as is, but could also be memoized if usersData changes often

  const myArtistProfileId = myArtistProfile?.id || null;

  const totalArtistCount = currentUserRole !== "artist" ? allArtistProfiles.length : 0;
  const artistManagerCount = currentUserRole === "super_admin" ? managerProfiles.length : 0;
  const totalUserCount = currentUserRole === "super_admin" ? users.length : 0;

  // This useMemo now depends on the memoized 'allMusic'
  const myMusicCount = useMemo(() => {
    if (currentUserRole !== "artist" || !myArtistProfileId) return 0;
    return allMusic.filter((music) => music.created_by_id === myArtistProfileId).length;
  }, [currentUserRole, myArtistProfileId, allMusic]); // Dependency 'allMusic' is now stable

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

  // These useMemo hooks now depend on the memoized arrays
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
          // Assuming you want the count of artists managed by *this* manager
          // You might need to filter allArtistProfiles based on manager ID here
          count={allArtistProfiles.length} // Adjust this logic if needed
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

// Card component remains the same
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
  // Define color classes explicitly to prevent Tailwind purging issues
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      textTitle: 'text-blue-700',
      textCount: 'text-blue-600',
      textSubtitle: 'text-blue-500',
      textLatest: 'text-blue-400',
    },
    green: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      textTitle: 'text-green-700',
      textCount: 'text-green-600',
      textSubtitle: 'text-green-500',
      textLatest: 'text-green-400',
    },
    yellow: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      textTitle: 'text-yellow-700',
      textCount: 'text-yellow-600',
      textSubtitle: 'text-yellow-500',
      textLatest: 'text-yellow-400',
    },
    purple: {
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      textTitle: 'text-purple-700',
      textCount: 'text-purple-600',
      textSubtitle: 'text-purple-500',
      textLatest: 'text-purple-400',
    },
    red: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      textTitle: 'text-red-700',
      textCount: 'text-red-600',
      textSubtitle: 'text-red-500',
      textLatest: 'text-red-400',
    },
  };

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue; // Fallback to blue

  return (
    <div
      className={`${classes.bg} ${classes.border} aspect-video rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow border`}
    >
      <h3 className={`text-lg font-semibold ${classes.textTitle}`}>{title}</h3>
      <p className={`text-4xl font-bold ${classes.textCount} mt-2`}>{count}</p>
      <p className={`text-sm ${classes.textSubtitle} mt-1`}>{subtitle}</p>
      {latest && (
        <p className={`text-xs ${classes.textLatest} mt-1`}>Last created {latest}</p>
      )}
      {icon && icon}
    </div>
  );
}
