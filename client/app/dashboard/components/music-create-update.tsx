// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/music-create-update-modal.tsx
"use client";

import { CustomModal } from "@/components/ui/custom-modal";
import { MusicForm } from "./music-form"; // Import the refined MusicForm
import { Music } from "@/types/auth";

interface MusicCreateUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<Music>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isUpdating: boolean;
}

export const MusicCreateUpdateModal = ({
  isOpen,
  onClose,
  formData,
  handleChange,
  handleSelectChange,
  handleSubmit,
  isSubmitting,
  isUpdating,
}: MusicCreateUpdateModalProps) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpdating ? "Update Music" : "Create Music"}
      hideFooter={true} // MusicForm has its own footer
    >
      <MusicForm
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        handleCloseModal={onClose} // Pass onClose as the cancel handler
        isSubmitting={isSubmitting}
        isUpdating={isUpdating}
      />
    </CustomModal>
  );
};
