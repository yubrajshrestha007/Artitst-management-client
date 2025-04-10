// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-table.tsx
"use client";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "@/shared/queries/users";
import { useState, useCallback, useMemo } from "react";
// Removed direct modal/form imports if only used in ManagementModals
// import UserModal from "./user-modal";
// import ManagerProfileForm from "./manager-profile";
// import ArtistProfileForm from "./artist-profile";
// import { CustomModal } from "@/components/ui/custom-modal";
import { User, ArtistProfile, ManagerProfile } from "@/types/auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import MusicList from "./music-list"; // For artist role view
import {
  useCreateArtistProfileMutation,
  useDeleteArtistProfileMutation,
  useUpdateArtistProfileMutation,
  useArtistProfileListQuery,
} from "@/shared/queries/artist-profile";
import {
  useCreateManagerProfileMutation,
  useDeleteManagerProfileMutation,
  useUpdateManagerProfileMutation,
  useManagersQuery,
} from "@/shared/queries/manager-profile";

import { DataTableHeader } from "./data-header";
import { DataTable, ColumnDefinition } from "./data-table";
import { ManagementModals } from "./management-modal"; // Import the new component

// Define a union type for the items the table can display
type DataItem = User | ArtistProfile | ManagerProfile;

interface UserManagementTableProps {
  currentUserRole: string;
  type?: "user" | "artist" | "manager";
  filteredData?: ArtistProfile[];
}

// Use Partial for all create/update types for flexibility
type CreateData = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;
type UpdateData = {
  id: string;
  data: Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;
};

