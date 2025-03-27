// /home/mint/Desktop/ArtistMgntFront/client/components/app-sidebar.tsx
"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  LogOut,
  User,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const [teams, setTeams] = useState<
    {
      name: string;
      logo: React.ElementType;
      plan: string;
    }[]
  >([]);

  useEffect(() => {
    const userRole = Cookies.get("role") || null;
    const userName = Cookies.get("name") || null;
    const userEmail = Cookies.get("email") || null;
    const userAvatar = "/avatars/shadcn.jpg";
    setRole(userRole);
    setUser({ name: userName, email: userEmail, avatar: userAvatar });
    setTeams([
      {
        name: userName,
        logo: GalleryVerticalEnd,
        plan: userRole,
      },
    ]);
  }, []);

  const handleLogout = () => {
    Cookies.remove("access");
    Cookies.remove("refresh");
    Cookies.remove("role");
    Cookies.remove("name");
    Cookies.remove("email");
    router.push("/login");
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {teams && <TeamSwitcher teams={teams} />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/dashboard")}
              isActive={pathname === "/dashboard"}
            >
              <SquareTerminal />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          {role === "artist" && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push("/artist")}
                isActive={pathname === "/artist"}
              >
                <User />
                Artist Profile
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {role === "artist_manager" && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push("/manager")}
                isActive={pathname === "/manager"}
              >
                <Settings2 />
                Manager Profile
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {role === "super_admin" && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push("/dashboard")}
                isActive={pathname === "/dashboard"}
              >
                <Settings2 />
                User List
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        {user && <NavUser user={user} />}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
