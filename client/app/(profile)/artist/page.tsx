// /home/mint/Desktop/ArtistMgntFront/client/app/(profile)/artist/page.tsx
"use client";
import DashboardLayout from "@/app/dashboard/components/dashboard-layout";
import DashboardHeader from "@/app/dashboard/components/dashboard-headers";
import ArtistProfileForm from "@/app/dashboard/components/artist-profile";
import {
  ArtistProfile,
  useCreateArtistProfileMutation,
  useUpdateArtistProfileMutation,
} from "@/shared/queries/artist-profile";
import { useMyProfileQuery } from "@/shared/queries/profiles"; // Import the new hook
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // Import useState
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/types/auth";
import { useAuth } from "@/hooks/auth"; // Import the new hook
import { useQueryClient } from "@tanstack/react-query";

export default function ArtistProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth(queryClient); // Use the new hook and pass queryClient
  const { data: profile, isLoading: myProfileLoading, isFetched } = useMyProfileQuery(isAuthenticated); // Use the new hook and pass isAuthenticated
  const [hasProfileBeenChecked, setHasProfileBeenChecked] = useState(false); // New state

  const { mutate: createArtistProfile } = useCreateArtistProfileMutation({
    onSuccess: () => {
      toast.success("Artist profile created successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(`Error creating artist profile: ${error.message}`);
    },
  });
  const { mutate: updateArtistProfile } = useUpdateArtistProfileMutation({
    onSuccess: () => {
      toast.success("Artist profile updated successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(`Error updating artist profile: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!myProfileLoading && isFetched) {
      if (!profile && !hasProfileBeenChecked) {
        toast.warning("Artist profile not found. Please create one.");
        setHasProfileBeenChecked(true);
      } else if (profile && !hasProfileBeenChecked) {
        setHasProfileBeenChecked(true);
      }
    }
  }, [myProfileLoading, profile, hasProfileBeenChecked, isFetched]);

  const handleCreateProfile = (data: ArtistProfile) => {
    if (profile) {
      updateArtistProfile({ id: profile.id, data });
    } else {
      createArtistProfile(data);
    }
  };

  if (myProfileLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <>
            <h1 className="text-2xl font-bold">Loading...</h1>
          </>
        </div>
      </DashboardLayout>
    );
  }
  const access = Cookies.get("access");
  if (!access) {
    return <div>Access token not found</div>;
  }
  const decodedToken: DecodedToken = jwtDecode(access);
  const role = decodedToken.role;
  if (role !== "artist") {
    return <div>You are not an artist</div>;
  }

  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">
          {profile ? "Edit" : "Create"} Artist Profile
        </h1>
        <ArtistProfileForm
          onSubmit={handleCreateProfile}
          initialData={profile as ArtistProfile}
        />
      </div>
    </DashboardLayout>
  );
}
