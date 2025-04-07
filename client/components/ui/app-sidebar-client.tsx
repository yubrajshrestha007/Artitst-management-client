// app-sidebar-client.tsx
"use client";

import { useAuth } from "@/hooks/auth";
import { AppSidebar } from "../app-sidebar";

export function AppSidebarClient(props: React.ComponentProps<typeof AppSidebar>) {
  const { role, name, email, isAuthenticated } = useAuth();

  return (
    <AppSidebar
      {...props}
      role={role}
      name={name}
      email={email}
      isAuthenticated={isAuthenticated}
    />
  );
}
