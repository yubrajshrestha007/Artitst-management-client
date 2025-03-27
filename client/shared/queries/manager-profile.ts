// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/manager-profile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createManagerProfile,
  deleteManagerProfile,
  fetchManagerProfile,
  updateManagerProfile,
} from "@/shared/api/manager-profile";
import {
  ManagerProfile,
  UseCreateManagerProfileMutationOptions,
  UseDeleteManagerProfileMutationOptions,
  UseUpdateManagerProfileMutationOptions,
} from "@/types/auth";
import { useInvalidateProfile } from "./profiles";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/types/auth";

export const useMyManagerProfileQuery = () => {
  const { mutate: invalidateProfile } = useInvalidateProfile();
  return useQuery<ManagerProfile | null, Error>({
    queryKey: ["my-manager-profile"],
    queryFn: async () => {
      try {
        const profile = await fetchMyManagerProfile();
        return profile;
      } catch {
          console.error("Error fetching my manager profile");
          throw new Error("Error fetching my manager profile");
      }
    },
    staleTime: Infinity,
    onSuccess: () => {
      invalidateProfile();
    },
  });
};

const fetchMyManagerProfile = async (): Promise<ManagerProfile | null> => {
  const access = Cookies.get("access");
  if (!access) {
    throw new Error("Access token not found");
  }
  const decodedToken: DecodedToken = jwtDecode(access);
  const userId = decodedToken.user_id;
  if (!userId) {
    throw new Error("User ID not found in access token");
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}manager-by-user/${userId}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404 || response.status === 204) {
      return null;
    }
    try {
      const errorData = await response.json();
      throw new Error(
        errorData.message || errorData.detail || "API request failed"
      );
    } catch (error) {
      throw new Error("API request failed");
    }
  }

  return response.json();
};

export const useManagerProfileQuery = (id: string) => {
  return useQuery<ManagerProfile, Error>({
    queryKey: ["manager-profile", id],
    queryFn: () => fetchManagerProfile(id),
    enabled: !!id,
  });
};

export const useCreateManagerProfileMutation = ({
  onSuccess,
  onError,
}: UseCreateManagerProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { mutate: invalidateProfile } = useInvalidateProfile();
  return useMutation({
    mutationFn: createManagerProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["manager-profile"] });
      queryClient.invalidateQueries({ queryKey: ["my-manager-profile"] });
      invalidateProfile();
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: any) => {
      console.error("Error creating manager profile:", error);
      if (onError) {
        onError(error);
      }
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
    mutationFn: updateManagerProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["manager-profile"] });
      queryClient.invalidateQueries({ queryKey: ["my-manager-profile"] });
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
    mutationFn: deleteManagerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-profile"] });
      queryClient.invalidateQueries({ queryKey: ["my-manager-profile"] });
      invalidateProfile();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError,
  });
};
export type { ManagerProfile };
