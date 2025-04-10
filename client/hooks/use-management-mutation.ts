// /home/mint/Desktop/ArtistMgntFront/client/hooks/use-management-mutation.ts
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
type SubmitData = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile>;

interface ApiError {
    response?: {
        data?: {
            detail?: string;
            message?: string;
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
    message?: string;
}

function isApiError(error: unknown): error is ApiError {
    return typeof error === 'object' && error !== null;
}

interface MutationCallbacks {
    onSuccess?: (action: string, itemType: string) => void;
    onError?: (error: unknown, action: string, itemType: string) => void;
    onDeleteSettled?: () => void;
}

export const useManagementMutations = (
    type: ManagementType,
    callbacks?: MutationCallbacks
) => {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["managers"] });
  }, [queryClient]);

  const handleMutationError = useCallback((error: unknown, action: string, itemType: string) => {
    let backendError = 'An unknown error occurred';
    // --- Enhanced Error Parsing ---
    if (isApiError(error)) {
        const responseData = error.response?.data;
        if (responseData) {
            const fieldErrors = typeof responseData === 'object' && responseData !== null
                ? Object.entries(responseData)
                    .filter(([key]) => key !== 'detail' && key !== 'message') // Exclude generic messages
                    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                    .join('; ')
                : '';

            backendError = responseData.detail || responseData.message || fieldErrors || backendError;
            if (backendError === 'An unknown error occurred' && fieldErrors) { // Use field errors if no detail/message
                backendError = fieldErrors;
            }
        } else if (error.message) {
             backendError = error.message;
        }
    } else if (error instanceof Error) {
        backendError = error.message;
    } else if (typeof error === 'string') {
        backendError = error;
    }
    // --- End Enhanced Error Parsing ---

    toast.error(`Error ${action} ${itemType}: ${backendError}`);
    const errorDetailsToLog = isApiError(error) ? error.response?.data ?? error : error;
    console.error(`useManagementMutations: Error during ${action} ${itemType}:`, errorDetailsToLog);
    callbacks?.onError?.(error, action, itemType);
  }, [callbacks]);

  const handleMutationSuccess = useCallback((action: string, itemType: string) => {
    toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${action}d successfully!`);
    invalidateQueries();
    callbacks?.onSuccess?.(action, itemType);
  }, [invalidateQueries, callbacks]);

  // --- Mutations ---
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation(); // Ensure this is correctly configured
  const deleteUserMutation = useDeleteUserMutation();
  const createArtistProfileMutation = useCreateArtistProfileMutation();
  const updateArtistProfileMutation = useUpdateArtistProfileMutation();
  const deleteArtistProfileMutation = useDeleteArtistProfileMutation();
  const createManagerProfileMutation = useCreateManagerProfileMutation();
  const updateManagerProfileMutation = useUpdateManagerProfileMutation();
  const deleteManagerProfileMutation = useDeleteManagerProfileMutation();

  // --- Combined Create/Update Logic ---
  const submitMutation = useCallback(
    async (data: SubmitData, isCreating: boolean, selectedItemId?: string) => {
      const itemType = type || "item";
      const action = isCreating ? "create" : "update";

      console.log(`%cuseManagementMutations: Attempting ${action} for ${itemType}`, 'color: blue; font-weight: bold;', {
          id: selectedItemId,
          payload: data,
          isCreating: isCreating, // Log isCreating state
          type: type // Log type state
      });

      try {
        if (isCreating) {
          // --- Create Logic ---
          console.log(`%cuseManagementMutations: Executing CREATE path for ${type}`, 'color: green;');
          if (type === "user") await createUserMutation.mutateAsync(data as Partial<User>);
          else if (type === "artist") await createArtistProfileMutation.mutateAsync(data as Partial<ArtistProfile>);
          else if (type === "manager") await createManagerProfileMutation.mutateAsync(data as Partial<ManagerProfile>);
          else {
              console.error(`useManagementMutations: Unsupported item type for creation: ${type}`);
              throw new Error(`Unsupported item type for creation: ${type}`);
          }
        } else {
          // --- Update Logic ---
          console.log(`%cuseManagementMutations: Executing UPDATE path for ${type}`, 'color: orange;');
          if (!selectedItemId) {
              console.error("useManagementMutations: No item selected for update.");
              throw new Error("No item selected for update.");
          }

          if (type === "user") {
              console.log(`%cuseManagementMutations: Calling updateUserMutation with ID: ${selectedItemId}`, 'color: purple;');
              // Ensure the mutation hook itself is valid and imported
              if (!updateUserMutation) throw new Error("updateUserMutation is not available");
              await updateUserMutation.mutateAsync({ id: selectedItemId, data: data as Partial<User> });
          } else if (type === "artist") {
              console.log(`%cuseManagementMutations: Calling updateArtistProfileMutation with ID: ${selectedItemId}`, 'color: purple;');
              if (!updateArtistProfileMutation) throw new Error("updateArtistProfileMutation is not available");
              await updateArtistProfileMutation.mutateAsync({ id: selectedItemId, data: data as Partial<ArtistProfile> });
          } else if (type === "manager") {
              console.log(`%cuseManagementMutations: Calling updateManagerProfileMutation with ID: ${selectedItemId}`, 'color: purple;');
              if (!updateManagerProfileMutation) throw new Error("updateManagerProfileMutation is not available");
              await updateManagerProfileMutation.mutateAsync({ id: selectedItemId, data: data as Partial<ManagerProfile> });
          } else {
              console.error(`useManagementMutations: Unsupported item type for update: ${type}`);
              throw new Error(`Unsupported item type for update: ${type}`);
          }
        }
        // If mutation succeeds:
        console.log(`%cuseManagementMutations: ${action} ${itemType} successful.`, 'color: green;');
        handleMutationSuccess(action, itemType);
      } catch (error) {
        // Log error before handling/re-throwing
        console.error(`%cuseManagementMutations: Caught error during ${action} ${itemType}.`, 'color: red;', error);
        handleMutationError(error, `${action}ing`, itemType);
        // IMPORTANT: Re-throw error so the calling component (handleFormSubmit in UserManagementTable)
        // knows it failed. This prevents the form from potentially resetting prematurely.
        throw error;
      }
    },
    [
      type,
      // Ensure ALL mutation hooks used are listed here
      createUserMutation, createArtistProfileMutation, createManagerProfileMutation,
      updateUserMutation, updateArtistProfileMutation, updateManagerProfileMutation,
      handleMutationSuccess, handleMutationError // Include handlers
      // queryClient and callbacks are implicitly included if used directly in handlers
    ]
  );

  // --- Delete Logic ---
  const deleteMutation = useCallback(
    // ... (delete logic remains the same, ensure dependencies are correct) ...
    async (id: string) => {
      const itemType = type || "item";
      console.log(`useManagementMutations: Attempting delete for ${itemType} with ID: ${id}`);
      try {
        if (type === "user") await deleteUserMutation.mutateAsync(id);
        else if (type === "artist") await deleteArtistProfileMutation.mutateAsync(id);
        else if (type === "manager") await deleteManagerProfileMutation.mutateAsync(id);
        else throw new Error(`Unsupported item type for deletion: ${type}`);

        toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
        invalidateQueries();
      } catch (error) {
        console.error(`%cuseManagementMutations: Caught error during deleting ${itemType}.`, 'color: red;', error);
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
