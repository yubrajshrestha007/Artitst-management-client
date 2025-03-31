// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-management-table.tsx
"use client";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "@/shared/queries/users";
import { useState, useEffect } from "react";
import UserModal from "./user-modal";
import { User } from "@/types/auth";
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

interface UserManagementTableProps {
  currentUserRole: string;
}

export default function UserManagementTable({
  currentUserRole,
}: UserManagementTableProps) {
  const queryClient = useQueryClient();
  const { data: usersData } = useUsersQuery();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const users = usersData?.users || [];

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<Partial<User> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  const invalidateUsersQuery = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter((user) => {
      return user.email.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleCreateUser = (data: Partial<User>) => {
    if (editUser) {
      updateUserMutation.mutate(
        { id: editUser.id, data },
        {
          onSuccess: () => {
            toast.success("User updated successfully!");
            invalidateUsersQuery();
          },
          onError: (error) => {
            toast.error(`Error updating user: ${error.message}`);
          },
        }
      );
    } else {
      createUserMutation.mutate(data, {
        onSuccess: () => {
          toast.success("User created successfully!");
          invalidateUsersQuery();
        },
        onError: (error) => {
          toast.error(`Error creating user: ${error.message}`);
        },
      });
    }
    setIsUserModalOpen(false);
    setEditUser(null);
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setIsUserModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUserModalOpen(false);
    setEditUser(null);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id.toString(), {
        onSuccess: () => {
          toast.success("User deleted successfully!");
          invalidateUsersQuery();
        },
        onError: (error) => {
          toast.error(`Error deleting user: ${error.message}`);
        },
      });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  const handleOpenCreateUserModal = () => {
    setEditUser(null);
    setIsUserModalOpen(true);
  };

  return (
    <>
      {currentUserRole === "super_admin" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">User List</h2>
            <div className="flex items-center gap-4">
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
              <Button onClick={handleOpenCreateUserModal}>Create User</Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Inactive
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Container for buttons */}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user)}
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
      )}

      {currentUserRole === "artist_manager" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Artist Manager Dashboard
            </h2>
            <div className="flex items-center gap-4">
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
              <Button onClick={handleOpenCreateUserModal}>Create Artist</Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.N.</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers
                .filter((user) => user.role === "artist")
                .map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Inactive
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Container for buttons */}
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user)}
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
      )}

      {currentUserRole === "artist" && <p>Welcome, Artist!</p>}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateUser}
        initialData={editUser || undefined}
      />
      <CustomModal
        isOpen={isDeleteDialogOpen}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete the user."
      />
    </>
  );
}
