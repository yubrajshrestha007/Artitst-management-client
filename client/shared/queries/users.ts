// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/users.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  fetchUser, // Import the new function
} from "@/shared/api/users";
import { User, UserQueryResponse } from "@/types/auth";
import Cookies from "js-cookie";
import { toast } from "sonner";

export const useUsersQuery = () => {
  const access = Cookies.get("access");
  return useQuery<UserQueryResponse, Error>({
    queryKey: ["users"],
    queryFn: () => fetchUsers(access || ""),
    enabled: !!access,
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  const access = Cookies.get("access") || "";
  return useMutation({
    mutationFn: (data: Partial<User>) => createUser(access, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  const access = Cookies.get("access") || "";
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const existingUser = await fetchUser(access, id);
      if (existingUser) {
        return updateUser(access, id, data);
      } else {
        return createUser(access, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Error updating user: ${error.message}`);
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const access = Cookies.get("access") || "";
  return useMutation({
    mutationFn: (id: string) => deleteUser(access, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
