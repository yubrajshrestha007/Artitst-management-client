// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-table.tsx
"use client";
import { useMemo, useState } from "react"; // Import useState
import { Loader2 } from "lucide-react";
import { ColumnDefinition } from "./data-table"; // Keep if needed for casting
import { ManagementModals } from "./management-modal";
import { ManagementView } from "./management-view"; // Import the new view component
import { getManagementConfig } from "./management-colums";
import { useManagementData } from "@/hooks/use-management";
import { useManagementMutations } from "@/hooks/use-management-mutation";
import { useManagementModals } from "@/hooks/use-management-modal";
import { ArtistProfile, User, ManagerProfile } from "@/types/auth";
import { ItemDetailModal } from "./item-detail-modal"; // Import the detail modal
import { ItemType } from "@/config/detailViewConfig"; // Import ItemType

type DataItem = User | ArtistProfile | ManagerProfile;
type CreateData = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;
type UpdateDataInput = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;

interface UserManagementTableProps {
  currentUserRole: string;
  type?: "user" | "artist" | "manager";
  filteredData?: ArtistProfile[];
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

  // --- State for Detail Modal ---
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [itemForDetail, setItemForDetail] = useState<DataItem | null>(null);

  const {
    submitMutation,
    deleteMutation,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    isMutating,
  } = useManagementMutations(type, {
      onSuccess: () => { resetModalState(); },
      onDeleteSettled: () => { resetModalState(); },
  });

  // --- Config ---
  const { columns, title, createLabel } = useMemo(() => getManagementConfig(type), [type]);
  const showCreateButton = currentUserRole === "super_admin" ||
                           (currentUserRole === "artist_manager" && type === "manager");
  const searchPlaceholder = `Search by ${type === "user" ? "email" : "name"}...`;

  // --- Handlers ---
  const handleFormSubmit = async (data: CreateData | UpdateDataInput) => {
      try { await submitMutation(data, isCreating, selectedItem?.id); }
      catch (error) { console.error("Submit mutation failed:", error); }
  };

  const confirmDelete = () => {
    if (selectedItem?.id) { deleteMutation(selectedItem.id); }
  };

  // Handler to open the detail modal
  const handleViewDetails = (item: DataItem) => {
    setItemForDetail(item);
    setIsDetailModalOpen(true);
  };

  // Handler to close the detail modal
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setItemForDetail(null); // Clear item when closing
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
      {/* Render the main view component */}
      <ManagementView
        currentUserRole={currentUserRole}
        type={type}
        // Pass all relevant props needed by ManagementTableView
        title={title}
        searchPlaceholder={searchPlaceholder}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        createButtonLabel={createLabel}
        onCreate={handleOpenModalForCreate}
        showCreateButton={showCreateButton}
        isActionLoading={isMutating}
        data={dataToDisplay as DataItem[]}
        columns={columns as ColumnDefinition<DataItem>[]}
        onEdit={handleOpenModalForEdit}
        onDelete={handleDeleteRequest}
        onView={handleViewDetails} // <<< Pass the view handler
        isLoadingEdit={isLoadingUpdate}
        isLoadingDelete={isLoadingDelete}
        managerMap={managerMap}
      />

      {/* Create/Update/Delete Modals */}
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

      {/* <<< ADDED: Detail View Modal >>> */}
      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        item={itemForDetail}
        itemType={type as ItemType | null} // Pass the current table type
        managerMap={managerMap} // Pass managerMap for artist details
      />
    </div>
  );
}
