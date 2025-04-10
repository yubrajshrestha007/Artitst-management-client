// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/artist-form-fields.tsx
"use client";

import { Control } from "react-hook-form";
import { ArtistProfileFormValues } from "@/schemas/auth"; // Adjust path
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

interface ArtistFormFieldsProps {
  control: Control<ArtistProfileFormValues>;
  disabled?: boolean;
  allManagers: { id: string; name: string }[];
  isLoadingManagers: boolean;
  isManagerError: boolean;
  // No need for currentManagerName here, logic stays in parent or handled by Select value
}

export const ArtistFormFields = ({
  control,
  disabled = false,
  allManagers,
  isLoadingManagers,
  isManagerError,
}: ArtistFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* Name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Artist Name" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date of Birth */}
      <FormField
        control={control}
        name="date_of_birth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={field.value ?? ''} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Gender */}
      <FormField
        control={control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gender</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? ""}
              disabled={disabled}
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
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Music Lane" {...field} value={field.value ?? ''} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* First Release Year */}
      <FormField
        control={control}
        name="first_release_year"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Release Year</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g., 2020"
                {...field}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                min="1900"
                max={new Date().getFullYear()}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* No. of Albums Released */}
      <FormField
        control={control}
        name="no_of_albums_released"
        render={({ field }) => (
          <FormItem>
            <FormLabel>No. of Albums Released</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g., 5"
                {...field}
                value={field.value ?? 0}
                onChange={e => field.onChange(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
                min="0"
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Manager Section */}
      <FormField
        control={control}
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
            ) : (
              <Select
                onValueChange={field.onChange}
                value={field.value === null ? "" : field.value} // Map null to "" for placeholder
                disabled={disabled || isLoadingManagers}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager (Optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No Manager</SelectItem>
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
    </div>
  );
};
