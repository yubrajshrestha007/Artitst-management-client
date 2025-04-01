// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-form.tsx
import { User } from "@/types/auth";
import { useEffect, useState } from "react";
import { useUsersQuery } from "@/shared/queries/users";

interface UserFormProps {
  onSubmit: (data: Partial<User>) => void;
  initialData?: Partial<User>;
}

export default function UserForm({ onSubmit, initialData }: UserFormProps) {
  const { data: usersData } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsEditMode(true);
    } else {
      setFormData({
        role: currentUserRole === "artist_manager" ? "artist" : "",
      });
      setIsEditMode(false);
    }
  }, [initialData, currentUserRole]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include all data in the dataToSubmit object
    const dataToSubmit: Partial<User> = { ...formData };

    // Remove password and confirm_password if in edit mode
    if (isEditMode) {
      delete dataToSubmit.password;
      delete dataToSubmit.confirm_password;
    }

    onSubmit(dataToSubmit);
  };

  // Helper function to check if the user being edited is an artist
  const isEditingArtist = () => {
    return isEditMode && formData.role === "artist";
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {formData.id && (
        <div>
          <label htmlFor="id">Id</label>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            readOnly
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>
      )}
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
          readOnly={isEditMode}
        />
      </div>
      {!isEditMode && (
        <>
          <div>
            <label htmlFor="name">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="name">confirm Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password || ""}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
        </>
      )}
      <div>
        <label htmlFor="is_active">Status</label>
        <select
          id="is_active"
          name="is_active"
          value={
            formData.is_active !== undefined
              ? formData.is_active.toString()
              : ""
          }
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
          // Updated disabled condition
          disabled={
            isEditMode &&
            currentUserRole === "artist_manager" &&
            !isEditingArtist()
          }
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      <div>
        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={formData.role || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
          disabled={isEditMode && currentUserRole === "artist_manager"}
        >
          <option value="">Select a role</option>
          <option value="artist">Artist</option>
          {currentUserRole === "super_admin" && (
            <>
              <option value="artist_manager">Artist Manager</option>
            </>
          )}
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}
