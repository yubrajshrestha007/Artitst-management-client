// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/managers/page.tsx
"use client"
import DashboardHeader from "@/app/dashboard/components/dashboard-headers";
import DashboardLayout from "@/app/dashboard/components/dashboard-layout";
import UserManagementTable from "@/app/dashboard/components/management-table";
import { useUsersQuery } from "@/shared/queries/users";

export default function ManagerProfileManagementPage() {
  const { data: usersData } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";
  return (
    <DashboardLayout>
      <DashboardHeader />
      <UserManagementTable currentUserRole={currentUserRole} type="artist_manager" />
    </DashboardLayout>
  );
}
