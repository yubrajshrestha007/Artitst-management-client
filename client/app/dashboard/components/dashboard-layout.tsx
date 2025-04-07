// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/dashboard-layout.tsx
"use client";
import { AppSidebarClient } from "@/components/ui/app-sidebar-client"; // Import the client wrapper
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ReactNode, useEffect, useState } from "react";
import PermissionDenied from "./permission";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Toaster } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = Cookies.get("role") || null;
    setRole(userRole);
    if (userRole === undefined) {
      router.push("/login");
    }
  }, [router]);

  if (pathname === "/permission-denied") {
    return (
      <SidebarProvider>
        <AppSidebarClient />
        <SidebarInset>
          <PermissionDenied />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (
    pathname.startsWith("/dashboard") &&
    role !== "super_admin" &&
    role !== "artist_manager" &&
    role !== "artist"
  ) {
    return (
      <SidebarProvider>
        <AppSidebarClient />
        <SidebarInset>
          <PermissionDenied />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebarClient />
      <SidebarInset>
        <Toaster position="top-right" richColors /> {/* Moved Toaster here */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
