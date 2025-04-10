// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-modal.tsx
"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/schemas/auth"; // Assuming full userSchema is here
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useEffect } from "react";
import { UserFormFields } from "./user-form"; // Import fields component
import { UserFormFooter } from "./user-footer"; // Import footer component

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
  initialData?: Partial<User>;
  isCreating?: boolean;
  isUpdating?: boolean;
  isLoading?: boolean; // Parent loading state
}

// Schema logic remains the same
const getUserSchema = (isCreating?: boolean) => {
  if (isCreating) {
    return userSchema;
  }
  // When updating, omit password validation
  return userSchema.omit({ password: true, confirm_password: true });
};

// Define the specific form values type based on the schema
type UserFormValues = z.infer<ReturnType<typeof getUserSchema>>;

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isCreating,
  isUpdating,
  isLoading: isParentLoading = false, // Default parent loading state
}: UserModalProps) {
  const currentSchema = getUserSchema(isCreating);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      email: "",
      ...(isCreating && { password: "", confirm_password: "" }),
      role: "artist",
      is_active: false,
      ...initialData,
    },
  });

  // Reset form when initialData or mode changes
  useEffect(() => {
    const defaultVals = {
      email: "",
      ...(isCreating && { password: "", confirm_password: "" }),
      role: "artist",
      is_active: false,
      ...initialData,
    };
    form.reset(defaultVals);
  }, [initialData, isCreating, form]);

  const handleFormSubmit = (values: UserFormValues) => {
    // Prevent submission if parent is loading or form is submitting
    if (isParentLoading || form.formState.isSubmitting) return;
    console.log("UserModal submitting:", values);
    onSubmit(values);
  };

  // Combine parent loading state with internal form submitting state
  const isLoadingCombined = isParentLoading || form.formState.isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isCreating ? "Create User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Enter the details for the new user."
              : "Edit the user's information."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <UserFormFields
              control={form.control}
              isCreating={isCreating}
              isUpdating={isUpdating}
              disabled={isLoadingCombined} // Pass combined loading state
            />
            <UserFormFooter
              onCancel={onClose}
              isLoading={isLoadingCombined} // Pass combined loading state
              isUpdating={isUpdating}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
