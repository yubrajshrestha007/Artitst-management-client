// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/artist-profile.tsx
"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArtistProfile } from "@/types/auth"; // Assuming ArtistProfile type is here
import { artistProfileSchema, ArtistProfileFormValues } from "@/schemas/auth"; // Adjust path if needed
import { useDeleteArtistProfileMutation } from "@/shared/queries/artist-profile";
import { fetchManagers } from "@/shared/queries/manager-profile";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog"; // Import DialogFooter for layout

interface ArtistProfileFormProps {
  onSubmit: (data: Partial<ArtistProfile>) => Promise<void> | void; // Allow async onSubmit
  initialData?: ArtistProfile | null;
  currentUserId?: string | null; // Needed for create
  onCancel?: () => void;
  onDeleteSuccess?: () => void;
  isLoading?: boolean; // Loading state from parent create/update mutation
}

// Default values for the form
const defaultValues: Partial<ArtistProfileFormValues> = {
  name: "",
  date_of_birth: null,
  gender: "", // Use empty string for default select state
  address: "",
  first_release_year: null,
  no_of_albums_released: 0,
  manager_id_id: null,
};

// Helper to format date for input type="date"
const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch (e) {
    return ""; // Return empty if date is invalid
  }
};

export default function ArtistProfileForm({
  onSubmit,
  initialData,
  currentUserId,
  onCancel,
  onDeleteSuccess,
  isLoading = false, // Default parent loading state
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
          // Ensure numeric fields are numbers or null
          first_release_year: initialData.first_release_year ?? null,
          no_of_albums_released: initialData.no_of_albums_released ?? 0,
          // Format date for input
          date_of_birth: formatDateForInput(initialData.date_of_birth),
          // Ensure manager_id_id is string or null
          manager_id_id: initialData.manager_id_id || null,
        }
      : defaultValues,
  });

  // Reset form if initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...defaultValues,
        ...initialData,
        first_release_year: initialData.first_release_year ?? null,
        no_of_albums_released: initialData.no_of_albums_released ?? 0,
        date_of_birth: formatDateForInput(initialData.date_of_birth),
        manager_id_id: initialData.manager_id_id || null,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [initialData, form]);

  // Delete Mutation
  const { mutate: deleteArtistProfile } = useDeleteArtistProfileMutation({
    onSuccess: () => {
      toast.success("Artist profile deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["artist-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["artistProfileByUserId"] }); // Invalidate specific user profile queries too
      setIsDeleting(false);
      onDeleteSuccess?.(); // Call parent callback
    },
    onError: (error: any) => {
      toast.error(`Error deleting artist profile: ${error.message}`);
      setIsDeleting(false);
    },
  });

  // Fetch managers
  useEffect(() => {
    const loadManagers = async () => {
      setIsLoadingManagers(true);
      setIsManagerError(false);
      try {
        const managersResult = await fetchManagers(); // Assuming fetchManagers is correctly implemented
        if (managersResult && Array.isArray(managersResult)) {
          setAllManagers(
            managersResult
              .map((manager) => ({
                id: manager.id || "",
                name: manager.name || "Unnamed Manager",
              }))
              .filter((manager) => manager.id)
          );
        } else {
          setAllManagers([]);
        }
      } catch (error) {
        setIsManagerError(true);
        toast.error("Error loading managers.");
        console.error("Manager fetch error:", error);
        setAllManagers([]);
      } finally {
        setIsLoadingManagers(false);
      }
    };
    loadManagers();
  }, []); // Fetch only once

  // Form Submission Handler
  const handleFormSubmit = async (values: ArtistProfileFormValues) => {
    if (isLoading || isDeleting) return; // Prevent submission during other actions

    // Prepare data: Convert empty strings back to null, ensure numbers are numbers
    const dataToSubmit: Partial<ArtistProfile> = {
      ...values,
      gender: values.gender || null,
      address: values.address || null,
      date_of_birth: values.date_of_birth || null,
      manager_id_id: values.manager_id_id || null,
      // Ensure numeric fields are numbers or null
      first_release_year: values.first_release_year === null ? null : Number(values.first_release_year),
      no_of_albums_released: values.no_of_albums_released === null ? 0 : Number(values.no_of_albums_released),
    };

    if (isUpdateMode && initialData?.id) {
      dataToSubmit.id = initialData.id; // Add id for update
      delete dataToSubmit.user_id; // Don't send user_id on update
    } else if (!isUpdateMode && currentUserId) {
      dataToSubmit.user_id = currentUserId; // Add user_id for create
      delete dataToSubmit.id; // Ensure no id on create
    } else if (!isUpdateMode && !currentUserId) {
        toast.error("Cannot create profile: User ID is missing.");
        return; // Stop submission if user ID is missing for creation
    }

    console.log("Submitting Artist Profile:", dataToSubmit);
    await onSubmit(dataToSubmit); // Call parent onSubmit
  };

  // Delete Handler
  const handleDelete = useCallback(async () => {
    const idToDelete = initialData?.id;
    if (idToDelete && !isDeleting && !isLoading) {
      setIsDeleting(true);
      deleteArtistProfile(idToDelete);
    } else if (!idToDelete) {
      toast.error("No profile ID found to delete.");
    }
  }, [initialData?.id, deleteArtistProfile, isDeleting, isLoading]);

  // Get current manager name for display (only in update mode)
  const currentManagerName = useMemo(() => {
    if (!isUpdateMode || !initialData?.manager_id_id || !allManagers.length) return null;
    const manager = allManagers.find((m) => m.id === initialData.manager_id_id);
    return manager ? manager.name : "Manager Not Found";
  }, [isUpdateMode, initialData?.manager_id_id, allManagers]);

  return (
    <Form {...form}>
      {/* Add py-4 for padding consistent with other forms */}
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Artist Name" {...field} disabled={isLoading || isDeleting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth */}
        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                {/* Use field.value ?? '' to handle potential null value */}
                <Input type="date" {...field} value={field.value ?? ''} disabled={isLoading || isDeleting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""} // Handle null/undefined for Select value
                disabled={isLoading || isDeleting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Music Lane" {...field} value={field.value ?? ''} disabled={isLoading || isDeleting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* First Release Year */}
        <FormField
          control={form.control}
          name="first_release_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Release Year</FormLabel>
              <FormControl>
                 {/* Handle null for number input */}
                <Input
                    type="number"
                    placeholder="e.g., 2020"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    min="1900"
                    max={new Date().getFullYear()}
                    disabled={isLoading || isDeleting}
                 />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* No. of Albums Released */}
        <FormField
          control={form.control}
          name="no_of_albums_released"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. of Albums Released</FormLabel>
              <FormControl>
                <Input
                    type="number"
                    placeholder="e.g., 5"
                    {...field}
                    value={field.value ?? 0} // Default to 0 if null/undefined
                    onChange={e => field.onChange(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
                    min="0"
                    disabled={isLoading || isDeleting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Manager Section */}
        <FormField
          control={form.control}
          name="manager_id_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manager</FormLabel>
              {isLoadingManagers ? (
                 <div className="text-sm text-gray-500">Loading managers...</div>
              ) : isManagerError ? (
                 <div className="text-sm text-red-500 p-2 border border-red-300 rounded-md bg-red-50">
                    Error loading managers. Cannot assign manager.
                 </div>
              ) : isUpdateMode && currentManagerName ? ( // In update mode, show current manager if exists
                 <div className="p-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-800">
                    {currentManagerName}
                    {/* Add a button to allow changing manager if needed */}
                    {/* <Button type="button" variant="link" size="sm" onClick={() => form.setValue('manager_id_id', null)}>Change</Button> */}
                 </div>
              ) : ( // In create mode, or update mode if no manager assigned, show Select
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={isLoading || isDeleting || isLoadingManagers}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a manager (Optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No Manager</SelectItem> {/* Explicit option for no manager */}
                    {allManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Footer with Buttons */}
        <DialogFooter className="pt-4">
          {/* Left side buttons (Cancel/Delete) */}
          <div className="flex gap-2 mr-auto"> {/* Push left */}
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isDeleting}
              >
                Cancel
              </Button>
            )}
            {isUpdateMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete Profile"}
              </Button>
            )}
          </div>

          {/* Right side button (Submit) */}
          <Button
            type="submit"
            disabled={isLoading || isDeleting || form.formState.isSubmitting || (isManagerError && !currentManagerName)} // Disable if managers failed and none assigned
          >
            {(isLoading || form.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdateMode ? "Update Profile" : "Create Profile"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