// Define a more specific type for Axios-like errors if possible, or use a helper
interface AxiosErrorLike {
    response?: {
        data?: {
            detail?: string;
            message?: string;
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
    message?: string;
    [key: string]: unknown;
}

// Type guard to check if an error looks like an Axios error
function isAxiosErrorLike(error: unknown): error is AxiosErrorLike {
    return typeof error === 'object' && error !== null && 'response' in error;
}


export default function UserManagementTable({
  currentUserRole,
  type,
  filteredData,
}: UserManagementTableProps) {
  const queryClient = useQueryClient();

  // --- Queries & Mutations ---
  const { data: usersData, isLoading: isUsersLoading } = useUsersQuery();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const { data: artistProfileData, isLoading: isArtistProfilesLoading } =
    useArtistProfileListQuery();
  const createArtistProfileMutation = useCreateArtistProfileMutation();
  const updateArtistProfileMutation = useUpdateArtistProfileMutation();
  const deleteArtistProfileMutation = useDeleteArtistProfileMutation();

  const { data: managerProfileData, isLoading: isManagerProfilesLoading } =
    useManagersQuery();
  const createManagerProfileMutation = useCreateManagerProfileMutation();
  const updateManagerProfileMutation = useUpdateManagerProfileMutation();
  const deleteManagerProfileMutation = useDeleteManagerProfileMutation();

  // --- Memoized Raw Data ---
  const users = useMemo(() => usersData?.users || [], [usersData]);
  const allArtistProfiles = useMemo(
    () => (Array.isArray(artistProfileData) ? artistProfileData : []),
    [artistProfileData]
  );
  const managerProfiles: ManagerProfile[] = useMemo(
    () => (Array.isArray(managerProfileData) ? managerProfileData : []),
    [managerProfileData]
  );
  const managerMap = useMemo(() => {
    const map = new Map<string, string>();
    managerProfiles.forEach((manager) => {
      if (manager.id) {
        map.set(manager.id, manager.name || "Unnamed Manager");
      }
    });
    return map;
  }, [managerProfiles]);

  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isLoadingQueries =
    isUsersLoading || isArtistProfilesLoading || isManagerProfilesLoading;

  const isMutating = // Combined loading state for header button
    createUserMutation.isPending ||
    updateUserMutation.isPending ||
    deleteUserMutation.isPending ||
    createArtistProfileMutation.isPending ||
    updateArtistProfileMutation.isPending ||
    deleteArtistProfileMutation.isPending ||
    createManagerProfileMutation.isPending ||
    updateManagerProfileMutation.isPending ||
    deleteManagerProfileMutation.isPending;

  // --- Memoized Filtered Data ---
  const dataToDisplay = useMemo(() => {
    const term = searchTerm.toLowerCase();
    switch (type) {
      case "user":
        return users.filter((user) => user.email.toLowerCase().includes(term));
      case "artist":
        const profilesToFilter = filteredData || allArtistProfiles;
        return profilesToFilter.filter(
          (artist) =>
            artist.name?.toLowerCase().includes(term) ||
            managerMap.get(artist.manager_id_id || "")?.toLowerCase().includes(term)
        );
      case "manager":
        return managerProfiles.filter((manager) =>
          manager.name?.toLowerCase().includes(term)
        );
      default:
        return [];
    }
  }, [searchTerm, type, users, allArtistProfiles, managerProfiles, managerMap, filteredData]);


  // --- Invalidation Callback ---
  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["managers"] });
  }, [queryClient]);

  // --- Mutation Handlers (Error & Success) ---
  const handleMutationError = (
    error: unknown,
    action: string,
    itemType: string
  ) => {
    let backendError = 'An unknown error occurred';
    if (isAxiosErrorLike(error)) {
        const responseData = error.response?.data;
        if (responseData) {
            backendError = responseData.detail || responseData.message || backendError;
        } else if (error.message) {
             backendError = error.message;
        }
    } else if (error instanceof Error) {
        backendError = error.message;
    } else if (typeof error === 'string') {
        backendError = error;
    }
    toast.error(`Error ${action} ${itemType}: ${backendError}`);
    const errorDetailsToLog = isAxiosErrorLike(error) ? error.response?.data : error;
    console.error(`Error ${action} ${itemType}:`, errorDetailsToLog);
  };

  const handleMutationSuccess = useCallback((action: string, itemType: string) => {
    toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${action}d successfully!`);
    setIsCreating(false);
    setIsUpdating(false);
    setIsModalOpen(false);
    setSelectedItem(null);
    invalidateQueries();
  }, [invalidateQueries]);

  // --- Combined Create/Update Handler for Modals ---
  const handleFormSubmit = useCallback(
    async (data: CreateData | UpdateData) => {
      const itemType = type || "item";
      if (isCreating) {
        // --- Create Logic ---
        try {
          if (type === "user") {
            await createUserMutation.mutateAsync(data as Partial<User>);
          } else if (type === "artist") {
            await createArtistProfileMutation.mutateAsync(data as Partial<ArtistProfile>);
          } else if (type === "manager") {
            await createManagerProfileMutation.mutateAsync(data as Partial<ManagerProfile>);
          }
          handleMutationSuccess("create", itemType);
        } catch (error) {
          handleMutationError(error, "creating", itemType);
        }
      } else if (isUpdating) {
        // --- Update Logic ---
        if (!selectedItem?.id) {
          toast.error("No item selected for update.");
          return;
        }
        try {
          if (type === "user") {
            await updateUserMutation.mutateAsync({
              id: selectedItem!.id,
              data: data as Partial<User>,
            });
          } else if (type === "artist") {
            await updateArtistProfileMutation.mutateAsync({
              id: selectedItem!.id,
              data: data as Partial<ArtistProfile>,
            });
          } else if (type === "manager") {
            await updateManagerProfileMutation.mutateAsync({
              id: selectedItem!.id,
              data: data as Partial<ManagerProfile>,
            });
          }
          handleMutationSuccess("update", itemType);
        } catch (error) {
          handleMutationError(error, "updating", itemType);
        }
      }
    },
    [
      type,
      isCreating,
      isUpdating,
      selectedItem,
      createUserMutation,
      createArtistProfileMutation,
      createManagerProfileMutation,
      updateUserMutation,
      updateArtistProfileMutation,
      updateManagerProfileMutation,
      handleMutationSuccess,
      // handleMutationError // Not needed as dependency
    ]
  );


  // --- Delete Handler ---
  const handleDelete = useCallback(
    async (id: string) => {
      const itemType = type || "item";
      try {
        if (type === "user") {
          await deleteUserMutation.mutateAsync(id);
        } else if (type === "artist") {
          await deleteArtistProfileMutation.mutateAsync(id);
        } else if (type === "manager") {
          await deleteManagerProfileMutation.mutateAsync(id);
        }
        toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
        invalidateQueries();
      } catch (error) {
        handleMutationError(error, "deleting", itemType);
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
      }
    },
    [
      type,
      deleteUserMutation,
      deleteArtistProfileMutation,
      deleteManagerProfileMutation,
      invalidateQueries,
      // handleMutationError // Not needed as dependency
    ]
  );

  // --- Modal Control Handlers ---
  const handleOpenModalForEdit = useCallback(
    (item: DataItem) => {
      setSelectedItem(item);
      setIsCreating(false);
      setIsUpdating(true);
      setIsModalOpen(true);
    },
    []
  );

    const handleOpenModalForCreate = useCallback(
    () => {
      setSelectedItem(null);
      setIsCreating(true);
      setIsUpdating(false);
      setIsModalOpen(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setIsCreating(false);
    setIsUpdating(false);
  }, []);

  const handleDeleteRequest = useCallback(
    (item: DataItem) => {
      setSelectedItem(item);
      setIsDeleteDialogOpen(true);
    },
    []
  );

  const confirmDelete = useCallback(() => {
    if (selectedItem?.id) {
      handleDelete(selectedItem.id);
    }
  }, [handleDelete, selectedItem]);

  const cancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  }, []);

  // --- Column Definitions (Keep here or move to constants) ---
  const userColumns: ColumnDefinition<User>[] = [
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "is_active", label: "Status" },
  ];

  const artistColumns: ColumnDefinition<ArtistProfile>[] = [
      { key: "name", label: "Name" },
      { key: "gender", label: "Gender" },
      { key: "address", label: "Address" },
      { key: "date_of_birth", label: "Date of Birth" },
      { key: "first_release_year", label: "First Release Year" },
      { key: "manager_id_id", label: "Manager Name" },
      { key: "no_of_albums_released", label: "Albums Released" },
  ];

  const managerColumns: ColumnDefinition<ManagerProfile>[] = [
      { key: "name", label: "Name" },
      { key: "gender", label: "Gender" },
      { key: "address", label: "Address" },
      { key: "date_of_birth", label: "Date of Birth" },
      { key: "company_name", label: "Company Name" },
      { key: "company_email", label: "Company Email" },
      { key: "company_phone", label: "Company Phone" },
  ];

  // --- Determine Current Config based on Type ---
  const { columns, title, createLabel } = useMemo(() => {
    switch (type) {
      case "user":
        return { columns: userColumns, title: "User List", createLabel: "Create User" };
      case "artist":
        return { columns: artistColumns, title: "Artist Profiles", createLabel: "Create Artist Profile" };
      case "manager":
        return { columns: managerColumns, title: "Manager Profiles", createLabel: "Create Manager Profile" };
      default:
        return { columns: [], title: "Management", createLabel: "Create Item" };
    }
  }, [type]);

  const showCreateButton = currentUserRole === "super_admin" ||
                           (currentUserRole === "artist_manager" && type === "manager");

  // --- Loading State ---
  if (isLoadingQueries) {
    return (
        <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading data...</span>
        </div>
    );
  }

  // --- Main Component Return ---
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Render based on role and type */}
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
            isActionLoading={isMutating}
          />

          <DataTable
            data={dataToDisplay as DataItem[]}
            columns={columns as ColumnDefinition<DataItem>[]}
            onEdit={handleOpenModalForEdit}
            onDelete={handleDeleteRequest}
            isLoadingEdit={updateUserMutation.isPending || updateArtistProfileMutation.isPending || updateManagerProfileMutation.isPending}
            isLoadingDelete={deleteUserMutation.isPending || deleteArtistProfileMutation.isPending || deleteManagerProfileMutation.isPending}
            currentUserRole={currentUserRole}
            itemType={type}
            managerMap={managerMap}
            searchTerm={searchTerm}
          />
        </>
      ) : (
        <div>Select a management category.</div>
      )}

      {/* --- Render the Centralized Modals Component --- */}
      <ManagementModals
        isModalOpen={isModalOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        type={type}
        isCreating={isCreating}
        isUpdating={isUpdating}
        selectedItem={selectedItem}
        isLoadingCreate={createUserMutation.isPending || createArtistProfileMutation.isPending || createManagerProfileMutation.isPending}
        isLoadingUpdate={updateUserMutation.isPending || updateArtistProfileMutation.isPending || updateManagerProfileMutation.isPending}
        isLoadingDelete={deleteUserMutation.isPending || deleteArtistProfileMutation.isPending || deleteManagerProfileMutation.isPending}
        onCloseModal={handleCloseModal}
        onCloseDeleteModal={cancelDelete}
        onConfirmDelete={confirmDelete}
        onSubmit={handleFormSubmit} // Pass the combined submit handler
        // Pass user ID from selected item if it's an ArtistProfile, otherwise null/undefined
        currentUserId={type === 'artist' ? (selectedItem as ArtistProfile)?.user_id : undefined}
      />
    </div>
  );
}
