// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/dashboard-layout.tsx
"use client";
import { AppSidebarClient } from "@/components/ui/app-sidebar-client";
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

// Simple loading component
// function LoadingSpinner() {
//   return (
//     <div className="flex flex-1 justify-center items-center h-screen">
//       <Loader2 className="h-8 w-8 animate-spin text-primary" />
//     </div>
//   );
// }


export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true); // Add loading state

  useEffect(() => {
    const userRole = Cookies.get("role") || null;
    setRole(userRole);
    setIsLoadingRole(false); // Set loading to false after checking cookie

    // Redirect to login if no role is found after checking
    if (!userRole) {
        // Only redirect if not already on login/signup pages
        if (pathname !== '/login' && pathname !== '/signup') {
             router.push("/login");
        }
    }
  }, [router, pathname]); // Add pathname to dependencies

  // Show loading spinner while checking the role
  if (isLoadingRole) {
    return (
        <SidebarProvider>
            {/* Optionally show sidebar structure during load */}
            {/* <AppSidebarClient /> */}
            <SidebarInset>
                {/* <LoadingSpinner /> */}
            </SidebarInset>
        </SidebarProvider>
    );
  }

  // --- Permission Checks (run only after isLoadingRole is false) ---

  // Handle explicit permission denied page separately
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

  // Check dashboard permissions based on the determined role
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const allowedRoles = ["super_admin", "artist_manager", "artist"];
  const hasPermission = role && allowedRoles.includes(role);

  if (isDashboardRoute && !hasPermission) {
    // If role is loaded but not allowed for dashboard, show permission denied
    return (
      <SidebarProvider>
        <AppSidebarClient />
        <SidebarInset>
          <PermissionDenied />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // If role is loaded and permissions are okay, render the layout and children
  return (
    <SidebarProvider>
      <AppSidebarClient />
      <SidebarInset>
        <Toaster position="top-right" richColors />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
