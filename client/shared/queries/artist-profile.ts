// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/artist-profile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArtistProfile,
  deleteArtistProfile,
  fetchArtistProfile,
  updateArtistProfile,
  fetchArtistProfileByUserId, // Import the new function
} from "@/shared/api/artist-profile";
import {
  ArtistProfile,
  UseCreateArtistProfileMutationOptions,
  UseDeleteArtistProfileMutationOptions,
  UseUpdateArtistProfileMutationOptions,
  ApiError,
} from "@/types/auth";
import { toast } from "sonner";
import { handleApiError } from "../api/api-utils";

// New query to fetch artist profile by user ID
export const useArtistProfileByUserIdQuery = (userId: string) => {
  return useQuery<ArtistProfile | null, Error>({
    queryKey: ["artist-profile-by-user", userId],
    queryFn: () => fetchArtistProfileByUserId(userId),
    enabled: !!userId,
    retry: false, // Disable retries
    onError: async (error: any) => {
      try {
        const errorData = await error.response.json();
        handleApiError(errorData);
      } catch (parseError) {
        toast.error("An unexpected error occurred.");
      }
    },
  });
};

export const useArtistProfileQuery = (id: string) => {
  return useQuery<ArtistProfile, Error>({
    queryKey: ["artist-profile", id],
    queryFn: () => fetchArtistProfile(id),
    enabled: !!id,
    retry: false,
    onError: async (error: any) => {
      try {
        const errorData = await error.response.json();
        handleApiError(errorData);
      } catch (parseError) {
        toast.error("An unexpected error occurred.");
      }
    },
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
      queryClient.invalidateQueries({ queryKey: ["artist-profile-by-user"] }); // Invalidate the new query as well
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: async (error: any) => {
      try {
        const errorData = await error.response.json();
        handleApiError(errorData);
      } catch (parseError) {
        toast.error("An unexpected error occurred.");
      }
    },
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
      queryClient.invalidateQueries({ queryKey: ["artist-profile-by-user"] }); // Invalidate the new query as well
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: async (error: any) => {
      try {
        const errorData = await error.response.json();
        handleApiError(errorData);
      } catch (parseError) {
        toast.error("An unexpected error occurred.");
      }
    },
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
      queryClient.invalidateQueries({ queryKey: ["artist-profile-by-user"] }); // Invalidate the new query as well
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: async (error: any) => {
      try {
        const errorData = await error.response.json();
        handleApiError(errorData);
      } catch (parseError) {
        toast.error("An unexpected error occurred.");
      }
    },
  });
};
export type { ArtistProfile };
