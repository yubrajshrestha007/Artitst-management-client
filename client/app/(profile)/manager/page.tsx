// /home/mint/Desktop/ArtistMgntFront/client/app/(profile)/manager/page.tsx
"use client";
import DashboardLayout from "@/app/dashboard/components/dashboard-layout";
import DashboardHeader from "@/app/dashboard/components/dashboard-headers";
import ManagerProfileForm from "@/app/dashboard/components/manager-profile";
import {
  ManagerProfile,
  useCreateManagerProfileMutation,
  useManagerProfileQuery,
  useUpdateManagerProfileMutation,
} from "@/shared/queries/manager-profile";
import { useMyManagerProfileQuery } from "@/shared/queries/profiles"; // Corrected import
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ManagerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.profile as string;
  const { data: myManagerProfile, isLoading: myProfileLoading, isFetched } =
    useMyManagerProfileQuery(true); // Corrected query
    const [hasProfileBeenChecked, setHasProfileBeenChecked] = useState(false);
  const { isLoading } = useManagerProfileQuery(id); // Pass the id
  const { mutate: createManagerProfile } =
    useCreateManagerProfileMutation({
      onSuccess: () => {
        toast.success("Manager profile created successfully!");
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error(`Error creating manager profile: ${error.message}`);
      },
    });
  const { mutate: updateManagerProfile } =
    useUpdateManagerProfileMutation({
      onSuccess: () => {
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error(`Error updating manager profile: ${error.message}`);
      },
    });

    useEffect(() => {
      if (!myProfileLoading && isFetched) {
        if (!myManagerProfile && !hasProfileBeenChecked) {
          toast.warning("Manager profile not found. Please create one.");
          setHasProfileBeenChecked(true);
        } else if (myManagerProfile && !hasProfileBeenChecked) {
          setHasProfileBeenChecked(true);
        }
      }
    }, [myProfileLoading, myManagerProfile, hasProfileBeenChecked, isFetched]);

  const handleCreateProfile = (data: ManagerProfile) => {
    if (myManagerProfile) {
      updateManagerProfile({ id: myManagerProfile.id, data });
    } else {
      createManagerProfile(data);
    }
  };

  if (isLoading || myProfileLoading) {
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

  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">
          {myManagerProfile ? "Edit" : "Create"} Manager Profile
        </h1>
        <ManagerProfileForm
          onSubmit={handleCreateProfile}
          initialData={myManagerProfile}
        />
      </div>
    </DashboardLayout>
  );
}
