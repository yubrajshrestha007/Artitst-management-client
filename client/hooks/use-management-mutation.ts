// /home/mint/Desktop/ArtistMgntFront/client/hooks/useManagementMutations.ts
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/shared/queries/users";
import {
  useCreateArtistProfileMutation,
  useDeleteArtistProfileMutation,
  useUpdateArtistProfileMutation,
} from "@/shared/queries/artist-profile";
import {
  useCreateManagerProfileMutation,
  useDeleteManagerProfileMutation,
  useUpdateManagerProfileMutation,
} from "@/shared/queries/manager-profile";
import { User, ArtistProfile, ManagerProfile } from "@/types/auth";

type ManagementType = "user" | "artist" | "manager" | undefined;
type DataItem = User | ArtistProfile | ManagerProfile;
type CreateData = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;
type UpdateDataInput = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;

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

interface MutationCallbacks {
    onSuccess?: (action: string, itemType: string) => void;
    onError?: (error: unknown, action: string, itemType: string) => void;
    onDeleteSettled?: () => void; // Specific callback after delete finishes
}

export const useManagementMutations = (
    type: ManagementType,
    callbacks?: MutationCallbacks
) => {
  const queryClient = useQueryClient();

  // --- Invalidation ---
  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["managers"] });
  }, [queryClient]);

  // --- Default Handlers ---
  const handleMutationError = useCallback((error: unknown, action: string, itemType: string) => {
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
    callbacks?.onError?.(error, action, itemType);
  }, [callbacks]);

  const handleMutationSuccess = useCallback((action: string, itemType: string) => {
    toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${action}d successfully!`);
    invalidateQueries();
    callbacks?.onSuccess?.(action, itemType);
  }, [invalidateQueries, callbacks]);

  // --- Mutations ---
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const createArtistProfileMutation = useCreateArtistProfileMutation();
  const updateArtistProfileMutation = useUpdateArtistProfileMutation();
  const deleteArtistProfileMutation = useDeleteArtistProfileMutation();
  const createManagerProfileMutation = useCreateManagerProfileMutation();
  const updateManagerProfileMutation = useUpdateManagerProfileMutation();
  const deleteManagerProfileMutation = useDeleteManagerProfileMutation();

  // --- Combined Mutation Logic ---
  const submitMutation = useCallback(
    async (data: CreateData | UpdateDataInput, isCreating: boolean, selectedItemId?: string) => {
      const itemType = type || "item";
      const action = isCreating ? "create" : "update";

      try {
        if (isCreating) {
          if (type === "user") await createUserMutation.mutateAsync(data as Partial<User>);
          else if (type === "artist") await createArtistProfileMutation.mutateAsync(data as Partial<ArtistProfile>);
          else if (type === "manager") await createManagerProfileMutation.mutateAsync(data as Partial<ManagerProfile>);
        } else { // Updating
          if (!selectedItemId) throw new Error("No item selected for update.");
          if (type === "user") await updateUserMutation.mutateAsync({ id: selectedItemId, data: data as Partial<User> });
          else if (type === "artist") await updateArtistProfileMutation.mutateAsync({ id: selectedItemId, data: data as Partial<ArtistProfile> });
          else if (type === "manager") await updateManagerProfileMutation.mutateAsync({ id: selectedItemId, data: data as Partial<ManagerProfile> });
        }
        handleMutationSuccess(action, itemType);
      } catch (error) {
        handleMutationError(error, `${action}ing`, itemType);
        // Re-throw error if parent needs to handle it further (e.g., keep modal open)
        throw error;
      }
    },
    [
      type,
      createUserMutation, createArtistProfileMutation, createManagerProfileMutation,
      updateUserMutation, updateArtistProfileMutation, updateManagerProfileMutation,
      handleMutationSuccess, handleMutationError
    ]
  );

  const deleteMutation = useCallback(
    async (id: string) => {
      const itemType = type || "item";
      try {
        if (type === "user") await deleteUserMutation.mutateAsync(id);
        else if (type === "artist") await deleteArtistProfileMutation.mutateAsync(id);
        else if (type === "manager") await deleteManagerProfileMutation.mutateAsync(id);
        toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
        invalidateQueries();
      } catch (error) {
        handleMutationError(error, "deleting", itemType);
      } finally {
        callbacks?.onDeleteSettled?.();
      }
    },
    [
      type,
      deleteUserMutation, deleteArtistProfileMutation, deleteManagerProfileMutation,
      invalidateQueries, handleMutationError, callbacks
    ]
  );

  // --- Loading States ---
  const isLoadingCreate = createUserMutation.isPending || createArtistProfileMutation.isPending || createManagerProfileMutation.isPending;
  const isLoadingUpdate = updateUserMutation.isPending || updateArtistProfileMutation.isPending || updateManagerProfileMutation.isPending;
  const isLoadingDelete = deleteUserMutation.isPending || deleteArtistProfileMutation.isPending || deleteManagerProfileMutation.isPending;
  const isMutating = isLoadingCreate || isLoadingUpdate || isLoadingDelete;

  return {
    submitMutation,
    deleteMutation,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    isMutating,
  };
};
