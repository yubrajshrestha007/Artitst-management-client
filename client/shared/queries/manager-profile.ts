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
import { useInvalidateProfile } from "./profiles";
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

const fetchMyManagerProfile = async (): Promise<ManagerProfile | null> => {
  const access = Cookies.get("access");
  if (!access) {
    throw new Error("Access token not found");
  }
  const decodedToken: DecodedToken = jwtDecode(access);
  const userId = decodedToken.user_id;
  const response = await fetch(`${BASE_URL}manager-by-user/${userId}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    return handleApiError(response);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
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
  });
};

export const useMyManagerProfileQuery = () => {
  return useQuery<ManagerProfile | null, Error>({
    queryKey: ["myManagerProfile"],
    queryFn: fetchMyManagerProfile,
    retry: 1, // Retry only once
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
    onError,
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
    onError,
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
    onError,
  });
};

export const useManagersQuery = () => {
  return useQuery<{ managers: ManagerProfile[] }, Error>({
    queryKey: ["managers"],
    queryFn: fetchManagers,
  });
};
export type { ManagerProfile };
