// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/music-list.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useCreateMusicMutation,
  useDeleteMusicMutation,
  useMusicListQuery,
  useUpdateMusicMutation,
} from "@/shared/queries/music";
import { useMyArtistProfileQuery } from "@/shared/queries/profiles";
import { Music } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MusicTable } from "./music-table";
import { MusicCreateUpdateModal } from "./music-create-update"; // Corrected import path
import { MusicDeleteConfirmationModal } from "./music-delete"; // Corrected import path
import { ItemDetailModal } from "./item-detail-modal"; // Import the detail modal

// --- Define ApiError interface and type guard here or import ---
interface ApiError {
  response?: {
    data?: {
      detail?: string;
      message?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  message?: string;
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null;
}
// --- End ApiError definition ---


// Helper function to extract error message
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (isApiError(error)) {
        const detail = error.response?.data?.detail;
        const message = error.response?.data?.message;
        if (detail) return detail;
        if (message) return message;
        if (error.message) return error.message;
    } else if (typeof error === 'string') {
        return error;
    }
    return defaultMessage;
};

// Helper function to get details for logging
const getErrorDetailsForLog = (error: unknown): unknown => {
    if (isApiError(error) && error.response?.data) {
        return error.response.data;
    }
    return error;
}

const MusicList = () => {
  // --- Queries ---
  const { data: musicList, isLoading: isMusicListLoading, refetch: refetchMusic } = useMusicListQuery();
  const { data: profile, isLoading: isProfileLoading } = useMyArtistProfileQuery(true);

  // --- Mutations ---
  const { mutate: createMusic, isPending: isCreating } = useCreateMusicMutation({
    onSuccess: () => {
      toast.success("Music created successfully!");
      setIsModalOpen(false);
      resetFormData();
      refetchMusic();
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Failed to create music');
      toast.error(`Error: ${message}`);
      console.error("Create Music Error:", getErrorDetailsForLog(error));
    },
  });

  const { mutate: updateMusic, isPending: isUpdatingMutation } = useUpdateMusicMutation({
    onSuccess: () => {
      toast.success("Music updated successfully!");
      setIsModalOpen(false);
      resetFormData();
      refetchMusic();
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Failed to update music');
      toast.error(`Error: ${message}`);
      console.error("Update Music Error:", getErrorDetailsForLog(error));
    },
  });

  const { mutate: deleteMusic, isPending: isDeleting } = useDeleteMusicMutation({
    onSuccess: () => {
      toast.success("Music deleted successfully!");
      refetchMusic();
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Failed to delete music');
      toast.error(`Error: ${message}`);
      console.error("Delete Music Error:", getErrorDetailsForLog(error));
    },
  });

  // --- State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState<Music | null>(null);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Music>>({
    title: "", album_name: "", genre: "", release_date: null, created_by_id: "", artist_name: "",
  });
  // --- State for Detail Modal ---
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [itemForDetail, setItemForDetail] = useState<Music | null>(null);


  // --- Helper Functions ---
  const resetFormData = useCallback(() => {
    setFormData({
      title: "", album_name: "", genre: "", release_date: null,
      created_by_id: profile?.id || "", artist_name: profile?.name || "",
    });
  }, [profile]);

  // --- Effects ---
  useEffect(() => {
    if (profile && !isUpdatingMode) {
      resetFormData();
    }
  }, [profile, isUpdatingMode, resetFormData]);

  // --- Event Handlers ---
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdatingMode) handleUpdateMusic(); else handleCreateMusic();
  };

  const handleCreateMusic = () => {
    if (profile?.id && profile?.name) {
      const { title, album_name, genre, release_date } = formData;
      if (!title || !album_name || !genre) {
        toast.error("Please fill in Title, Album Name, and select a Genre."); return;
      }
      const dataToCreate: Music = {
        title, album_name, genre,
        release_date: release_date ? new Date(release_date).toISOString() : null,
        created_by_id: profile.id, artist_name: profile.name, created: new Date(),
      };
      createMusic(dataToCreate);
    } else {
      toast.error("Artist profile not loaded. Cannot create music.");
    }
  };

  const handleUpdateMusic = () => {
    if (selectedMusic?.id) {
      const { title, album_name, genre, release_date } = formData;
      if (!title || !album_name || !genre) {
        toast.error("Please fill in Title, Album Name, and select a Genre."); return;
      }
      const dataToUpdate: Partial<Music> = {
        title, album_name, genre,
        release_date: release_date ? new Date(release_date).toISOString() : null,
      };
      updateMusic({ id: selectedMusic.id, data: dataToUpdate });
    } else {
      toast.error("Cannot update music. Missing music ID.");
    }
  };

  const handleDeleteRequest = (music: Music) => {
    setMusicToDelete(music); setIsDeleteDialogOpen(true);
  };

  const confirmDeleteMusic = () => {
    if (musicToDelete?.id) {
      deleteMusic(musicToDelete.id);
      setIsDeleteDialogOpen(false); setMusicToDelete(null);
    }
  };

  const cancelDeleteMusic = () => {
    setIsDeleteDialogOpen(false); setMusicToDelete(null);
  };

  const handleOpenModalForEdit = (music: Music) => {
    setSelectedMusic(music); setIsUpdatingMode(true);
    setFormData({
      title: music.title || "", album_name: music.album_name || "", genre: music.genre || "",
      release_date: music.release_date || null, created_by_id: music.created_by_id, artist_name: music.artist_name,
    });
    setIsModalOpen(true);
  };

  const handleOpenModalForCreate = () => {
    setSelectedMusic(null); setIsUpdatingMode(false);
    resetFormData(); setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); setSelectedMusic(null);
    setIsUpdatingMode(false); resetFormData();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Detail Modal Handlers ---
  const handleViewDetails = (item: Music) => {
    setItemForDetail(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setItemForDetail(null);
  };

  // --- Derived State ---
  const isLoading = isMusicListLoading || isProfileLoading;
  const myMusicList = musicList?.filter(music => music.created_by_id === profile?.id) || [];

  // --- Render ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading music data...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Music</h2>
        <Button onClick={handleOpenModalForCreate} disabled={!profile?.id || isCreating || isUpdatingMutation}>
          Create Music
        </Button>
      </div>

      {/* Render the Music Table */}
      <MusicTable
        musicList={myMusicList}
        onEdit={handleOpenModalForEdit}
        onDelete={handleDeleteRequest}
        onView={handleViewDetails} // <<< PASS THE HANDLER HERE
        isLoadingEdit={isUpdatingMutation}
        isLoadingDelete={isDeleting}
      />

      {/* Render the Create/Update Modal */}
      <MusicCreateUpdateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdatingMutation}
        isUpdating={isUpdatingMode}
      />

      {/* Render the Delete Confirmation Modal */}
      <MusicDeleteConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={cancelDeleteMusic}
        onConfirm={confirmDeleteMusic}
        isLoading={isDeleting}
        musicToDelete={musicToDelete}
      />

      {/* Detail View Modal */}
      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        item={itemForDetail}
        itemType={"music"} // Hardcode type for music list
      />
    </div>
  );
};

export default MusicList;
