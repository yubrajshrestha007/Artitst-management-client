// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-modal.tsx
"use client";

import { useMemo } from "react"; // <-- Import useMemo from React
import { User, ArtistProfile, ManagerProfile } from "@/types/auth";
import { CustomModal } from "@/components/ui/custom-modal";
import UserModal from "./user-modal";
import ArtistProfileForm from "./artist-profile";
import ManagerProfileForm from "./manager-profile";

// Define a union type for the items the table can display
type DataItem = User | ArtistProfile | ManagerProfile;

// Use Partial for all create/update types for flexibility
type CreateData = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;
type UpdateData = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;


interface ManagementModalsProps {
  // Modal visibility state
  isModalOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Modal configuration state
  type: "user" | "artist" | "manager" | undefined; // Which type of item are we managing?
  isCreating: boolean;
  isUpdating: boolean;
  selectedItem: DataItem | null;

  // Loading states from mutations
  isLoadingCreate: boolean;
  isLoadingUpdate: boolean;
  isLoadingDelete: boolean;

  // Event handlers from parent
  onCloseModal: () => void; // Handler to close the main create/update modal
  onCloseDeleteModal: () => void; // Handler to close the delete confirmation modal
  onConfirmDelete: () => void; // Handler to confirm deletion
  onSubmit: (data: CreateData | UpdateData) => void; // Combined create/update handler

  // Specific data needed by forms
  currentUserId?: string | null; // Needed for creating artist profile
}

export const ManagementModals = ({
  isModalOpen,
  isDeleteDialogOpen,
  type,
  isCreating,
  isUpdating,
  selectedItem,
  isLoadingCreate,
  isLoadingUpdate,
  isLoadingDelete,
  onCloseModal,
  onCloseDeleteModal,
  onConfirmDelete,
  onSubmit,
  currentUserId,
}: ManagementModalsProps) => {

  // Determine combined loading state for forms/modals
  const isFormLoading = isLoadingCreate || isLoadingUpdate;

  // Determine the title for the create/update modal
  const modalTitle = useMemo(() => { // <-- This line caused the error
    const action = isCreating ? "Create" : "Update";
    switch (type) {
      case "user": return `${action} User`;
      case "artist": return `${action} Artist Profile`;
      case "manager": return `${action} Manager Profile`;
      default: return action;
    }
  }, [isCreating, type]);

  // Determine the item name for the delete confirmation
  const itemTypeName = type || 'item';
  const deleteDescription = `This action cannot be undone. This will permanently delete the ${itemTypeName}.`;

  return (
    <>
      {/* --- Create/Update Modal Rendering Logic --- */}
      {isModalOpen && type && (
        <>
          {/* User Form Modal */}
          {type === "user" && (
            <UserModal
              isOpen={isModalOpen}
              onClose={onCloseModal}
              onSubmit={onSubmit}
              initialData={selectedItem as Partial<User> | undefined}
              isCreating={isCreating}
              isUpdating={isUpdating}
              isLoading={isFormLoading}
            />
          )}

          {/* Artist Profile Form Modal */}
          {type === "artist" && (
             <CustomModal
               isOpen={isModalOpen}
               onClose={onCloseModal}
               title={modalTitle}
               hideFooter={true} // ArtistProfileForm has its own footer
             >
               <ArtistProfileForm
                 onSubmit={onSubmit} // Pass the combined handler
                 initialData={selectedItem as ArtistProfile | null | undefined}
                 onCancel={onCloseModal}
                 isLoading={isFormLoading}
                 onDeleteSuccess={onCloseModal} // Close modal after delete from form
                 currentUserId={currentUserId} // Pass currentUserId
               />
             </CustomModal>
          )}

          {/* Manager Profile Form Modal */}
          {type === "manager" && (
            <CustomModal
              isOpen={isModalOpen}
              onClose={onCloseModal}
              title={modalTitle}
              hideFooter={true} // ManagerProfileForm has its own footer
            >
              <ManagerProfileForm
                onSubmit={onSubmit} // Pass the combined handler
                initialData={selectedItem as ManagerProfile | undefined}
                onCancel={onCloseModal}
              />
            </CustomModal>
          )}
        </>
      )}

      {/* --- Delete Confirmation Modal --- */}
      <CustomModal
        isOpen={isDeleteDialogOpen}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title="Are you absolutely sure?"
        description={deleteDescription}
        isConfirmLoading={isLoadingDelete}
      />
    </>
  );
};
