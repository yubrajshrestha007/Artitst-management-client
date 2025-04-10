// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/manager-form-footer.tsx
"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ManagerFormFooterProps {
  isUpdateMode: boolean;
  isSubmitting: boolean; // Combined submit/parent loading state
  isDeleting: boolean;
  onCancel?: () => void;
  onDelete: () => void; // Delete handler passed from parent
}

export const ManagerFormFooter = ({
  isUpdateMode,
  isSubmitting,
  isDeleting,
  onCancel,
  onDelete,
}: ManagerFormFooterProps) => {
  const isDisabled = isSubmitting || isDeleting;

  return (
    <DialogFooter className="pt-4 flex flex-col sm:flex-row sm:justify-between gap-2">
      {/* Left side buttons (Cancel/Delete) */}
      <div className="flex gap-2 justify-start">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isDisabled}
          >
            Cancel
          </Button>
        )}
        {isUpdateMode && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isDisabled}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete Profile"}
          </Button>
        )}
      </div>

      {/* Right side button (Submit) */}
      <Button
        type="submit"
        disabled={isDisabled}
        className="w-full sm:w-auto"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isUpdateMode ? "Update Profile" : "Create Profile"}
      </Button>
    </DialogFooter>
  );
};
