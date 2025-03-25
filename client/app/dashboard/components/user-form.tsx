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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        role: currentUserRole === "artist_manager" ? "artist" : "",
      });
    }
  }, [initialData, currentUserRole]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
        />
      </div>
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
      <div>
        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={formData.role || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        >
          <option value="">Select a role</option>
          <option value="artist">Artist</option>
          <option value="artist_manager">Artist Manager</option>
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
