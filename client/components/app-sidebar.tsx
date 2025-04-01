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
import { useEffect, useState, useMemo } from "react";
import { decodeAccessToken } from "@/lib/jwt-lib"; // Corrected import
import { useArtistProfileByUserIdQuery } from "@/shared/queries/artist-profile";
import { useMyManagerProfileQuery } from "@/shared/queries/manager-profile"; // Corrected import

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
    }[]
  >([]);

  const decodedToken = useMemo(() => decodeAccessToken(), []);
  const userId = decodedToken?.user_id;

  const { data: artistProfileData } = useArtistProfileByUserIdQuery(
    userId ? userId.toString() : ""
  );

  const { data: managerProfileData } = useMyManagerProfileQuery(); // Corrected query

  useEffect(() => {
    const userRole = Cookies.get("role") || null;
    const userNameFromCookie = Cookies.get("name") || null;
    const userAvatar = "/avatars/shadcn.jpg";
    let userEmail: string | null = null;
    let userName: string | null = userNameFromCookie;

    if (decodedToken) {
      userEmail = decodedToken.email;
    }

    if (userRole === "artist" && artistProfileData) {
      userName = artistProfileData.name;
    } else if (userRole === "artist_manager" && managerProfileData) {
      userName = managerProfileData.name;
    }

    setRole(userRole);
    setUser({ name: userName || "", email: userEmail || "", avatar: userAvatar });
    setTeams([
      {
        name: userName || "User",
        logo: GalleryVerticalEnd,
      },
    ]);
  }, [userId, artistProfileData, managerProfileData]);

  // Update the useEffect to fetch the profile based on the role
  useEffect(() => {
    if (role === "artist" && artistProfileData) {
      setUser((prevUser) => ({
        ...prevUser,
        name: artistProfileData.name,
      }));
      setTeams((prevTeams) =>
        prevTeams.map((team) => ({ ...team, name: artistProfileData.name }))
      );
    } else if (role === "artist_manager" && managerProfileData) {
      setUser((prevUser) => ({
        ...prevUser,
        name: managerProfileData.name,
      }));
      setTeams((prevTeams) =>
        prevTeams.map((team) => ({ ...team, name: managerProfileData.name }))
      );
    }
  }, [role, artistProfileData, managerProfileData]);

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
