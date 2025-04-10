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
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { User, ArtistProfile, ManagerProfile } from "@/types/auth"; // Import necessary types

// Define a union type for the items the table can display
type DataItem = User | ArtistProfile | ManagerProfile;

// Define the structure for column definitions
export interface ColumnDefinition<T extends DataItem> {
  key: keyof T | string; // Allow string for custom keys like 'manager_name' or 'sn'
  label: string;
  render?: (item: T, managerMap?: Map<string, string>) => React.ReactNode; // Optional custom render function
}

interface DataTableProps<T extends DataItem> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  isLoadingEdit: boolean;
  isLoadingDelete: boolean;
  currentUserRole: string;
  itemType: "user" | "artist" | "manager"; // Type of item being displayed
  managerMap?: Map<string, string>; // Optional manager map for artist table
  searchTerm?: string; // Optional search term for empty state message
}

const getNestedValue = (obj: unknown, path: string): unknown => {
  return path.split('.').reduce((acc, part) => acc && (acc as Record<string, unknown>)[part], obj);
};


export const DataTable = <T extends DataItem>({
  data,
  columns,
  onEdit,
  onDelete,
  isLoadingEdit,
  isLoadingDelete,
  currentUserRole,
  itemType,
  managerMap,
  searchTerm,
}: DataTableProps<T>) => {

  const canEdit = (item: T): boolean => {
    // Super Admin can edit anything
    if (currentUserRole === "super_admin") return true;
    // Artist Manager can edit Artists
    if (currentUserRole === "artist_manager" && itemType === "artist") return true;
    // Add other specific edit rules if needed
    return false;
  };

  const canDelete = (item: T): boolean => {
     // Only Super Admin can delete
     return currentUserRole === "super_admin";
  };

  const renderCellContent = (item: T, column: ColumnDefinition<T>): React.ReactNode => {
    // Use custom render function if provided
    if (column.render) {
      return column.render(item, managerMap);
    }

    // Default rendering logic based on key
    const value = getNestedValue(item, column.key as string);

    // Specific formatting for known keys/types
    if (column.key === "is_active" && itemType === "user") {
      return value ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      );
    }
    if (column.key === "date_of_birth" && value) {
       try {
           return new Date(value as string).toLocaleDateString();
       } catch {
           return "Invalid Date";
       }
    }
    if (column.key === "manager_id_id" && itemType === "artist" && managerMap) {
        return managerMap.get(value as string ?? "") || "N/A";
    }

    // Fallback for other types
    if (value === null || typeof value === 'undefined') return "N/A";
    if (typeof value === 'boolean') return value ? "Yes" : "No";
    if (value instanceof Date) return value.toLocaleString();

    return String(value);
  };


  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Add S.N. Header */}
            <TableHead key="sn">S.N.</TableHead>
            {columns.map((col) => (
              <TableHead key={String(col.key)}>{col.label}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 2} // S.N. + Columns + Actions
                className="h-24 text-center"
              >
                No {itemType}s found
                {searchTerm ? " matching your search." : "."}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={item.id ?? index}>
                {/* Add S.N. Cell */}
                <TableCell key={`${item.id ?? index}-sn`}>{index + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell key={`${item.id ?? index}-${String(col.key)}`}>
                    {renderCellContent(item, col)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {canEdit(item) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        title={`Edit ${itemType}`}
                        disabled={isLoadingEdit || isLoadingDelete} // Disable both during any action
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete(item) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                        title={`Delete ${itemType}`}
                        disabled={isLoadingEdit || isLoadingDelete} // Disable both during any action
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
export default DataTable;
