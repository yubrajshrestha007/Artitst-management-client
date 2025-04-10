// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/data-table-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react"; // Assuming Loader2 might be needed for button state

interface DataTableHeaderProps {
  title: string;
  searchPlaceholder: string;
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  createButtonLabel: string;
  onCreate: () => void;
  showCreateButton: boolean;
  isActionLoading: boolean; // Combined loading state for create/update/delete affecting the create button
}

export const DataTableHeader = ({
  title,
  searchPlaceholder,
  searchTerm,
  onSearchChange,
  createButtonLabel,
  onCreate,
  showCreateButton,
  isActionLoading,
}: DataTableHeaderProps) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={onSearchChange}
            className="w-64 pl-8" // Adjust width as needed
            disabled={isActionLoading} // Optionally disable search during actions
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
        {showCreateButton && (
          <Button onClick={onCreate} disabled={isActionLoading}>
            {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {createButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
