// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/artist-profile.tsx
"use client";
import { useState, useCallback, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArtistProfile } from "@/types/auth";
import {
  artistProfileSchema,
  ArtistProfileFormValues,
  // Import default values and formatter if needed, or define locally
} from "@/schemas/auth"; // Adjust path
import { useDeleteArtistProfileMutation } from "@/shared/queries/artist-profile";
import { fetchManagers } from "@/shared/queries/manager-profile";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { ArtistFormFields } from "./artits-form"; // Import the new fields component
import { ManagerFormFooter } from "./manager-footer"; // Reuse the manager footer component

interface ArtistProfileFormProps {
  onSubmit: (data: Partial<ArtistProfile>) => Promise<void> | void;
  initialData?: ArtistProfile | null;
  currentUserId?: string | null; // Needed for create
  onCancel?: () => void;
  onDeleteSuccess?: () => void;
  isLoading?: boolean; // Loading state from parent create/update mutation
}

// Default values and formatter can be defined here or imported
const defaultValues: Partial<ArtistProfileFormValues> = {
  name: "", date_of_birth: null, gender: "", address: "",
  first_release_year: null, no_of_albums_released: 0, manager_id_id: null,
};
const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  try {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  } catch { return ""; }
};

export default function ArtistProfileForm({
  onSubmit,
  initialData,
  currentUserId,
  onCancel,
  onDeleteSuccess,
  isLoading = false,
}: ArtistProfileFormProps) {
  const queryClient = useQueryClient();
  const isUpdateMode = !!initialData?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [allManagers, setAllManagers] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [isManagerError, setIsManagerError] = useState(false);

  const form = useForm<ArtistProfileFormValues>({
    resolver: zodResolver(artistProfileSchema),
    defaultValues: initialData
      ? {
          ...defaultValues,
          ...initialData,
          // Ensure gender is one of the allowed enum values or null
          gender: ["male", "female", "other"].includes(initialData.gender || "")
            ? (initialData.gender as "male" | "female" | "other")
            : null,
          first_release_year: initialData.first_release_year ?? null,
          no_of_albums_released: initialData.no_of_albums_released ?? 0,
          date_of_birth: formatDateForInput(initialData.date_of_birth),
          manager_id_id: initialData.manager_id_id || null,
        }
      : defaultValues,
  });

  // Reset form if initialData changes
  useEffect(() => {
    const resetValues = initialData
      ? {
          ...defaultValues, ...initialData,
          // Ensure gender is one of the allowed enum values or null
          gender: ["male", "female", "other"].includes(initialData.gender || "")
            ? (initialData.gender as "male" | "female" | "other")
            : null,
          first_release_year: initialData.first_release_year ?? null,
          no_of_albums_released: initialData.no_of_albums_released ?? 0,
          date_of_birth: formatDateForInput(initialData.date_of_birth),
          manager_id_id: initialData.manager_id_id || null,
        }
      : defaultValues;
    form.reset(resetValues);
  }, [initialData, form]);

  // Delete Mutation
  const { mutate: deleteArtistProfile } = useDeleteArtistProfileMutation({
    onSuccess: () => {
      toast.success("Artist profile deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["artistProfileByUserId"] });
      setIsDeleting(false);
      onDeleteSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error deleting profile";
      toast.error(`Delete failed: ${message}`);
      setIsDeleting(false);
    },
  });

  // Fetch managers
  useEffect(() => {
    const loadManagers = async () => {
      setIsLoadingManagers(true);
      setIsManagerError(false);
      try {
        const managersResult = await fetchManagers();
        setAllManagers(
          (managersResult || [])
            .map((m) => ({ id: m.id || "", name: m.name || "Unnamed" }))
            .filter((m) => m.id)
        );
      } catch (error) { // <-- FIX: Use the error variable
        console.error("Failed to load managers:", error); // Log the error
        setIsManagerError(true);
        toast.error("Error loading managers.");
        setAllManagers([]);
      } finally {
        setIsLoadingManagers(false);
      }
    };
    loadManagers();
  }, []);

  // Form Submission Handler
  const handleFormSubmit: SubmitHandler<ArtistProfileFormValues> = async (values) => {
    if (isLoading || isDeleting) return;

    const dataToSubmit: Partial<ArtistProfile> = {
      ...values,
      gender: values.gender || null,
      address: values.address || null,
      // Ensure date is formatted correctly or null
      date_of_birth: values.date_of_birth ? new Date(values.date_of_birth).toISOString().split('T')[0] : null,
      manager_id_id: values.manager_id_id === "none" ? null : values.manager_id_id || null,
      first_release_year: values.first_release_year === null ? null : Number(values.first_release_year),
      no_of_albums_released: values.no_of_albums_released === null ? 0 : Number(values.no_of_albums_released),
    };

    if (isUpdateMode && initialData?.id) {
      dataToSubmit.id = initialData.id;
      delete dataToSubmit.user_id;
    } else if (!isUpdateMode && currentUserId) {
      dataToSubmit.user_id = currentUserId;
      delete dataToSubmit.id;
    } else if (!isUpdateMode && !currentUserId) {
      toast.error("Cannot create profile: User ID is missing.");
      return;
    }

    await onSubmit(dataToSubmit);
  };

  // Delete Handler
  const handleDelete = useCallback(() => {
    if (initialData?.id && !isDeleting && !isLoading) {
      setIsDeleting(true);
      deleteArtistProfile(initialData.id);
    }
  }, [initialData?.id, deleteArtistProfile, isDeleting, isLoading]);

  const isSubmittingCombined = form.formState.isSubmitting || isLoading;
  const isDisabled = isSubmittingCombined || isDeleting;
  // Disable submit if managers failed to load and no manager is currently assigned (relevant for create/update)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
        <ArtistFormFields
          control={form.control}
          disabled={isDisabled}
          allManagers={allManagers}
          isLoadingManagers={isLoadingManagers}
          isManagerError={isManagerError}
        />
        {/* Reuse the ManagerFormFooter component */}
        <ManagerFormFooter
          isUpdateMode={isUpdateMode}
          isSubmitting={isSubmittingCombined}
          isDeleting={isDeleting}
          onCancel={onCancel}
          onDelete={handleDelete}
        />
      </form>
    </Form>
  );
}
