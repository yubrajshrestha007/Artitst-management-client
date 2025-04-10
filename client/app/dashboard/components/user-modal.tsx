// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-modal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/auth";
import UserForm from "./user-form";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
  initialData?: Partial<User>;
}

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: UserModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit User" : "Create User"}
          </DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <UserForm onSubmit={onSubmit} initialData={initialData} />
      </DialogContent>
    </Dialog>
  );
}
