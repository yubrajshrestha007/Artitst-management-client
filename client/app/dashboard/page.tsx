// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/page.tsx
"use client";
import DashboardCards from "./components/dashboard-card";
import DashboardHeader from "./components/dashboard-headers";
import DashboardLayout from "./components/dashboard-layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardCards />
    </DashboardLayout>
  );
}
