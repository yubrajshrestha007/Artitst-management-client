// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/manager-profile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ManagerProfile,
  UseCreateManagerProfileMutationOptions,
  UseDeleteManagerProfileMutationOptions,
  UseUpdateManagerProfileMutationOptions,
} from "@/types/auth";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  fetchManagerProfile as fetchManagerProfileApi,
  createManagerProfile as createManagerProfileApi,
  updateManagerProfile as updateManagerProfileApi,
  deleteManagerProfile as deleteManagerProfileApi,
  fetchAllManagerProfiles,
} from "../api/manager-profile";
import { useInvalidateProfile, useMyManagerProfileQuery } from "./profiles"; // Changed import
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in .env.local");
}

// Helper function to handle API errors and non-200 responses
const handleApiError = async (response: Response) => {
  if (response.status === 404) {
    return null; // Treat 404 as no profile found, not an error
  }
  const errorData = await response.json();
  const errorMessage =
    errorData.detail || errorData.message || "An error occurred";
  toast.error(errorMessage); // Show error toast
  throw new Error(errorMessage);
};

const getHeaders = () => {
  const accessToken = Cookies.get("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const fetchManagers = async (): Promise<{
  managers: ManagerProfile[];
}> => {
  try {
    const response = await fetchAllManagerProfiles();
    return response;
  } catch (error) {
    await handleApiError(error as Response);
    return { managers: [] }; // Return an empty array for managers in case of an error
  }
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
  const { data: profile } = useMyManagerProfileQuery(true);
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
      if (!profile) {
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
  const { data: profile } = useMyManagerProfileQuery(true);
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
      if (!profile) {
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
  const { data: profile } = useMyManagerProfileQuery(true);
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
      if (!profile) {
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
    queryFn: fetchManagers,
    retry: false,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch managers");
    },
  });
};
export type { ManagerProfile };
