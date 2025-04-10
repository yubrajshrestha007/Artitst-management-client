// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/managers/page.tsx
import DashboardHeader from "@/app/dashboard/components/dashboard-headers";
import DashboardLayout from "@/app/dashboard/components/dashboard-layout";
import MusicList from "@/app/dashboard/components/music-list"; // Import the MusicList component

export default function MusicListPage() { // Renamed component for clarity

  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <MusicList />
      </div>
    </DashboardLayout>
  );
}
