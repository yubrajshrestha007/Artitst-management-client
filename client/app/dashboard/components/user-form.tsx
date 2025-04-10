// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-form.tsx
import { User } from "@/types/auth";
import { useEffect, useState } from "react";
import { useUsersQuery } from "@/shared/queries/users";
import { Input } from "@/components/ui/input"; // Import Input
import { Label } from "@/components/ui/label"; // Import Label
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { Switch } from "@/components/ui/switch"; // *** IMPORT Switch ***
import { UserFormFooter } from "./user-footer"; // Import the footer
import { toast } from "sonner"; // Import toast for better feedback

interface UserFormProps {
  onSubmit: (data: Partial<User>) => void;
  initialData?: Partial<User>;
  onCancel: () => void; // Add onCancel prop for the footer
  isLoading?: boolean; // Add isLoading prop for the footer
}

export default function UserForm({
  onSubmit,
  initialData,
  onCancel, // Destructure onCancel
  isLoading = false, // Destructure isLoading with default
}: UserFormProps) {
  const { data: usersData } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(false);

    if (initialData) {
      setFormData({
        ...initialData,
        is_active: typeof initialData.is_active === 'boolean' ? initialData.is_active : true,
        role: initialData.role || "",
      });
      setIsEditMode(true);
    } else {
      setFormData({
        email: "",
        password: "",
        confirm_password: "",
        role: currentUserRole === "artist_manager" ? "artist" : "",
        is_active: true, // Default status is active (true)
      });
      setIsEditMode(false);
    }
  }, [initialData, currentUserRole]);

  // Keep existing handleChange for standard inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // No longer need special handling for is_active here
    setFormData({ ...formData, [name]: value });
  };

  // Specific handler for Shadcn Select components (now only for Role)
  const handleSelectChange = (name: string, value: string) => {
     // No longer need special handling for is_active here
     setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // *** ADDED: Handler specifically for the Switch component ***
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
  };

  // Updated handleSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (isLoading) return;

    let isValid = true;
    if (!formData.email) isValid = false;
    if (!isEditMode && (!formData.password || formData.password.length < 6)) isValid = false;
    if (!isEditMode && !formData.confirm_password) isValid = false;
    if (!isEditMode && formData.password !== formData.confirm_password) isValid = false;
    if (!formData.role) isValid = false;

    if (!isValid) {
        toast.error("Please fix the errors in the form.");
        return;
    }

    const dataToSubmit: Partial<User> = { ...formData };

    if (isEditMode || !dataToSubmit.password) {
      delete dataToSubmit.password;
      delete dataToSubmit.confirm_password;
    }

    // Ensure is_active is boolean (already should be from Switch)
    dataToSubmit.is_active = !!dataToSubmit.is_active;

    onSubmit(dataToSubmit);
  };

  // Keep existing helper function
  const isEditingArtist = () => {
    return isEditMode && formData.role === "artist";
  };

  const passwordsDoNotMatch = !isEditMode && formData.password && formData.confirm_password && formData.password !== formData.confirm_password;

  // Determine if the status switch should be disabled
  const isStatusDisabled = isLoading ||
    (isEditMode &&
      currentUserRole === "artist_manager" &&
      !isEditingArtist()); // Artist manager cannot change status of non-artists they didn't create

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* ID Field (Readonly) */}
      {isEditMode && formData.id && (
        <div className="space-y-2">
          <Label htmlFor="id">User ID</Label>
          <Input
            id="id"
            name="id"
            value={formData.id}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder="user@example.com"
          readOnly={isEditMode}
          className={isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}
          disabled={isLoading}
          required
        />
        {submitted && !formData.email && <p className="text-xs text-red-500 pt-1">Email is required.</p>}
      </div>

      {/* Password Fields (Create Mode Only) */}
      {!isEditMode && (
        <>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="******"
              disabled={isLoading}
              required
              minLength={6}
            />
            {submitted && (!formData.password || formData.password.length < 6) && <p className="text-xs text-red-500 pt-1">Password is required (min 6 characters).</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password || ""}
              onChange={handleChange}
              placeholder="******"
              disabled={isLoading}
              required
            />
            {submitted && !formData.confirm_password && <p className="text-xs text-red-500 pt-1">Confirm Password is required.</p>}
            {(submitted || (formData.password && formData.confirm_password)) && passwordsDoNotMatch && (
                <p className="text-xs text-red-500 pt-1">Passwords do not match.</p>
            )}
          </div>
        </>
      )}

      {/* --- Status Field (Using Switch) --- */}
      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
            <Label htmlFor="is_active">Status</Label>
            <p className="text-xs text-muted-foreground">
                Toggle user account status (Active/Inactive).
            </p>
        </div>
        <Switch
          id="is_active"
          name="is_active"
          checked={!!formData.is_active} // Ensure it's boolean for checked prop
          onCheckedChange={handleSwitchChange} // Use the specific handler
          disabled={isStatusDisabled} // Apply disabled logic
          aria-readonly={isStatusDisabled}
        />
      </div>
      {/* --- End Status Field --- */}


      {/* Role Field (Still using Select) */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          name="role"
          value={formData.role || ""}
          onValueChange={(value) => handleSelectChange("role", value)} // Use select handler
          disabled={
            isLoading ||
            (isEditMode && currentUserRole === "artist_manager")
          }
          required
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="artist">Artist</SelectItem>
            {currentUserRole === "super_admin" && (
              <SelectItem value="artist_manager">Artist Manager</SelectItem>
            )}
          </SelectContent>
        </Select>
         {submitted && !formData.role && <p className="text-xs text-red-500 pt-1">Role is required.</p>}
      </div>

      {/* Footer */}
      <UserFormFooter
        onCancel={onCancel}
        isLoading={isLoading}
        isUpdating={isEditMode}
      />
    </form>
  );
}
