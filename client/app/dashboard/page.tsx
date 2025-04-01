// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/page.tsx
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import DashboardLayout from "@/app/dashboard/components/dashboard-layout";
import DashboardHeader from "@/app/dashboard/components/dashboard-headers";
import DashboardCards from "@/app/dashboard/components/dashboard-card";
import { useUsersQuery } from "@/shared/queries/users";
import UserManagementTable from "./components/management-table";

export default function Page() {
  const { data: usersData } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";

  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardCards />
        {/* Main Content Area */}
        <div className="bg-gray-100 border border-gray-300 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-4">
          <UserManagementTable currentUserRole={currentUserRole} />
        </div>
      </div>
    </DashboardLayout>
  );
}
