// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-table.tsx
"use client";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "@/shared/queries/users";
import { useState, useEffect, useCallback } from "react";
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
  useManagersQuery, // Import the new query
} from "@/shared/queries/manager-profile";

interface UserManagementTableProps {
  currentUserRole: string;
  type?: "user" | "artist" | "manager";
}

// Define types for the data expected by each mutation
type CreateData = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;
type UpdateData = { id: string; data: Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile> };

export default function UserManagementTable({
  currentUserRole,
  type,
}: UserManagementTableProps) {
  const queryClient = useQueryClient();
  const { data: usersData, isLoading: isUsersLoading } = useUsersQuery();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const { data: artistProfileData, isLoading: isArtistProfilesLoading } =
    useArtistProfileListQuery();
  const artistProfiles = artistProfileData || [];

  const createArtistProfileMutation = useCreateArtistProfileMutation();
  const updateArtistProfileMutation = useUpdateArtistProfileMutation();
  const deleteArtistProfileMutation = useDeleteArtistProfileMutation();

  const {
    data: managerProfileData,
    isLoading: isManagerProfilesLoading,
  } = useManagersQuery(); // Use the new query
  const managerProfiles = managerProfileData || [];

  const createManagerProfileMutation = useCreateManagerProfileMutation();
  const updateManagerProfileMutation = useUpdateManagerProfileMutation();
  const deleteManagerProfileMutation = useDeleteManagerProfileMutation();

  const users = usersData?.users || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    User | ArtistProfile | ManagerProfile | null
  >(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Combine loading states
  const isLoading = isUsersLoading || isArtistProfilesLoading || isManagerProfilesLoading;

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["managers"] });
  }, [queryClient]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Helper function for common mutation error handling
  const handleMutationError = (error: any, action: string, itemType: string) => {
    toast.error(`Error ${action} ${itemType}: ${error.message}`);
  };

  // Helper function for common mutation finally block
  const handleMutationFinally = () => {
    setIsCreating(false);
    setIsUpdating(false);
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleCreate = useCallback(
    async (data: CreateData) => {
      setIsCreating(true);
      try {
        if (type === "user") {
          await createUserMutation.mutateAsync(data as Partial<User>);
          toast.success("User created successfully!");
        } else if (type === "artist") {
          await createArtistProfileMutation.mutateAsync(data as Partial<ArtistProfile>);
          toast.success("Artist profile created successfully!");
        } else if (type === "manager") {
          await createManagerProfileMutation.mutateAsync(data as Partial<ManagerProfile>);
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
    ]
  );

  const handleUpdate = useCallback(
    async (id: string, data: UpdateData["data"]) => {
      setIsUpdating(true);
      try {
        if (type === "user") {
          await updateUserMutation.mutateAsync({ id, data: data as Partial<User> });
          toast.success("User updated successfully!");
        } else if (type === "artist") {
          await updateArtistProfileMutation.mutateAsync({ id, data: data as Partial<ArtistProfile> });
          toast.success("Artist profile updated successfully!");
        } else if (type === "manager") {
          await updateManagerProfileMutation.mutateAsync({ id, data: data as Partial<ManagerProfile> });
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
    if (selectedItem) {
      handleDelete(selectedItem.id);
    }
  }, [handleDelete, selectedItem]);

  const cancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Helper functions to render each type of table
  const renderUserTable = () => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "is_active", label: "Status" },
    ];
    return renderTable(filteredUsers, columns);
  };

  const renderArtistTable = () => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "gender", label: "Gender" },
      { key: "address", label: "Address" },
      { key: "date_of_birth", label: "Date of Birth" },
      { key: "first_release_year", label: "First Release Year" },
      { key: "no_of_albums_released", label: "Number of Albums Released" },
    ];
    return renderTable(artistProfiles, columns);
  };

  const renderManagerTable = () => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "company_name", label: "Company Name" },
      { key: "company_email", label: "Company Email" },
      { key: "company_phone", label: "Company Phone" },
    ];
    return renderTable(managerProfiles, columns);
  };

  // Helper function to render the table
  const renderTable = (data: any[], columns: any[]) => {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2>
            {type === "user"
              ? "User List"
              : type === "artist"
                ? "Artist Profiles"
                : "Manager Profiles"}
          </h2>
          <div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
            {currentUserRole !== "artist_manager" && (
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
            {data.map((item, index) => (
              <TableRow key={item.id}>
                {columns.map((col) => (
                  <TableCell key={`${item.id}-${col.key}`}>
                    {col.key === "is_active" ? (
                      item.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )
                    ) : (
                      item[col.key]
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(item, true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  };

  return (
    <>
      {currentUserRole === "super_admin" && (
        <>
          {type === "user" && renderUserTable()}
          {type === "artist" && renderArtistTable()}
          {type === "manager" && renderManagerTable()}
        </>
      )}
      {currentUserRole === "artist_manager" && type === "artist" && renderArtistTable()}
      {currentUserRole === "artist" && <MusicList />}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreate}
        initialData={selectedItem}
        isCreating={isCreating}
        isUpdating={isUpdating}
        type={type}
      />
      <CustomModal
        isOpen={isDeleteDialogOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete the item."
      />
    </>
  );
}
