// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/music-delete-confirmation-modal.tsx
"use client";

import { CustomModal } from "@/components/ui/custom-modal";
import { Music } from "@/types/auth"; // Import Music type if needed for description

interface MusicDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  musicToDelete: Music | null; // Pass the item for context if needed
}

export const MusicDeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  musicToDelete, // Receive the item
}: MusicDeleteConfirmationModalProps) => {
  const description = `This action cannot be undone. This will permanently delete the music track${
    musicToDelete ? ` "${musicToDelete.title}"` : ""
  }.`;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Are you absolutely sure?"
      description={description}
      isConfirmLoading={isLoading}
    />
  );
};
