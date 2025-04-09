// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-table.tsx
"use client";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "@/shared/queries/users";
import { useState, useEffect, useCallback, useMemo } from "react";
import UserModal from "./user-modal";
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
import { CustomModal } from "@/components/ui/custom-modal";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import MusicList from "./music-list";
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
import ManagerProfileForm from "./manager-profile";

interface UserManagementTableProps {
  currentUserRole: string;
  type?: "user" | "artist" | "manager";
  filteredData?: ArtistProfile[]; // Add filteredData prop
}

type CreateData = Partial<User> | ArtistProfile | Partial<ManagerProfile>;
type UpdateData = {
  id: string;
  data: Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;
};

export default function UserManagementTable({
  currentUserRole,
  type,
  filteredData, // Receive filteredData
}: UserManagementTableProps) {
  const queryClient = useQueryClient();
  const { data: usersData, isLoading: isUsersLoading } = useUsersQuery();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const { data: artistProfileData, isLoading: isArtistProfilesLoading } =
    useArtistProfileListQuery();
  const artistProfiles = Array.isArray(artistProfileData) ? artistProfileData : [];

  const createArtistProfileMutation = useCreateArtistProfileMutation();
  const updateArtistProfileMutation = useUpdateArtistProfileMutation();
  const deleteArtistProfileMutation = useDeleteArtistProfileMutation();

  const {
    data: managerProfileData,
    isLoading: isManagerProfilesLoading,
  } = useManagersQuery();
  const managerProfiles: ManagerProfile[] = useMemo(
    () => (Array.isArray(managerProfileData) ? managerProfileData : []),
    [managerProfileData]
  );

  const createManagerProfileMutation = useCreateManagerProfileMutation();
  const updateManagerProfileMutation = useUpdateManagerProfileMutation();
  const deleteManagerProfileMutation = useDeleteManagerProfileMutation();

  const users = useMemo(() => usersData?.users || [], [usersData]);
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

  const managerMap = useMemo(() => {
    const map = new Map<string, string>();
    managerProfiles.forEach((manager) => {
      if (manager.id) {
        map.set(manager.id, manager.name || "Unnamed Manager");
      }
    });
    return map;
  }, [managerProfiles]);

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["managers"] });
  }, [queryClient]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    if (type === "user") {
      setFilteredUsers(
        users.filter((user) => user.email.toLowerCase().includes(term))
      );
    } else if (type === "artist") {
      const profilesToFilter = filteredData || artistProfiles;
      setFilteredArtists(
        profilesToFilter.filter((artist) =>
          artist.name?.toLowerCase().includes(term)
        )
      );
    } else if (type === "manager") {
      setFilteredManagers(
        managerProfiles.filter((manager) =>
          manager.name?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, users, artistProfiles, managerProfiles, type, filteredData]);

  const handleMutationError = (
    error: any,
    action: string,
    itemType: string
  ) => {
    toast.error(`Error ${action} ${itemType}: ${error.message}`);
  };

  const handleMutationFinally = () => {
    setIsCreating(false);
    setIsUpdating(false);
    setIsModalOpen(false);
    setSelectedItem(null);
    invalidateQueries();
  };

  const handleCreate = useCallback(
    async (data: CreateData) => {
      setIsCreating(true);
      try {
        if (type === "user") {
          await createUserMutation.mutateAsync(data as Partial<User>);
          toast.success("User created successfully!");
        } else if (type === "artist") {
          await createArtistProfileMutation.mutateAsync(data as ArtistProfile);
          toast.success("Artist profile created successfully!");
        } else if (type === "manager") {
          await createManagerProfileMutation.mutateAsync(
            data as Partial<ManagerProfile>
          );
          toast.success("Manager profile created successfully!");
        }
      } catch (error) {
        handleMutationError(error, "creating", type || "item");
      } finally {
        handleMutationFinally();
      }
    },
    [
      type,
      createUserMutation,
      createArtistProfileMutation,
      createManagerProfileMutation,
      handleMutationFinally,
    ]
  );

  const handleUpdate = useCallback(
    async (data: UpdateData["data"]) => {
      setIsUpdating(true);
      try {
        if (type === "user") {
          await updateUserMutation.mutateAsync({
            id: selectedItem!.id,
            data: data as Partial<User>,
          });
          toast.success("User updated successfully!");
        } else if (type === "artist") {
          await updateArtistProfileMutation.mutateAsync({
            id: selectedItem!.id,
            data: data as Partial<ArtistProfile>,
          });
          toast.success("Artist profile updated successfully!");
        } else if (type === "manager") {
          await updateManagerProfileMutation.mutateAsync({
            id: selectedItem!.id,
            data: data as Partial<ManagerProfile>,
          });
          toast.success("Manager profile updated successfully!");
        }
      } catch (error) {
        handleMutationError(error, "updating", type || "item");
      } finally {
        handleMutationFinally();
      }
    },
    [
      type,
      updateUserMutation,
      updateArtistProfileMutation,
      updateManagerProfileMutation,
      handleMutationFinally,
      selectedItem,
    ]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        if (type === "user") {
          await deleteUserMutation.mutateAsync(id);
          toast.success("User deleted successfully!");
        } else if (type === "artist") {
          await deleteArtistProfileMutation.mutateAsync(id);
          toast.success("Artist profile deleted successfully!");
        } else if (type === "manager") {
          await deleteManagerProfileMutation.mutateAsync(id);
          toast.success("Manager profile deleted successfully!");
        }
        invalidateQueries();
      } catch (error) {
        handleMutationError(error, "deleting", type || "item");
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
    ]
  );

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

  const renderTable = (
    data: any[],
    columns: { key: string; label: string }[],
    managerMapArg: Map<string, string>
  ) => {
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
            {(currentUserRole === "super_admin" ||
              (currentUserRole === "artist_manager" && type !== "artist")) && (
              <Button onClick={() => handleOpenModal(null)}>
                Create{" "}
                {type === "user"
                  ? "User"
                  : type === "artist"
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
                        ) : col.key === "is_active" ? (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(item, true)}
                          title={`Edit ${type}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item)}
                          title={`Delete ${type}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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

  if (isLoading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }

  return (
    // Removed max-w-7xl and mx-auto to allow full width
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {currentUserRole === "super_admin" && (
        <>
          {type === "user" && renderUserTable()}
          {type === "artist" && renderArtistTable()}
          {type === "manager" && renderManagerTable()}
        </>
      )}
      {currentUserRole === "artist_manager" &&
        type === "artist" &&
        renderArtistTable()}
      {currentUserRole === "artist" && <MusicList />}

      {isModalOpen && (
        <>
          {type === "manager" ? (
            <CustomModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              title={isCreating ? "Create Manager Profile" : "Update Manager Profile"}
            >
              <ManagerProfileForm
                onSubmit={
                  isCreating
                    ? handleCreate
                    : (data) => handleUpdate(data)
                }
                initialData={selectedItem as ManagerProfile | undefined}
                onCancel={handleCloseModal}
              />
            </CustomModal>
          ) : (
            <UserModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={
                isCreating
                  ? handleCreate
                  : (data) => handleUpdate(data)
              }
              initialData={selectedItem as Partial<User> | undefined}
              isCreating={isCreating}
              isUpdating={isUpdating}
              type={type}
            />
          )}
        </>
      )}
      <CustomModal
        isOpen={isDeleteDialogOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete the item."
      />
    </div>
  );
}
