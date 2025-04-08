// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/dashboard-card.tsx
import { useUsersQuery } from "@/shared/queries/users";
import { useArtistProfileListQuery } from "@/shared/queries/artist-profile";
import { useManagersQuery } from "@/shared/queries/manager-profile";
import { useMusicListQuery } from "@/shared/queries/music"; // Import music query
import { useMyArtistProfileQuery } from "@/shared/queries/profiles"; // Import artist profile query for the current user
import { Loader2, Music } from "lucide-react"; // Import loader and Music icon

export default function DashboardCards() {
  // Fetch user data (includes role and user ID)
  const { data: usersData, isLoading: isLoadingUsers } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";
  const currentUserId = usersData?.currentUserId || null; // Get current user ID

  // Fetch artist profile data (for counts shown to admin/manager)
  const { data: allArtistProfilesData, isLoading: isLoadingAllArtists } = useArtistProfileListQuery();

  // Fetch manager profile data (for counts shown to admin)
  const { data: managerProfileData, isLoading: isLoadingManagers } = useManagersQuery();

  // Fetch the logged-in user's artist profile if they are an artist
  const { data: myArtistProfile, isLoading: isLoadingMyArtistProfile } = useMyArtistProfileQuery(
      currentUserRole === "artist" // Only fetch if the role is artist
  );
  const myArtistProfileId = myArtistProfile?.id || null; // Get the artist profile ID

  // Fetch music list data
  const { data: musicListData, isLoading: isLoadingMusic } = useMusicListQuery();

  // Combine loading states
  const isLoading =
    isLoadingUsers ||
    isLoadingAllArtists ||
    isLoadingManagers ||
    isLoadingMusic ||
    (currentUserRole === "artist" && isLoadingMyArtistProfile); // Include profile loading if artist

  // Extract data, providing default empty arrays
  const users = usersData?.users || [];
  const allArtistProfiles = allArtistProfilesData || [];
  const managerProfiles = managerProfileData || [];
  const allMusic = musicListData || [];

  // Calculate counts
  const totalArtistCount = allArtistProfiles.length;
  const artistManagerCount = managerProfiles.length;
  const totalUserCount = users.length;

  // Calculate music count for the logged-in artist
  const myMusicCount =
    currentUserRole === "artist" && myArtistProfileId
      ? allMusic.filter((music) => music.created_by_id === myArtistProfileId).length
      : 0;

  // Display loading state
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
      {/* --- Cards for Super Admin --- */}
      {currentUserRole === "super_admin" && (
        <>
          {/* Artist Card */}
          <div className="bg-blue-100 border border-blue-300 aspect-video rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-700">Artists</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">{totalArtistCount}</p>
            <p className="text-sm text-blue-500 mt-1">Total Artist Profiles</p>
          </div>
          {/* Artist Manager Card */}
          <div className="bg-green-100 border border-green-300 aspect-video rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-green-700">
              Artist Managers
            </h3>
            <p className="text-4xl font-bold text-green-600 mt-2">{artistManagerCount}</p>
            <p className="text-sm text-green-500 mt-1">Total Manager Profiles</p>
          </div>
          {/* Total User Card */}
          <div className="bg-yellow-100 border border-yellow-300 aspect-video rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-yellow-700">Total Users</h3>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{totalUserCount}</p>
            <p className="text-sm text-yellow-500 mt-1">Total Registered Users</p>
          </div>
        </>
      )}

      {/* --- Cards for Artist Manager --- */}
      {currentUserRole === "artist_manager" && (
        <>
          {/* Total Artists Card */}
          <div className="bg-purple-100 border border-purple-300 aspect-video rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-purple-700">
              Managed Artists
            </h3>
            {/* Note: This currently shows ALL artists. You'd need to filter based on manager ID if required */}
            <p className="text-4xl font-bold text-purple-600 mt-2">{totalArtistCount}</p>
            <p className="text-sm text-purple-500 mt-1">Total Artist Profiles Managed</p>
          </div>
        </>
      )}

      {/* --- Card for Artist --- */}
      {currentUserRole === "artist" && (
        <div className="bg-red-100 border border-red-300 aspect-video rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-red-700">
            My Music
          </h3>
          <p className="text-4xl font-bold text-red-600 mt-2">{myMusicCount}</p>
          <p className="text-sm text-red-500 mt-1">Total Tracks Uploaded</p>
          <Music className="w-6 h-6 text-red-500 mt-2" /> {/* Optional Icon */}
        </div>
      )}
    </div>
  );
}
