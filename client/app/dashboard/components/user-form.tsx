// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-form-fields.tsx
"use client";

import { Control } from "react-hook-form";
import { z } from "zod";
import {
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
import { Switch } from "@/components/ui/switch";
import { DialogDescription } from "@/components/ui/dialog"; // Import if needed for Switch description

// Assuming userSchema is defined elsewhere and imported if needed
// Or define a specific type for the form values used here
interface UserFormFieldsProps {
  control: Control<any>; // Use specific type if available, e.g., Control<UserFormValues>
  isCreating?: boolean;
  isUpdating?: boolean; // Useful for readOnly fields
  disabled?: boolean;
}

export const UserFormFields = ({
  control,
  isCreating,
  isUpdating,
  disabled = false,
}: UserFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* Email Field */}
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                placeholder="user@example.com"
                {...field}
                readOnly={isUpdating} // Email typically not editable
                className={isUpdating ? "bg-gray-100 cursor-not-allowed" : ""}
                required={isCreating}
                disabled={disabled}
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
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    required
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    required
                    disabled={disabled}
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
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || ""}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="artist_manager">Artist Manager</SelectItem>
                <SelectItem value="artist">Artist</SelectItem>
                {/* <SelectItem value="super_admin">Super Admin</SelectItem> */}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Active Status Field */}
      <FormField
        control={control}
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
                disabled={disabled}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
