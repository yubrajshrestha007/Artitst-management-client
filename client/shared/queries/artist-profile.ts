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
} from "@/types/auth";
import { toast } from "sonner";

// New query to fetch artist profile by user ID
export const useArtistProfileByUserIdQuery = (userId: string) => {
  return useQuery<ArtistProfile | null, Error>({
    queryKey: ["artist-profile-by-user", userId],
    queryFn: () => fetchArtistProfileByUserId(userId),
    enabled: !!userId,
    retry: false, // Disable retries
    onError: (error) => {
      toast.error(error.message || "Failed to fetch artist profile by user ID");
    },
  });
};

export const useArtistProfileQuery = (id: string) => {
  return useQuery<ArtistProfile, Error>({
    queryKey: ["artist-profile", id],
    queryFn: () => fetchArtistProfile(id),
    enabled: !!id,
    retry: false,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch artist profile");
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
    onError,
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
    onError,
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
    onError,
  });
};
export type { ArtistProfile };
