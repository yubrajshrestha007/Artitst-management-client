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
import { useInvalidateProfile } from "./profiles";

// New query to fetch artist profile by user ID
export const useArtistProfileByUserIdQuery = (userId: string) => {
  return useQuery<ArtistProfile | null, Error>({
    queryKey: ["artist-profile-by-user", userId],
    queryFn: () => fetchArtistProfileByUserId(userId),
    enabled: !!userId,
  });
};

export const useArtistProfileQuery = (id: string) => {
  return useQuery<ArtistProfile, Error>({
    queryKey: ["artist-profile", id],
    queryFn: () => fetchArtistProfile(id),
    enabled: !!id,
  });
};

export const useCreateArtistProfileMutation = ({
  onSuccess,
  onError,
}: UseCreateArtistProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { mutate: invalidateProfile } = useInvalidateProfile();
  return useMutation({
    mutationFn: createArtistProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artist-profile"] });
      queryClient.invalidateQueries({ queryKey: ["artist-profile-by-user"] }); // Invalidate the new query as well
      invalidateProfile();
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
  const { mutate: invalidateProfile } = useInvalidateProfile();
  return useMutation({
    mutationFn: updateArtistProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artist-profile"] });
      queryClient.invalidateQueries({ queryKey: ["artist-profile-by-user"] }); // Invalidate the new query as well
      invalidateProfile();
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
  const { mutate: invalidateProfile } = useInvalidateProfile();
  return useMutation({
    mutationFn: deleteArtistProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist-profile"] });
      queryClient.invalidateQueries({ queryKey: ["artist-profile-by-user"] }); // Invalidate the new query as well
      invalidateProfile();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError,
  });
};
export type { ArtistProfile };
