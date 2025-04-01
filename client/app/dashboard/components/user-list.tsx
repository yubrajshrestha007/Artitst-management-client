// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-list.tsx
import { User } from "@/types/auth";
import { useDeleteUserMutation } from "@/shared/queries/users";

interface UserListProps {
  users: User[];
  title: string;
  onEdit?: (user: User) => void;
}

export default function UserList({ users, title, onEdit }: UserListProps) {
  const deleteUserMutation = useDeleteUserMutation();

  const handleDelete = (id: string) => {
    deleteUserMutation.mutate(id);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      {users.length > 0 ? (
        <ul className="list-disc list-inside">
          {users.map((user) => (
            <li key={user.id} className="flex items-center justify-between">
              {user.id}-{user.email} - {user.role}
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => onEdit(user)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No users found.</p>
      )}
    </div>
  );
}
