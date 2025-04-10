// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/artists/page.tsx
// NO "use client" directive here - this is now a Server Component

import DashboardHeader from "@/app/dashboard/components/dashboard-headers"; // Keep as client component if needed internally
import DashboardLayout from "@/app/dashboard/components/dashboard-layout"; // Keep as client component if needed internally
import ArtistManagementClient from "./artist-management"; // Import the new client component

// This page component is now very simple
export default function ArtistProfileManagementPage() {
  // No hooks or client-side logic here

  return (
    // DashboardLayout and DashboardHeader likely need to remain Client Components
    // or be structured to work within a Server Component parent if possible.
    // Assuming they handle their own client-side needs or wrap client components.
    <DashboardLayout>
      <DashboardHeader />
      {/* Render the Client Component which handles the data fetching and table rendering */}
      <ArtistManagementClient />
    </DashboardLayout>
  );
}
