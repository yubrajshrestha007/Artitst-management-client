// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-view.tsx
"use client";

import MusicList from "./music-list";
import { DataTableHeader } from "./data-header"; // Import the header
import { DataTable, ColumnDefinition } from "./data-table"; // Import the table
import { ArtistProfile, User, ManagerProfile } from "@/types/auth";

type DataItem = User | ArtistProfile | ManagerProfile;
type ManagementType = "user" | "artist" | "manager";

interface ManagementViewProps<T extends DataItem> {
  currentUserRole: string;
  type?: ManagementType; // Type might be undefined initially

  title?: string;
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  createButtonLabel?: string;
  onCreate?: () => void;
  showCreateButton?: boolean;
  isActionLoading?: boolean;
  data?: T[];
  columns?: ColumnDefinition<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isLoadingEdit?: boolean;
  isLoadingDelete?: boolean;
  managerMap?: Map<string, string>;
}

export const ManagementView = <T extends DataItem>({
  currentUserRole,
  type,
  // Destructure all potential props
  title = "Management", // Default title
  searchPlaceholder = "Search...",
  searchTerm = "",
  onSearchChange = () => {},
  createButtonLabel = "Create",
  onCreate = () => {},
  showCreateButton = false,
  isActionLoading = false,
  data = [],
  columns = [],
  onEdit = () => {},
  onDelete = () => {},
  isLoadingEdit = false,
  isLoadingDelete = false,
  managerMap,
}: ManagementViewProps<T>) => {

  // Artist View
  if (currentUserRole === "artist") {
    return <MusicList />;
  }

  // Other roles with a selected type - Render Header and Table directly
  if (type) {
    return (
      <> {/* Use a fragment to group Header and Table */}
        <DataTableHeader
          title={title}
          searchPlaceholder={searchPlaceholder}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          createButtonLabel={createButtonLabel}
          onCreate={onCreate}
          showCreateButton={showCreateButton}
          isActionLoading={isActionLoading}
        />
        <DataTable
          data={data}
          columns={columns}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoadingEdit={isLoadingEdit}
          isLoadingDelete={isLoadingDelete}
          currentUserRole={currentUserRole}
          itemType={type} // Pass the specific type
          managerMap={managerMap}
          searchTerm={searchTerm} // Pass searchTerm for empty state message
        />
      </>
    );
  }

  return <div>Select a management category from the sidebar.</div>;
};
