// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-form.tsx
import { User } from "@/types/auth";
import { useEffect, useState } from "react";
import { useUsersQuery } from "@/shared/queries/users";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserFormFooter } from "./user-footer";
import { toast } from "sonner";

interface UserFormProps {
  onSubmit: (data: Partial<User>) => void;
  initialData?: Partial<User>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function UserForm({
  onSubmit,
  initialData,
  onCancel,
  isLoading = false,
}: UserFormProps) {
  const { data: usersData } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- DEBUG LOG 1: Log initialData when the component receives it ---
  console.log("UserForm received initialData:", initialData);

  useEffect(() => {
    setSubmitted(false);

    if (initialData) {
      // --- DEBUG LOG 2: Log the role from initialData before setting state ---
      console.log("Setting state from initialData.role:", initialData.role);

      const newFormData = {
        ...initialData,
        is_active: typeof initialData.is_active === 'boolean' ? initialData.is_active : true,
        role: initialData.role || "", // Ensure role is set
      };
      setFormData(newFormData);
      setIsEditMode(true);

      // --- DEBUG LOG 3: Log the state immediately after setting it ---
      // Note: State updates might be async, this log might show the *next* render's state
      // console.log("State set in useEffect:", newFormData);
    } else {
      setFormData({
        email: "", password: "", confirm_password: "",
        role: currentUserRole === "artist_manager" ? "artist" : "",
        is_active: true,
      });
      setIsEditMode(false);
    }
  }, [initialData, currentUserRole]);

  // Handlers (handleChange, handleSelectChange, handleSwitchChange, handleSubmit) remain the same...
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { /* ... */ };
  const handleSelectChange = (name: string, value: string) => { /* ... */ };
  const handleSwitchChange = (checked: boolean) => { /* ... */ };
  const handleSubmit = (e: React.FormEvent) => { /* ... */ };
  const isEditingArtist = () => { /* ... */ };
  const passwordsDoNotMatch = !isEditMode && formData.password && formData.confirm_password && formData.password !== formData.confirm_password;
  const isStatusDisabled = isLoading || (isEditMode && currentUserRole === "artist_manager" && !isEditingArtist());

  // --- DEBUG LOG 4: Log formData right before rendering ---
  console.log("Rendering UserForm with formData:", formData);
  console.log("Rendering UserForm with formData.role:", formData.role);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* ... other form fields (ID, Email, Password, Status) ... */}

       {/* ID Field (Readonly) */}
       {isEditMode && formData.id && (
        <div className="space-y-2">
          <Label htmlFor="id">User ID</Label>
          <Input id="id" name="id" value={formData.id} readOnly className="bg-gray-100 cursor-not-allowed" disabled={isLoading} />
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" value={formData.email || ""} onChange={handleChange} placeholder="user@example.com" readOnly={isEditMode} className={isEditMode ? "bg-gray-100 cursor-not-allowed" : ""} disabled={isLoading} required />
        {submitted && !formData.email && <p className="text-xs text-red-500 pt-1">Email is required.</p>}
      </div>

      {/* Password Fields (Create Mode Only) */}
      {!isEditMode && (
        <>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input type="password" id="password" name="password" value={formData.password || ""} onChange={handleChange} placeholder="******" disabled={isLoading} required minLength={6} />
            {submitted && (!formData.password || formData.password.length < 6) && <p className="text-xs text-red-500 pt-1">Password is required (min 6 characters).</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input type="password" id="confirm_password" name="confirm_password" value={formData.confirm_password || ""} onChange={handleChange} placeholder="******" disabled={isLoading} required />
            {submitted && !formData.confirm_password && <p className="text-xs text-red-500 pt-1">Confirm Password is required.</p>}
            {(submitted || (formData.password && formData.confirm_password)) && passwordsDoNotMatch && (<p className="text-xs text-red-500 pt-1">Passwords do not match.</p>)}
          </div>
        </>
      )}

      {/* Status Field (Using Switch) */}
      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
            <Label htmlFor="is_active">Status</Label>
            <p className="text-xs text-muted-foreground">Toggle user account status (Active/Inactive).</p>
        </div>
        <Switch id="is_active" name="is_active" checked={!!formData.is_active} onCheckedChange={handleSwitchChange} disabled={isStatusDisabled} aria-readonly={isStatusDisabled} />
      </div>


      {/* Role Field (Still using Select) */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          name="role"
          // --- This value binding is crucial ---
          value={formData.role || ""}
          onValueChange={(value) => handleSelectChange("role", value)}
          disabled={
            isLoading ||
            (isEditMode && currentUserRole === "artist_manager")
          }
          required
        >
          <SelectTrigger id="role">
            {/* --- This displays the selected value or placeholder --- */}
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {/* --- Ensure these values exactly match the data --- */}
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

// --- Make sure handlers are defined (even if empty for brevity here) ---
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { /* ... */ };
const handleSelectChange = (name: string, value: string) => { /* ... */ };
const handleSwitchChange = (checked: boolean) => { /* ... */ };
const handleSubmit = (e: React.FormEvent) => { /* ... */ };
const isEditingArtist = () => { return false; /* ... */ };
// --- End handler definitions ---
