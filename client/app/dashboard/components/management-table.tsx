// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-table.tsx
"use client";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import MusicList from "./music-list"; // For artist role view
import { DataTableHeader } from "./data-header";
import { DataTable } from "./data-table";
import { ManagementModals } from "./management-modal";
import { getManagementConfig } from "./management-colums"; // Import management config
import { useManagementData } from "@/hooks/use-management"; // Import hooks
import { useManagementMutations } from "@/hooks/use-management-mutation";
import { useManagementModals } from "@/hooks/use-management-modal"; // Import modals hook
import { ArtistProfile, User, ManagerProfile } from "@/types/auth"; // Import types

type DataItem = User | ArtistProfile | ManagerProfile;
type CreateData = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;
type UpdateDataInput = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;

interface UserManagementTableProps {
  currentUserRole: string;
  type?: "user" | "artist" | "manager";
  filteredData?: ArtistProfile[]; // For manager view
}

export default function UserManagementTable({
  currentUserRole,
  type,
  filteredData,
}: UserManagementTableProps) {

  // --- Hooks ---
  const {
    searchTerm,
    setSearchTerm,
    dataToDisplay,
    managerMap,
    isLoadingQueries,
  } = useManagementData(type, filteredData);

  const {
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
    resetModalState,
  } = useManagementModals();

  const {
    submitMutation,
    deleteMutation,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    isMutating,
  } = useManagementMutations(type, {
      // Callbacks to sync modal state with mutation state
      onSuccess: (_action, _itemType) => {
          resetModalState(); // Close modals and reset state on success
      },
      onDeleteSettled: () => {
          resetModalState(); // Close modals and reset state after delete attempt
      },
      // onError: (error, action, itemType) => { /* Optional: Add specific error handling */ }
  });

  // --- Config ---
  const { columns, title, createLabel } = useMemo(() => getManagementConfig(type), [type]);
  const showCreateButton = currentUserRole === "super_admin" ||
                           (currentUserRole === "artist_manager" && type === "manager");

  // --- Handlers ---
  const handleFormSubmit = async (data: CreateData | UpdateDataInput) => {
      // submitMutation handles success/error internally and calls onSuccess callback
      await submitMutation(data, isCreating, selectedItem?.id);
  };

  const confirmDelete = () => {
    if (selectedItem?.id) {
      // deleteMutation handles success/error internally and calls onDeleteSettled callback
      deleteMutation(selectedItem.id);
    }
  };

  // --- Render Logic ---
  if (isLoadingQueries) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {currentUserRole === "artist" ? (
        <MusicList />
      ) : type ? (
        <>
          <DataTableHeader
            title={title}
            searchPlaceholder={`Search by ${type === "user" ? "email" : "name"}...`}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            createButtonLabel={createLabel}
            onCreate={handleOpenModalForCreate}
            showCreateButton={showCreateButton}
            isActionLoading={isMutating} // Use combined mutation loading state
          />

          <DataTable
            data={dataToDisplay as DataItem[]} // Cast needed due to hook return type
            columns={columns as any} // Cast needed due to hook return type
            onEdit={handleOpenModalForEdit}
            onDelete={handleDeleteRequest}
            isLoadingEdit={isLoadingUpdate} // Pass specific loading states
            isLoadingDelete={isLoadingDelete}
            currentUserRole={currentUserRole}
            itemType={type}
            managerMap={managerMap}
            searchTerm={searchTerm}
          />
        </>
      ) : (
        <div>Select a management category.</div>
      )}

      <ManagementModals
        isModalOpen={isModalOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        type={type}
        isCreating={isCreating}
        isUpdating={isUpdating}
        selectedItem={selectedItem}
        isLoadingCreate={isLoadingCreate}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingDelete={isLoadingDelete}
        onCloseModal={handleCloseModal}
        onCloseDeleteModal={cancelDelete}
        onConfirmDelete={confirmDelete}
        onSubmit={handleFormSubmit}
        currentUserId={type === 'artist' ? (selectedItem as ArtistProfile)?.user_id : undefined}
      />
    </div>
  );
}
