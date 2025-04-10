// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-form-footer.tsx
"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface UserFormFooterProps {
  onCancel: () => void;
  isLoading: boolean; // Combined loading state (parent + form submitting)
  isUpdating?: boolean;
}

export const UserFormFooter = ({
  onCancel,
  isLoading,
  isUpdating,
}: UserFormFooterProps) => {
  // Log the loading state right before rendering the button
  console.log(`%cUserFormFooter: isLoading prop = ${isLoading}`, 'color: gray;');

  return (
    <DialogFooter className="pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isUpdating ? "Update User" : "Create User"}
      </Button>
    </DialogFooter>
  );
};
