// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/users/page.tsx
"use client";
import UserManagementTable from "@/app/dashboard/components/management-table";
import DashboardHeader from "@/app/dashboard/components/dashboard-headers";
import DashboardLayout from "@/app/dashboard/components/dashboard-layout";
import { useUsersQuery } from "@/shared/queries/users";

export default function UserListPage() {
  const { data: usersData } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";
  return (
    <DashboardLayout>
      <DashboardHeader />
      <UserManagementTable currentUserRole={currentUserRole} type="user" />
    </DashboardLayout>
  );
}
