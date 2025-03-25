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
} from "@/shared/api/users";
import { User, UserQueryResponse } from "@/types/auth";
import Cookies from "js-cookie";

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
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      updateUser(access, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
