// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/artist-profile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArtistProfile,
  deleteArtistProfile,
  fetchArtistProfile,
  updateArtistProfile,
  fetchArtistProfileByUserId,
} from "@/shared/api/artist-profile";
import {
  ArtistProfile,
  UseCreateArtistProfileMutationOptions,
  UseDeleteArtistProfileMutationOptions,
  UseUpdateArtistProfileMutationOptions,
} from "@/types/auth";
import { toast } from "sonner";
import { handleApiError } from "../api/api-utils";
import { apiRequest } from "../api/api-utils";

// Helper function for consistent error handling
const handleQueryError = async (error: any) => {
  try {
    await handleApiError(error);
  } catch (parseError) {
    toast.error("An unexpected error occurred.");
  }
};

// New query to fetch artist profile by user ID
export const useArtistProfileByUserIdQuery = (userId: string) => {
  return useQuery<ArtistProfile | null, Error>({
    queryKey: ["artist-profile-by-user", userId],
    queryFn: () => fetchArtistProfileByUserId(userId),
    enabled: !!userId,
    retry: false,
    onError: handleQueryError,
  });
};

export const useArtistProfileQuery = (id: string) => {
  return useQuery<ArtistProfile, Error>({
    queryKey: ["artist-profile", id],
    queryFn: () => fetchArtistProfile(id),
    enabled: !!id,
    retry: false,
    onError: handleQueryError,
  });
};

export const useCreateArtistProfileMutation = ({
  onSuccess,
  onError,
}: UseCreateArtistProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createArtistProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artist-profile"] });
      queryClient.invalidateQueries({ queryKey: ["artist-profile-by-user"] });
      queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: handleQueryError,
  });
};

export const useUpdateArtistProfileMutation = ({
  onSuccess,
  onError,
}: UseUpdateArtistProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateArtistProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artist-profile"] });
      queryClient.invalidateQueries({ queryKey: ["artist-profile-by-user"] });
      queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: handleQueryError,
  });
};

export const useDeleteArtistProfileMutation = ({
  onSuccess,
  onError,
}: UseDeleteArtistProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteArtistProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist-profile"] });
      queryClient.invalidateQueries({ queryKey: ["artist-profile-by-user"] });
      queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: handleQueryError,
  });
};

export const useArtistProfileListQuery = () =>
  useQuery({
    queryKey: ["artist-profiles"],
    queryFn: async () => {
      const res = await apiRequest<ArtistProfile[]>("artists/list/", "GET"); // Update the URL to your artist-profiles endpoint
      return res;
    },
    onError: handleQueryError,
  });

export type { ArtistProfile };
