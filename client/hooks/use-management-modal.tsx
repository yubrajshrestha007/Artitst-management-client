// /home/mint/Desktop/ArtistMgntFront/client/hooks/useManagementModals.ts
import { useState, useCallback } from "react";
import { User, ArtistProfile, ManagerProfile } from "@/types/auth";

type DataItem = User | ArtistProfile | ManagerProfile;

export const useManagementModals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const resetModalState = useCallback(() => {
    setIsModalOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
    setIsCreating(false);
    setIsUpdating(false);
  }, []);

  const handleOpenModalForEdit = useCallback((item: DataItem) => {
    setSelectedItem(item);
    setIsCreating(false);
    setIsUpdating(true);
    setIsModalOpen(true);
  }, []);

  const handleOpenModalForCreate = useCallback(() => {
    setSelectedItem(null);
    setIsCreating(true);
    setIsUpdating(false);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Keep selectedItem for potential delete confirmation after closing edit
    // resetModalState(); // Optionally fully reset here
  }, []);

  const handleDeleteRequest = useCallback((item: DataItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const cancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    // Don't reset selectedItem here, might be needed if delete fails
  }, []);

  // Note: confirmDelete logic is handled by the deleteMutation in the parent

  return {
    isModalOpen,
    isDeleteDialogOpen,
    selectedItem,
    isCreating,
    isUpdating,
    handleOpenModalForEdit,
    handleOpenModalForCreate,
    handleCloseModal,
    handleDeleteRequest,
    cancelDelete,
    resetModalState, // Expose reset function
  };
};
