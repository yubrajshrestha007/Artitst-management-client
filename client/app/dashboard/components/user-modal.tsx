// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-modal.tsx
"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/types/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/schemas/auth";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react"; // Import Loader icon

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
  initialData?: Partial<User>;
  isCreating?: boolean;
  isUpdating?: boolean;
  isLoading?: boolean; // <-- Add prop for external loading state
  // type?: "user" | "artist" | "manager"; // <-- Removed unused type prop
}

// Schema remains the same
const getUserSchema = (isCreating?: boolean) => {
  if (isCreating) {
    return userSchema;
  }
  // When updating, password is not required and shouldn't be validated unless provided
  // We omit it here, but the backend should handle partial updates correctly
  return userSchema.omit({ password: true, confirm_password: true });
};

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isCreating,
  isUpdating,
  isLoading, // <-- Destructure the new prop
}: UserModalProps) {
  const currentSchema = getUserSchema(isCreating);

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    // Set default values, ensuring role and is_active have fallbacks
    defaultValues: {
      email: "",
      ...(isCreating && { password: "", confirm_password: "" }),
      role: "artist", // Default role, adjust if needed
      is_active: false,
      ...initialData, // Spread initialData last to override defaults
    },
  });

  // Reset form when initialData or mode changes
  useEffect(() => {
    const defaultVals = {
      email: "",
      ...(isCreating && { password: "", confirm_password: "" }),
      role: "artist", // Ensure default role is consistent
      is_active: false,
      ...initialData, // Spread initialData to populate the form for editing
    };
    // Use form.reset to update form values and reset validation state
    form.reset(defaultVals);
  }, [initialData, isCreating, form]); // Dependencies are correct

  const handleFormSubmit = (values: z.infer<typeof currentSchema>) => {
    // Prevent submission if the parent component indicates loading
    if (isLoading) return;
    console.log("UserModal submitting:", values);
    onSubmit(values);
  };

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
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="user@example.com"
                      {...field}
                      // Email should generally not be editable after creation
                      readOnly={isUpdating}
                      className={isUpdating ? "bg-gray-100 cursor-not-allowed" : ""}
                      // Ensure email is required for creation
                      required={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Fields (only on create) */}
            {isCreating && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          required // Password is required on creation
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          required // Confirm password is required on creation
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Role Field */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  {/* Use Select component for role selection */}
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""} // Ensure value is not null/undefined for Select
                    disabled={isLoading} // Disable during loading
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="artist_manager">
                        Artist Manager
                      </SelectItem>
                      <SelectItem value="artist">Artist</SelectItem>
                      {/* Add super_admin if needed, but usually not assigned this way */}
                      {/* <SelectItem value="super_admin">Super Admin</SelectItem> */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status Field */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <DialogDescription>
                      Inactive users cannot log in.
                    </DialogDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Active Status"
                      disabled={isLoading} // Disable switch while loading
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Footer Buttons */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading} // Disable Cancel button during loading
              >
                Cancel
              </Button>
              <Button
                type="submit"
                // Disable button if form is submitting internally OR if parent indicates loading
                disabled={isLoading || form.formState.isSubmitting}
              >
                {/* Show loader icon when parent indicates loading */}
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUpdating ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
