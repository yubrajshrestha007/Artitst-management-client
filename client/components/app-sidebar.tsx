// /home/mint/Desktop/ArtistMgntFront/client/components/app-sidebar.tsx
"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  LogOut,
  User,
  Users,
  UserCog,
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
import { useEffect, useState, useMemo, useCallback } from "react";
import { decodeAccessToken } from "@/lib/jwt-lib";
import {
  useMyArtistProfileQuery,
  useMyManagerProfileQuery,
} from "@/shared/queries/profiles";
import { useAuth } from "@/hooks/auth";

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, name, email, isAuthenticated } = useAuth();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const [teams, setTeams] = useState<
    {
      name: string;
      logo: React.ElementType;
    }[]
  >([]);

  const { data: artistProfileData } = useMyArtistProfileQuery(isAuthenticated);
  const { data: managerProfileData } = useMyManagerProfileQuery(isAuthenticated);

  const updateUserData = useCallback((profileData: any) => {
    if (profileData && profileData.name) {
      setUser((prevUser) => ({
        ...prevUser,
        name: profileData.name,
      }));
      setTeams((prevTeams) =>
        prevTeams.map((team) => ({ ...team, name: profileData.name }))
      );
    }
  }, []);

  useEffect(() => {
    const userAvatar = "/avatars/shadcn.jpg";
    let userName: string | null = name;
    let userEmail: string | null = email;

    if (role === "artist") {
      updateUserData(artistProfileData);
    } else if (role === "artist_manager") {
      updateUserData(managerProfileData);
    }

    setUser((prevUser) => ({
      ...prevUser,
      name: userName || prevUser?.name || "",
      email: userEmail || prevUser?.email || "",
      avatar: userAvatar,
    }));
    setTeams((prevTeams) => [
      {
        name: userName || prevTeams[0]?.name || "User",
        logo: GalleryVerticalEnd,
      },
    ]);
  }, [artistProfileData, managerProfileData, updateUserData, name, email, role]);

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
      <SidebarHeader>{teams && <TeamSwitcher teams={teams} />}</SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => router.push("/dashboard")}>
              <SquareTerminal />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          {role === "artist" && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => router.push("/dashboard/artists")}>
                <User />
                Music List
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {role === "artist_manager" && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => router.push("/dashboard/managers")}>
                <UserCog />
                Artist List
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {role === "super_admin" && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push("/dashboard/users")}>
                  <Users />
                  User List
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push("/dashboard/artists")}>
                  <User />
                  Artist Profiles
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push("/dashboard/managers")}>
                  <UserCog />
                  Manager Profiles
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        {user && <NavUser user={user} />}
        {/* Display User Role */}
        {user && role && (
          <div className="px-4 pb-2 text-xs text-muted-foreground">

            Role: {role.replace(/_/g, " ")}
          </div>
        )}
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
