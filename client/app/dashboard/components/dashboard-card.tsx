// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/dashboard-cards.tsx
"use client";

// Import necessary icons, including LibraryMusic
import { Loader2, Users, UserCog, Music, Mic } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data"; // Import the custom hook
import { DashboardCardItem } from "./dashboard-card-data"; // Import the enhanced card item

export default function DashboardCards() {
  // Use the hook to get all necessary data
  const {
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
  } = useDashboardData();

  // Loading State - with padding
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6"> {/* Keep padding */}
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  // Main container with padding (margin from sidebar) and grid layout
  return (
    // Added padding (p-4) and smaller gap (gap-3)
    <div className="p-4 grid auto-rows-min gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

      {/* Super Admin View - Render cards directly */}
      {currentUserRole === "super_admin" && (
        <>
          <DashboardCardItem
            title="Total Users"
            count={totalUserCount}
            subtitle="Registered Users"
            latestDate={latestUserCreation}
            Icon={Users}
            color="blue"
          />
          <DashboardCardItem
            title="Artists"
            count={totalArtistCount}
            subtitle="Artist Profiles"
            latestDate={latestArtistCreation}
            Icon={Mic}
            color="red"
          />
          <DashboardCardItem
            title="Artist Managers"
            count={artistManagerCount}
            subtitle="Manager Profiles"
            latestDate={latestManagerCreation}
            Icon={UserCog}
            color="green"
          />
          {/* Music card remains removed for super_admin */}
        </>
      )}

      {/* Artist Manager View - Render cards directly */}
      {currentUserRole === "artist_manager" && (
        <>
          <DashboardCardItem
            title="Managed Artists"
            count={managedArtistCount}
            subtitle="Artists You Manage"
            latestDate={latestArtistCreation} // Show latest creation among all artists for context
            Icon={Mic}
            color="red"
          />
        </>
      )}

      {/* Artist View - Render cards directly */}
      {currentUserRole === "artist" && (
        <>
          <DashboardCardItem
            title="My Music"
            count={myMusicCount}
            subtitle="Your Uploaded Tracks"
            latestDate={latestMusicCreation} // Show latest creation among all music for context
            Icon={Music} // Use LibraryMusic icon
            color="purple"
          />
          {/* Add more relevant cards for artist if needed */}
        </>
      )}

      {/* Optional: Handle unknown roles */}
      {/* {!["super_admin", "artist_manager", "artist"].includes(currentUserRole) && (
        <div>No dashboard cards available for your role.</div>
      )} */}
    </div>
  );
}
