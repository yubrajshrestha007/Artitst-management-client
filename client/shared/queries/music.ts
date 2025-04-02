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
import { Music } from "@/types/auth";
import { useMyArtistProfileQuery } from "./profiles"; // Changed import
import { toast } from "sonner";

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
  const { data: profile } = useMyArtistProfileQuery(true); // Changed query
  return useMutation({
    mutationFn: async (data: Music) => {
      if (!profile) {
        toast.error("Only artist can create music");
        throw new Error("Only artist can create music");
      }
      const artistId = profile?.id;
      const createdBy = profile?.user_id;
      return createMusic({ ...data, artist_id: artistId, created_by_id: createdBy });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-list"] });
      toast.success("Music created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create music");
    },
  });
};

// Update music
export const useUpdateMusicMutation = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useMyArtistProfileQuery(true); // Changed query
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Music }) => {
      if (!profile) {
        toast.error("Only artist can update music");
        throw new Error("Only artist can update music");
      }
      return updateMusic({ id, data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-list"] });
      toast.success("Music updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update music");
    },
  });
};

// Delete music
export const useDeleteMusicMutation = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useMyArtistProfileQuery(true); // Changed query
  return useMutation({
    mutationFn: async (id: string) => {
      if (!profile) {
        toast.error("Only artist can delete music");
        throw new Error("Only artist can delete music");
      }
      return deleteMusic(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-list"] });
      toast.success("Music deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete music");
    },
  });
};
