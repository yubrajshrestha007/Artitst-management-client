// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/manager-profile.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ManagerProfile } from "@/types/auth";
import {
  managerProfileSchema,
  ManagerProfileFormValues,
  managerProfileDefaultValues,
  formatDateForInput,
} from "@/schemas/auth"; // Adjust path
import { useDeleteManagerProfileMutation } from "@/shared/queries/manager-profile";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { ManagerFormFields } from "./manager-form"; // Corrected import path
import { ManagerFormFooter } from "./manager-footer"; // Corrected import path

interface ManagerProfileFormProps {
  onSubmit: (data: Partial<ManagerProfile>) => Promise<void> | void;
  initialData?: ManagerProfile | null;
  onCancel?: () => void;
  isLoading?: boolean; // Loading state from parent create/update mutation
}

export default function ManagerProfileForm({
  onSubmit,
  initialData,
  onCancel,
  isLoading = false,
}: ManagerProfileFormProps) {
  const queryClient = useQueryClient();
  const isUpdateMode = !!initialData?.id;
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ManagerProfileFormValues>({
    resolver: zodResolver(managerProfileSchema),
    defaultValues: initialData
      ? {
          ...managerProfileDefaultValues,
          ...initialData,
          date_of_birth: formatDateForInput(initialData.date_of_birth),
          gender: initialData.gender || null,
          address: initialData.address || null,
        }
      : managerProfileDefaultValues,
  });

  // Reset form if initialData changes
  useEffect(() => {
    const resetValues = initialData
      ? {
          ...managerProfileDefaultValues,
          ...initialData,
          date_of_birth: formatDateForInput(initialData.date_of_birth),
          gender: initialData.gender || null,
          address: initialData.address || null,
        }
      : managerProfileDefaultValues;
    form.reset(resetValues);
  }, [initialData, form]);

  // Delete Mutation
  const { mutate: deleteManagerProfile } = useDeleteManagerProfileMutation({
    onSuccess: () => {
      toast.success("Manager profile deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      setIsDeleting(false);
      onCancel?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error deleting profile";
      toast.error(message);
      setIsDeleting(false);
    },
  });

  // Form Submission Handler
  const handleFormSubmit: SubmitHandler<ManagerProfileFormValues> = async (values) => {
    if (isLoading || isDeleting) return;

    // Start building the payload, initially excluding date_of_birth
    const dataToSubmit: Partial<ManagerProfile> = {
      name: values.name,
      company_name: values.company_name,
      company_email: values.company_email,
      company_phone: values.company_phone,
      gender: values.gender || null,
      address: values.address || null,
      // date_of_birth is handled below
    };

    // --- FIX: Conditionally add date_of_birth only if it's a non-empty string ---
    if (values.date_of_birth && values.date_of_birth.trim() !== "") {
      // Ensure it's in YYYY-MM-DD format (input type="date" should guarantee this)
      dataToSubmit.date_of_birth = values.date_of_birth;
    }

    if (isUpdateMode && initialData?.id) {
      dataToSubmit.id = initialData.id; // Add id for update
      delete dataToSubmit.user_id; // Don't send user_id on update
    } else if (!isUpdateMode) {
      delete dataToSubmit.id; // Ensure no id on create
      delete dataToSubmit.user_id; // user_id usually linked separately
    }

    // --- Add console log before submitting ---
    // --- End console log ---

    await onSubmit(dataToSubmit); // Call parent onSubmit
  };

  // Delete Handler
  const handleDelete = useCallback(() => {
    if (initialData?.id && !isDeleting && !isLoading) {
      setIsDeleting(true);
      deleteManagerProfile(initialData.id);
    }
  }, [initialData?.id, deleteManagerProfile, isDeleting, isLoading]);

  const isSubmittingCombined = form.formState.isSubmitting || isLoading;
  const isDisabled = isSubmittingCombined || isDeleting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
        <ManagerFormFields control={form.control} disabled={isDisabled} />
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
