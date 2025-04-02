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
import { useMyArtistProfileQuery } from "@/shared/queries/profiles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";

export default function ArtistProfilePage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth(); // Use the new hook
  const { data: profile, isLoading: myProfileLoading } =
    useMyArtistProfileQuery(isAuthenticated); // Call the hook unconditionally
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

  // Role-based access control: Check if the user is an artist first
  if (!isAuthenticated) {
    return <div>Please log in.</div>;
  }
  if (role !== "artist") {
    return <div>You are not an artist</div>;
  }

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

  if (!profile) {
    toast.warning("Artist profile not found. Please create one.");
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
          initialData={profile}
        />
      </div>
    </DashboardLayout>
  );
}
