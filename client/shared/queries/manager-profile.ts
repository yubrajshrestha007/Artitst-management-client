// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/manager-profile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ManagerProfile,
  UseCreateManagerProfileMutationOptions,
  UseDeleteManagerProfileMutationOptions,
  UseUpdateManagerProfileMutationOptions,
} from "@/types/auth";
import { toast } from "sonner";
import {
  fetchManagerProfile as fetchManagerProfileApi,
  createManagerProfile as createManagerProfileApi,
  updateManagerProfile as updateManagerProfileApi,
  deleteManagerProfile as deleteManagerProfileApi,
  fetchAllManagerProfiles,
} from "../api/manager-profile";
import { useInvalidateProfile } from "./profiles";
import { getRoleFromToken } from "../api/api-utils";

export const fetchManagers = async (): Promise<{
  managers: ManagerProfile[];
}> => {
  const response = await fetchAllManagerProfiles();
  return response;
};

export const useManagerProfileQuery = (id: string) => {
  return useQuery<ManagerProfile | null, Error>({
    queryKey: ["managerProfile", id],
    queryFn: () => fetchManagerProfileApi(id),
    enabled: !!id,
    retry: false,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch manager profile");
    },
  });
};

export const useCreateManagerProfileMutation = ({
  onSuccess,
  onError,
}: UseCreateManagerProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { mutate: invalidateProfile } = useInvalidateProfile();
  return useMutation({
    mutationFn: createManagerProfileApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["myManagerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      invalidateProfile();
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: any) => {
      const role = getRoleFromToken();
      if (role !== "artist_manager") {
        toast.error("Only manager can create manager profile");
        throw new Error("Only manager can create manager profile");
      }
      toast.error(error.message || "Failed to create manager profile");
    },
  });
};

export const useUpdateManagerProfileMutation = ({
  onSuccess,
  onError,
}: UseUpdateManagerProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { mutate: invalidateProfile } = useInvalidateProfile();
  return useMutation({
    mutationFn: updateManagerProfileApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["myManagerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      invalidateProfile();
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: any) => {
      const role = getRoleFromToken();
      if (role !== "artist_manager") {
        toast.error("Only manager can update manager profile");
        throw new Error("Only manager can update manager profile");
      }
      toast.error(error.message || "Failed to update manager profile");
    },
  });
};

export const useDeleteManagerProfileMutation = ({
  onSuccess,
  onError,
}: UseDeleteManagerProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { mutate: invalidateProfile } = useInvalidateProfile();
  return useMutation({
    mutationFn: deleteManagerProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myManagerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      invalidateProfile();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      const role = getRoleFromToken();
      if (role !== "artist_manager") {
        toast.error("Only manager can delete manager profile");
        throw new Error("Only manager can delete manager profile");
      }
      toast.error(error.message || "Failed to delete manager profile");
    },
  });
};

export const useManagersQuery = () => {
  return useQuery<{ managers: ManagerProfile[] }, Error>({
    queryKey: ["managers"],
    queryFn: fetchAllManagerProfiles,
    retry: false,
    onError: (error) => {
      console.log("Error fetching managers:", error);
      toast.error(error.message || "Failed to fetch managers");
    },
  });
};
export type { ManagerProfile };
