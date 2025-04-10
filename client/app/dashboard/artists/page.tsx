
import DashboardHeader from "@/app/dashboard/components/dashboard-headers";
import DashboardLayout from "@/app/dashboard/components/dashboard-layout";
import ArtistManagementClient from "../components/artist-management";

export default function ArtistProfileManagementPage() {

  return (
    <DashboardLayout>
      <DashboardHeader />
      <ArtistManagementClient />
    </DashboardLayout>
  );
}
