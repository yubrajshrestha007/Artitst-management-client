// /home/mint/Desktop/ArtistMgntFront/client/components/ui/custom-modal.tsx
import * as React from "react"; // Import React
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Import Loader icon
import { cn } from "@/lib/utils"; // Import cn utility

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode; // Make children optional for rendering content directly
  description?: string; // Make description optional
  onConfirm?: () => void; // Make onConfirm optional
  confirmText?: string;
  cancelText?: string;
  isConfirmLoading?: boolean; // Add loading state for confirm button
  className?: string; // Allow passing custom class for DialogContent
}

export function CustomModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children, // Destructure children
  confirmText = "Confirm", // Default confirm text changed
  cancelText = "Cancel",
  isConfirmLoading = false, // Default loading state
  className, // Destructure className
}: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Apply custom className if provided */}
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {/* Render description only if provided AND children are not */}
          {description && !children && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Render children if provided */}
        {children}

        {/* Render footer with confirm/cancel ONLY if onConfirm is provided */}
        {onConfirm && (
          <DialogFooter className="sm:justify-end pt-4"> {/* Added padding-top */}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isConfirmLoading} // Disable cancel during loading
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              // Use destructive variant only if confirmText implies deletion, otherwise default
              variant={confirmText?.toLowerCase().includes("delete") ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={isConfirmLoading} // Disable confirm during loading
            >
              {isConfirmLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </DialogFooter>
        )}
        {/* If children are provided, it's assumed they contain their own action buttons */}

      </DialogContent>
    </Dialog>
  );
}
