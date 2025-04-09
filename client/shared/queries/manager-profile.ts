// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/manager-profile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ManagerProfile,
  UseCreateManagerProfileMutationOptions,
  UseDeleteManagerProfileMutationOptions,
  UseUpdateManagerProfileMutationOptions,
} from "@/types/auth";
import { toast } from "sonner";
import {
  fetchManagerProfile as fetchManagerProfileApi,
  createManagerProfile as createManagerProfileApi,
  updateManagerProfile as updateManagerProfileApi,
  deleteManagerProfile as deleteManagerProfileApi,
  fetchAllManagerProfiles,
} from "../api/manager-profile";
import { useInvalidateProfile } from "./profiles";
import { getRoleFromToken } from "../api/api-utils";

// Helper function for consistent error handling
const handleManagerMutationError = (error: any) => {
  const role = getRoleFromToken();
  if (role !== "artist_manager") {
    toast.error("Only manager can perform this action");
    throw new Error("Only manager can perform this action");
  }
  toast.error(error.message || "An error occurred");
  throw error; // Re-throw the error to propagate it
};

export const fetchManagers = async (): Promise<ManagerProfile[]> => {
  try {
    const response = await fetchAllManagerProfiles();
    if (Array.isArray(response)) {
      return response;
    }
    if (!response || !response.managers) {
      console.error("fetchManagers: Invalid response format:", response);
      return [];
    }
    return response.managers; // Return the array directly
  } catch (error) {
    console.error("fetchManagers error:", error);
    toast.error("Failed to fetch managers");
    throw error; // Re-throw the error to propagate it
  }
};

export const useManagerProfileQuery = (id: string) => {
  return useQuery<ManagerProfile | null, Error>({
    queryKey: ["managerProfile", id],
    queryFn: async () => {
      try {
        return await fetchManagerProfileApi(id);
      } catch (error) {
        toast.error("Failed to fetch manager profile");
        throw error; // Re-throw the error to propagate it
      }
    },
    enabled: !!id,
    retry: false,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch manager profile");
      throw error; // Re-throw the error to propagate it
    },
  });
};

export const useCreateManagerProfileMutation = ({
  onSuccess,
  onError,
}: UseCreateManagerProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { mutate: invalidateProfile } = useInvalidateProfile();
  return useMutation({
    mutationFn: createManagerProfileApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-manager-profile"] });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      invalidateProfile();
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: handleManagerMutationError,
  });
};

// Mutation hook for updating a manager profile
export const useUpdateManagerProfileMutation = ({
  onSuccess,
  onError,
}: UseUpdateManagerProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { mutate: invalidateProfile } = useInvalidateProfile();

  return useMutation({
    // *** FIX HERE ***
    // Define mutationFn as an adapter function.
    // It receives the single object { id, data } from mutate/mutateAsync.
    // It calls updateManagerProfileApi with two separate arguments: id and data.
    mutationFn: (variables: { id: string; data: Partial<ManagerProfile> }) =>
      updateManagerProfileApi(variables.id, variables.data),
    onSuccess: (data) => {
      toast.success("Manager profile updated successfully!");
      // Invalidate queries that might be affected
      queryClient.invalidateQueries({ queryKey: ["managerProfile", data.id] }); // Invalidate the specific profile
      queryClient.invalidateQueries({ queryKey: ["my-manager-profile"] }); // Invalidate current user's profile if applicable
      queryClient.invalidateQueries({ queryKey: ["managers"] }); // Invalidate the list of managers
      invalidateProfile(); // Invalidate generic profile state if used
      if (onSuccess) {
        onSuccess(data); // Call the callback passed from the component
      }
    },
    onError: (error) => {
      handleManagerMutationError(error); // Use the shared error handler
      if (onError) {
        onError(error); // Call the callback passed from the component
      }
    },
  });
};

export const useDeleteManagerProfileMutation = ({
  onSuccess,
  onError,
}: UseDeleteManagerProfileMutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { mutate: invalidateProfile } = useInvalidateProfile();
  return useMutation({
    mutationFn: deleteManagerProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-manager-profile"] });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      invalidateProfile();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: handleManagerMutationError,
  });
};

export const useManagersQuery = () => {
  return useQuery<ManagerProfile[], Error>({
    queryKey: ["managers"],
    queryFn: fetchManagers,
    retry: false,
    onError: (error) => {
      console.error("Error fetching managers:", error);
      toast.error(error.message || "Failed to fetch managers");
      throw error;
    },
  });
};
export { ManagerProfile };
