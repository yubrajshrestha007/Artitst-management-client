// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-table.tsx
"use client";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "@/shared/queries/users";
import { useState, useEffect, useCallback, useMemo } from "react";
import UserModal from "./user-modal"; // User modal component
import { User, ArtistProfile, ManagerProfile } from "@/types/auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { CustomModal } from "@/components/ui/custom-modal"; // Generic modal wrapper
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
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
import ManagerProfileForm from "./manager-profile"; // Manager form component
import ArtistProfileForm from "./artist-profile"; // <-- ***** IMPORT THE ARTIST FORM *****

interface UserManagementTableProps {
  currentUserRole: string;
  type?: "user" | "artist" | "manager";
  filteredData?: ArtistProfile[]; // For manager viewing specific artists
}

// Use Partial for all create/update types for flexibility
type CreateData = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;
type UpdateData = {
  id: string;
  data: Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;
};

export default function UserManagementTable({
  currentUserRole,
  type,
  filteredData,
}: UserManagementTableProps) {
  const queryClient = useQueryClient();

  // --- Queries & Mutations (Keep as they are) ---
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

  // --- Memoized Data (Keep as they are) ---
  const users = useMemo(() => usersData?.users || [], [usersData]);
  const artistProfiles = useMemo(
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

  // --- State (Keep as they are) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [filteredArtists, setFilteredArtists] = useState<ArtistProfile[]>([]);
  const [filteredManagers, setFilteredManagers] = useState(managerProfiles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    User | ArtistProfile | ManagerProfile | null
  >(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isLoading =
    isUsersLoading || isArtistProfilesLoading || isManagerProfilesLoading;

  // --- Invalidation Callback (Keep as it is) ---
  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["managers"] });
  }, [queryClient]);

  // --- Effects for Filtering (Keep as they are, maybe refine artist search) ---
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    if (type === "user") {
      setFilteredUsers(
        users.filter((user) => user.email.toLowerCase().includes(term))
      );
    } else if (type === "artist") {
      const profilesToFilter = filteredData || artistProfiles;
      setFilteredArtists(
        profilesToFilter.filter(
          (artist) =>
            artist.name?.toLowerCase().includes(term) ||
            managerMap.get(artist.manager_id_id || "")?.toLowerCase().includes(term) // Also search by manager name
        )
      );
    } else if (type === "manager") {
      setFilteredManagers(
        managerProfiles.filter((manager) =>
          manager.name?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, users, artistProfiles, managerProfiles, type, filteredData, managerMap]);

  // --- Effects to Update Filtered Lists on Data Change (Keep as they are) ---
   useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  useEffect(() => {
    const profilesToFilter = filteredData || artistProfiles;
    setFilteredArtists(profilesToFilter);
  }, [artistProfiles, filteredData]);

  useEffect(() => {
    setFilteredManagers(managerProfiles);
  }, [managerProfiles]);

  // --- Mutation Handlers (Refined for better state management) ---
  const handleMutationError = (
    error: any,
    action: string,
    itemType: string
  ) => {
    const backendError = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'An unknown error occurred';
    toast.error(`Error ${action} ${itemType}: ${backendError}`);
    console.error(`Error ${action} ${itemType}:`, error.response?.data || error);
    // Don't close modal on error
  };

  const handleMutationSuccess = (action: string, itemType: string) => {
    toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${action}d successfully!`);
    // Close modal and reset state on success
    setIsCreating(false);
    setIsUpdating(false);
    setIsModalOpen(false);
    setSelectedItem(null);
    invalidateQueries();
  };

  // Removed the handleMutationFinally function as success/error handle state now

  const handleCreate = useCallback(
    async (data: CreateData) => {
      // No need to set isCreating state here, mutation isLoading handles UI feedback
      const itemType = type || "item";
      try {
        if (type === "user") {
          await createUserMutation.mutateAsync(data as Partial<User>);
        } else if (type === "artist") {
          // ArtistProfileForm should provide the correct structure
          // Ensure user_id is handled if needed (e.g., passed down or added in form)
          await createArtistProfileMutation.mutateAsync(data as Partial<ArtistProfile>);
        } else if (type === "manager") {
          await createManagerProfileMutation.mutateAsync(data as Partial<ManagerProfile>);
        }
        handleMutationSuccess("create", itemType); // Handle success state updates
      } catch (error) {
        handleMutationError(error, "creating", itemType);
        // Keep modal open on error
      }
    },
    [
      type,
      createUserMutation,
      createArtistProfileMutation,
      createManagerProfileMutation,
      invalidateQueries, // Keep invalidateQueries for success case
    ]
  );

  const handleUpdate = useCallback(
    async (data: UpdateData["data"]) => {
      // No need to set isUpdating state here
      const itemType = type || "item";
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
        handleMutationSuccess("update", itemType); // Handle success state updates
      } catch (error) {
        handleMutationError(error, "updating", itemType);
         // Keep modal open on error
      }
    },
    [
      type,
      updateUserMutation,
      updateArtistProfileMutation,
      updateManagerProfileMutation,
      selectedItem,
      invalidateQueries, // Keep invalidateQueries for success case
    ]
  );

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
        invalidateQueries(); // Invalidate after successful deletion
      } catch (error) {
        handleMutationError(error, "deleting", itemType);
      } finally {
        setIsDeleteDialogOpen(false); // Close confirmation modal regardless
        setSelectedItem(null);
      }
    },
    [
      type,
      deleteUserMutation,
      deleteArtistProfileMutation,
      deleteManagerProfileMutation,
      invalidateQueries,
    ]
  );

  // --- Modal Control Handlers (Keep as they are) ---
  const handleOpenModal = useCallback(
    (
      item: User | ArtistProfile | ManagerProfile | null = null,
      isUpdate = false
    ) => {
      setSelectedItem(item);
      setIsCreating(!isUpdate);
      setIsUpdating(isUpdate);
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

  const handleDeleteItem = useCallback(
    (item: User | ArtistProfile | ManagerProfile) => {
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

  // --- Table Rendering Logic (Keep renderTable, renderUserTable, etc. as they are) ---
  const renderTable = (
    data: any[],
    columns: { key: string; label: string }[],
    managerMapArg: Map<string, string>
  ) => {
    // Determine button visibility based on role and type
    const showCreateButton = currentUserRole === "super_admin" ||
                             (currentUserRole === "artist_manager" && type === "manager"); // Managers can create managers

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {type === "user"
              ? "User List"
              : type === "artist"
              ? "Artist Profiles"
              : "Manager Profiles"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder={`Search by ${
                  type === "user" ? "email" : "name"
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-8"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
            {showCreateButton && (
              <Button onClick={() => handleOpenModal(null)}>
                Create{" "}
                {type === "user"
                  ? "User"
                  : type === "artist" // This case won't be hit if button isn't shown
                  ? "Artist Profile"
                  : "Manager Profile"}
              </Button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 text-center"
                  >
                    No {type}s found
                    {searchTerm && " matching your search"}.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((col) => (
                      <TableCell key={`${item.id}-${col.key}`}>
                        {col.key === "manager_id_id" && type === "artist" ? (
                          managerMapArg.get(item.manager_id_id) || "N/A"
                        ) : col.key === "is_active" && type === "user" ? ( // Only show icon for user type
                          item.is_active ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        ) : col.key === "date_of_birth" &&
                          item.date_of_birth ? (
                          new Date(item.date_of_birth).toLocaleDateString()
                        ) : (
                          item[col.key] ?? "N/A"
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Edit button: Admins edit all. Managers edit their artists. */}
                        {(currentUserRole === "super_admin" || (currentUserRole === "artist_manager" && type === "artist")) && (
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => handleOpenModal(item, true)}
                             title={`Edit ${type}`}
                             // Disable if any update mutation is loading
                             disabled={updateUserMutation.isLoading || updateArtistProfileMutation.isLoading || updateManagerProfileMutation.isLoading}
                           >
                             <Pencil className="h-4 w-4" />
                           </Button>
                        )}
                        {/* Delete button: Only Admins can delete */}
                        {currentUserRole === "super_admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item)}
                            title={`Delete ${type}`}
                            // Disable if any delete mutation is loading
                            disabled={deleteUserMutation.isLoading || deleteArtistProfileMutation.isLoading || deleteManagerProfileMutation.isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </>
    );
  };

  const renderUserTable = () => {
    const columns = [
      // { key: "id", label: "ID" }, // Often not needed in UI
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "is_active", label: "Status" },
    ];
    return renderTable(filteredUsers, columns, managerMap);
  };

  const renderArtistTable = () => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "gender", label: "Gender" },
      { key: "address", label: "Address" },
      { key: "date_of_birth", label: "Date of Birth" },
      { key: "first_release_year", label: "First Release Year" },
      { key: "manager_id_id", label: "Manager Name" },
      { key: "no_of_albums_released", label: "Albums Released" },
    ];
    // Use filteredArtists which respects the filteredData prop if provided
    return renderTable(filteredArtists, columns, managerMap);
  };

  const renderManagerTable = () => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "gender", label: "Gender" },
      { key: "address", label: "Address" },
      { key: "date_of_birth", label: "Date of Birth" },
      { key: "company_name", label: "Company Name" },
      { key: "company_email", label: "Company Email" },
      { key: "company_phone", label: "Company Phone" },
    ];
    return renderTable(filteredManagers, columns, managerMap);
  };


  // --- Loading State ---
  if (isLoading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }

  // --- Main Component Return ---
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Render tables based on role and type */}
      {currentUserRole === "super_admin" && (
        <>
          {type === "user" && renderUserTable()}
          {type === "artist" && renderArtistTable()}
          {type === "manager" && renderManagerTable()}
        </>
      )}
      {currentUserRole === "artist_manager" && type === "artist" && renderArtistTable()}
      {currentUserRole === "artist" && <MusicList />}

      {/* --- Modal Rendering Logic --- */}
      {isModalOpen && (
        <>
          {/* User Form Modal */}
          {type === "user" && (
            <UserModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={isCreating ? handleCreate : (data) => handleUpdate(data)}
              initialData={selectedItem as Partial<User> | undefined}
              isCreating={isCreating}
              isUpdating={isUpdating}
              // Pass the combined loading state from create/update mutations
              isLoading={createUserMutation.isLoading || updateUserMutation.isLoading}
            />
          )}

          {/* Artist Profile Form Modal */}
          {type === "artist" && (
             <CustomModal
               isOpen={isModalOpen}
               onClose={handleCloseModal}
               title={isCreating ? "Create Artist Profile" : "Update Artist Profile"}
               // Optional: Add class for width/styling if needed
               // className="sm:max-w-lg"
             >
               <ArtistProfileForm
                 onSubmit={isCreating ? handleCreate : (data) => handleUpdate(data)}
                 initialData={selectedItem as ArtistProfile | null | undefined} // Cast appropriately
                 onCancel={handleCloseModal}
                 // Pass currentUserId if needed for creation logic within ArtistProfileForm
                 // currentUserId={usersData?.currentUserId} // Example if needed
                 // Pass mutation loading states if ArtistProfileForm needs them for disabling submit
                 // isSubmitting={createArtistProfileMutation.isLoading || updateArtistProfileMutation.isLoading}
               />
             </CustomModal>
          )}

          {/* Manager Profile Form Modal */}
          {type === "manager" && (
            <CustomModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              title={isCreating ? "Create Manager Profile" : "Update Manager Profile"}
              // Optional: Add class for width/styling if needed
              // className="sm:max-w-lg"
            >
              <ManagerProfileForm
                onSubmit={isCreating ? handleCreate : (data) => handleUpdate(data)}
                initialData={selectedItem as ManagerProfile | undefined}
                onCancel={handleCloseModal}
                // Pass mutation loading states if ManagerProfileForm needs them
                // isSubmitting={createManagerProfileMutation.isLoading || updateManagerProfileMutation.isLoading}
              />
            </CustomModal>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteDialogOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete the ${type || 'item'}.`}
        // Pass loading state for the confirm button
        isConfirmLoading={deleteUserMutation.isLoading || deleteArtistProfileMutation.isLoading || deleteManagerProfileMutation.isLoading}
      />
    </div>
  );
}
