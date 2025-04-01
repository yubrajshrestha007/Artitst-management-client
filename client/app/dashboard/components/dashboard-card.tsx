// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/dashboard-card.tsx
import { useUsersQuery } from "@/shared/queries/users";

export default function DashboardCards() {
  const { data: usersData } = useUsersQuery();

  const users = usersData?.users || [];
  const currentUserRole = usersData?.currentUserRole || "";
  const artistCount = users.filter((user) => user.role === "artist").length;
  const artistManagerCount = users.filter(
    (user) => user.role === "artist_manager"
  ).length;

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      {/* Artist Card */}
      <div className="bg-blue-100 border border-blue-300 aspect-video rounded-xl p-4 flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-blue-700">Artists</h3>
        <p className="text-blue-500">Number of Artists: {artistCount}</p>
      </div>

      {/* Artist Manager Card (Conditional) */}
      {currentUserRole === "super_admin" && (
        <div className="bg-green-100 border border-green-300 aspect-video rounded-xl p-4 flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-green-700">
            Artist Managers
          </h3>
          <p className="text-green-500">
            Number of Artist Managers: {artistManagerCount}
          </p>
        </div>
      )}
      {/* Total Artist Card (Conditional) */}
      {currentUserRole === "artist_manager" && (
        <div className="bg-purple-100 border border-purple-300 aspect-video rounded-xl p-4 flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-purple-700">
            Total Artists
          </h3>
          <p className="text-purple-500">
            Total Artists: {artistCount}
          </p>
        </div>
      )}

      {/* Total User Card (Conditional) */}
      {currentUserRole === "super_admin" && (
        <div className="bg-yellow-100 border border-yellow-300 aspect-video rounded-xl p-4 flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-yellow-700">Total Users</h3>
          <p className="text-yellow-500">Total Users: {users.length}</p>
        </div>
      )}
    </div>
  );
}
