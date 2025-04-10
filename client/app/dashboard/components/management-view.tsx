// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-view.tsx
"use client";

import MusicList from "./music-list";
import { DataTableHeader } from "./data-header"; // Corrected import path
import { DataTable, ColumnDefinition } from "./data-table";
import { ArtistProfile, User, ManagerProfile } from "@/types/auth";

type DataItem = User | ArtistProfile | ManagerProfile;
type ManagementType = "user" | "artist" | "manager";

interface ManagementViewProps<T extends DataItem> {
  currentUserRole: string;
  type?: ManagementType;

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
  onView?: (item: T) => void; // Prop exists here
  isLoadingEdit?: boolean;
  isLoadingDelete?: boolean;
  managerMap?: Map<string, string>;
}

export const ManagementView = <T extends DataItem>({
  currentUserRole,
  type,
  title = "Management",
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
  onView, // Destructure onView here
  isLoadingEdit = false,
  isLoadingDelete = false,
  managerMap,
}: ManagementViewProps<T>) => {

  if (currentUserRole === "artist") {
    return <MusicList />;
  }

  if (type) {
    return (
      <>
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
          onView={onView} // <<< ADD THIS LINE
          isLoadingEdit={isLoadingEdit}
          isLoadingDelete={isLoadingDelete}
          currentUserRole={currentUserRole}
          itemType={type}
          managerMap={managerMap}
          searchTerm={searchTerm}
        />
      </>
    );
  }

  return <div>Select a management category from the sidebar.</div>;
};
