// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/data-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components
import {
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal, // Import the three dots icon
} from "lucide-react";
import { User, ArtistProfile, ManagerProfile } from "@/types/auth";
import { useMemo } from "react";

// Define a union type for the items the table can display
type DataItem = User | ArtistProfile | ManagerProfile;

// Define the structure for column definitions
export interface ColumnDefinition<T extends DataItem> {
  key: keyof T | string;
  label: string;
  render?: (item: T, managerMap?: Map<string, string>) => React.ReactNode;
}

interface DataTableProps<T extends DataItem> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onView?: (item: T) => void;
  isLoadingEdit: boolean;
  isLoadingDelete: boolean;
  currentUserRole: string;
  itemType: "user" | "artist" | "manager";
  managerMap?: Map<string, string>;
  searchTerm?: string;
}

const getNestedValue = (obj: unknown, path: string): unknown => {
  if (typeof obj !== 'object' || obj === null) {
    return undefined;
  }
  return path.split('.').reduce((acc, part) => acc && (acc as Record<string, unknown>)[part], obj);
};


export const DataTable = <T extends DataItem>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  isLoadingEdit,
  isLoadingDelete,
  currentUserRole,
  itemType,
  managerMap,
  searchTerm,
}: DataTableProps<T>) => {

  // --- Permissions ---
  const canEditThisType = useMemo(() => {
    if (currentUserRole === "super_admin") return true;
    if (currentUserRole === "artist_manager" && itemType === "artist") return true;
    return false;
  }, [currentUserRole, itemType]);

  const canDeleteThisType = useMemo(() => {
    if (currentUserRole === "super_admin") return true;
    if (currentUserRole === "artist_manager" && itemType === "artist") return true;
    return false;
  }, [currentUserRole, itemType]);

  // --- Combined Loading State for Actions ---
  const isActionLoading = isLoadingEdit || isLoadingDelete;

  // --- Cell Rendering Logic (remains the same) ---
  const renderCellContent = (item: T, column: ColumnDefinition<T>): React.ReactNode => {
    if (column.render) {
      return column.render(item, managerMap);
    }
    const value = getNestedValue(item, column.key as string);
    if (column.key === "is_active" && itemType === "user") {
      return value ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      );
    }
    if (column.key === "date_of_birth" && value) {
       try {
           const dateValue = typeof value === 'string' || typeof value === 'number' ? value : String(value);
           const date = new Date(dateValue);
           if (isNaN(date.getTime())) return "Invalid Date";
           return date.toLocaleDateString();
       } catch {
           return "Invalid Date";
       }
    }
    if (column.key === "manager_id_id" && itemType === "artist" && managerMap) {
        return managerMap.get(value as string ?? "") || "N/A";
    }
    if (value === null || typeof value === 'undefined') return "N/A";
    if (typeof value === 'boolean') return value ? "Yes" : "No";
    if (value instanceof Date && !isNaN(value.getTime())) return value.toLocaleString();
    return String(value);
  };


  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead key="sn">S.N.</TableHead>
            {columns.map((col) => (
              <TableHead key={String(col.key)}>{col.label}</TableHead>
            ))}
            {/* Keep Actions header, but content will change */}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 2}
                className="h-24 text-center"
              >
                No {itemType}s found
                {searchTerm ? " matching your search." : "."}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={item.id ?? index}>
                <TableCell key={`${item.id ?? index}-sn`}>{index + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell key={`${item.id ?? index}-${String(col.key)}`}>
                    {renderCellContent(item, col)}
                  </TableCell>
                ))}
                {/* --- MODIFIED ACTIONS CELL --- */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" disabled={isActionLoading}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* View Action */}
                      {onView && (
                        <DropdownMenuItem
                          onClick={() => onView(item)}
                          disabled={isActionLoading}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4 text-blue-500" />
                          View Details
                        </DropdownMenuItem>
                      )}

                      {/* Edit Action */}
                      {canEditThisType && (
                        <DropdownMenuItem
                          onClick={() => onEdit(item)}
                          disabled={isActionLoading}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                        </DropdownMenuItem>
                      )}

                      {/* Delete Action */}
                      {canDeleteThisType && (
                        <DropdownMenuItem
                          onClick={() => onDelete(item)}
                          disabled={isActionLoading}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                        </DropdownMenuItem>
                      )}

                      {/* Show message if no actions available */}
                      {!onView && !canEditThisType && !canDeleteThisType && (
                        <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                      )}

                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                {/* --- END MODIFIED ACTIONS CELL --- */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
export default DataTable;
