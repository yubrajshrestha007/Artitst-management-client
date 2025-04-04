// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/music.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createMusic,
  deleteMusic,
  fetchMusic,
  fetchMusicList,
  updateMusic,
} from "@/shared/api/music";
import { Music, ArtistProfile } from "@/types/auth";
import { useMyArtistProfileQuery, useMyManagerProfileQuery } from "./profiles";
import { toast } from "sonner";
import { useArtistProfileByUserIdQuery } from "./artist-profile";

// Fetch all music
export const useMusicListQuery = () => {
  return useQuery<Music[], Error>({
    queryKey: ["music-list"],
    queryFn: fetchMusicList,
  });
};

// Fetch a single music by ID
export const useMusicQuery = (id: string) => {
  return useQuery<Music, Error>({
    queryKey: ["music", id],
    queryFn: () => fetchMusic(id),
    enabled: !!id,
  });
};

// Create music
export const useCreateMusicMutation = () => {
  const queryClient = useQueryClient();
  const {
    data: profile,
    isSuccess: isProfileSuccess,
    isFetching: isProfileFetching,
  } = useMyArtistProfileQuery(true);
  const {
    data: artistProfile,
    isSuccess: isArtistProfileSuccess,
    isFetching: isArtistProfileFetching,
  } = useArtistProfileByUserIdQuery(profile?.user_id || "");

  return useMutation({
    mutationFn: async (data: Music) => {
      if (!isProfileSuccess || isProfileFetching) {
        toast.error("Only artist can create music");
        throw new Error("Only artist can create music");
      }
      if (!isArtistProfileSuccess || isArtistProfileFetching || !artistProfile) {
        toast.error("Artist profile not found");
        throw new Error("Artist profile not found");
      }
      const artistId = artistProfile.id;
      return createMusic({
        ...data,
        artist_id: artistId,
        created_by_id: artistId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-list"] });
      toast.success("Music created successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create music";
      toast.error(errorMessage);
    },
  });
};

// Update music
export const useUpdateMusicMutation = () => {
  const queryClient = useQueryClient();
  const { data: profile, isSuccess: isProfileSuccess, isFetching: isProfileFetching } = useMyArtistProfileQuery(true);
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Music, 'created_by_id'> }) => {
      if (!isProfileSuccess || isProfileFetching) {
        toast.error("Only artist can update music");
        throw new Error("Only artist can update music");
      }
      return updateMusic({ id, data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-list"] });
      toast.success("Music updated successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update music";
      toast.error(errorMessage);
    },
  });
};
;

// Delete music
export const useDeleteMusicMutation = () => {
  const queryClient = useQueryClient();
  const { data: profile, isSuccess: isProfileSuccess, isFetching: isProfileFetching } = useMyArtistProfileQuery(true);
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isProfileSuccess || isProfileFetching) {
        toast.error("Only artist can delete music");
        throw new Error("Only artist can delete music");
      }
      return deleteMusic(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-list"] });
      toast.success("Music deleted successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete music";
      toast.error(errorMessage);
    },
  });
};
