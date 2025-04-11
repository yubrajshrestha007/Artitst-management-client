// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-table.tsx
"use client";
import React, { useMemo, useState, useCallback } from "react";
import { Loader2, MoreHorizontal, Pencil, Trash2, Eye, CheckCircle, XCircle, Columns3 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  PaginationState,
  ColumnFiltersState,
  VisibilityState,
  Column, // Import Column type
} from "@tanstack/react-table";

// Shadcn UI Components
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
// --- Import Select Components ---
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Local Components & Hooks
import { ManagementModals } from "./management-modal";
import { DataTableHeader } from "./data-header";
import { getManagementConfig } from "./management-colums";
import { useManagementData } from "@/hooks/use-management";
import { useManagementMutations } from "@/hooks/use-management-mutation";
import { useManagementModals } from "@/hooks/use-management-modal";
import { ArtistProfile, User, ManagerProfile, Music } from "@/types/auth";
import { ItemDetailModal } from "./item-detail-modal";
import { ItemType } from "./data-view-modal";

// Define DataItem union type to include Music
type DataItem = User | ArtistProfile | ManagerProfile | Music;
type CreateData = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile> | Partial<Music>;
type UpdateDataInput = Partial<User> | Partial<ArtistProfile> | Partial<ManagerProfile> | Partial<Music>;

// --- Define Filter Options ---
const ROLE_OPTIONS_ALL = [ // For Super Admin
  { value: "artist", label: "Artist" },
  { value: "artist_manager", label: "Artist Manager" },
];
const ROLE_OPTIONS_MANAGER = [ // For Artist Manager (can only see/filter artists)
    { value: "artist", label: "Artist" },
];

// Get GENRE_CHOICES (assuming they are defined elsewhere, e.g., music-form or constants)
const GENRE_CHOICES = ["rnb", "country", "classic", "rock", "jazz", "pop"] as const;
const GENRE_OPTIONS = GENRE_CHOICES.map(genre => ({
    value: genre,
    label: genre.charAt(0).toUpperCase() + genre.slice(1)
}));
// --- End Filter Options ---


// Helper to get nested values (can be moved to utils)
const getNestedValue = (obj: unknown, path: string): unknown => {
    if (typeof obj !== 'object' || obj === null) return undefined;
    return path.split('.').reduce((acc, part) => acc && (acc as Record<string, unknown>)[part], obj);
};

// Format date for display in the table (can be moved to utils)
const formatDateForDisplay = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return "Invalid Date";
  }
};

// --- Reusable Select Filter Component ---
interface SelectFilterProps {
    column: Column<DataItem, unknown>;
    title: string;
    options: { value: string; label: string }[];
}

const SelectColumnFilter: React.FC<SelectFilterProps> = ({ column, title, options }) => {
    const filterValue = (column.getFilterValue() ?? '') as string;
    const ALL_VALUE = "__ALL__"; // Define a unique, non-empty value for the "All" option

    return (
        <Select
            value={filterValue || ALL_VALUE}
            onValueChange={(value) => {
                column.setFilterValue(value === ALL_VALUE ? undefined : value);
            }}
        >
            <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder={`Filter ${title}...`} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ALL_VALUE}>All {title}s</SelectItem>
                {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
// --- End Select Filter Component ---


interface UserManagementTableProps {
  currentUserRole: string;
  type?: "user" | "artist" | "manager" | "music";
  filteredData?: ArtistProfile[];
  musicData?: Music[];
  onMusicEdit?: (music: Music) => void;
  onMusicDelete?: (music: Music) => void;
  onMusicView?: (music: Music) => void;
  onMusicCreate?: () => void;
  isLoadingMusicEdit?: boolean;
  isLoadingMusicDelete?: boolean;
}

export default function UserManagementTable({
  currentUserRole,
  type,
  filteredData,
  musicData,
  onMusicEdit,
  onMusicDelete,
  onMusicView,
  onMusicCreate,
  isLoadingMusicEdit = false,
  isLoadingMusicDelete = false,
}: UserManagementTableProps) {
  // --- Hooks ---
  const {
    dataToDisplay: managementDataToDisplay,
    managerMap,
    isLoadingQueries,
  } = useManagementData(type !== 'music' ? type : undefined, filteredData);

  const {
    isModalOpen,
    isDeleteDialogOpen,
    selectedItem,
    isCreating,
    isUpdating,
    handleOpenModalForEdit: handleOpenManagementModalForEdit,
    handleOpenModalForCreate: handleOpenManagementModalForCreate,
    handleCloseModal: handleCloseManagementModal,
    handleDeleteRequest: handleManagementDeleteRequest,
    cancelDelete: cancelManagementDelete,
    resetModalState,
  } = useManagementModals();

  const {
    submitMutation,
    deleteMutation,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    isMutating: isManagementMutating,
  } = useManagementMutations(type !== 'music' ? type : undefined, {
    onSuccess: () => { resetModalState(); },
    onDeleteSettled: () => { resetModalState(); },
  });

  // --- State for TanStack Table ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // --- State for Detail Modal ---
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [itemForDetail, setItemForDetail] = useState<DataItem | null>(null);

  // --- Config ---
  const { title: managementTitle, createLabel: managementCreateLabel } = useMemo(() => getManagementConfig(type !== 'music' ? type : undefined), [type]);
  const title = type === 'music' ? 'My Music' : managementTitle;
  const createLabel = type === 'music' ? 'Create Music' : managementCreateLabel;
  const showCreateButton = type === 'music' ? currentUserRole === 'artist' :
                           (currentUserRole === "super_admin" || (currentUserRole === "artist_manager" && type === "manager"));
  const searchPlaceholder = `Search all columns...`;

  // --- Permissions ---
  const canEditThisType = useMemo(() => {
    if (type === 'music' && currentUserRole === 'artist') return true;
    if (currentUserRole === "super_admin") return true;
    if (currentUserRole === "artist_manager" && type === "artist") return true;
    return false;
  }, [currentUserRole, type]);

  const canDeleteThisType = useMemo(() => {
    if (type === 'music' && currentUserRole === 'artist') return true;
    if (currentUserRole === "super_admin") return true;
    if (currentUserRole === "artist_manager" && type === "artist") return true;
    return false;
  }, [currentUserRole, type]);

  // --- Combined Loading State ---
  const isMutating = type === 'music' ? (isLoadingMusicEdit || isLoadingMusicDelete) : isManagementMutating;
  const isLoading = type === 'music' ? false : isLoadingQueries;

  // --- Handlers ---
  const handleManagementFormSubmit = useCallback(async (data: CreateData | UpdateDataInput) => {
    if (type === 'music') return;
    try { await submitMutation(data, isCreating, selectedItem?.id); }
    catch (error) { console.error("Submit mutation failed:", error); }
  }, [submitMutation, isCreating, selectedItem, type]);

  const confirmManagementDelete = useCallback(() => {
    if (type === 'music') return;
    if (selectedItem?.id) { deleteMutation(selectedItem.id); }
  }, [deleteMutation, selectedItem, type]);

  const handleViewDetails = useCallback((item: DataItem) => {
    setItemForDetail(item);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setItemForDetail(null);
  }, []);

  const handleEdit = useCallback((item: DataItem) => {
    if (type === 'music' && onMusicEdit) {
      onMusicEdit(item as Music);
    } else if (type !== 'music') {
      handleOpenManagementModalForEdit(item);
    }
  }, [type, onMusicEdit, handleOpenManagementModalForEdit]);

  const handleDelete = useCallback((item: DataItem) => {
    if (type === 'music' && onMusicDelete) {
      onMusicDelete(item as Music);
    } else if (type !== 'music') {
      handleManagementDeleteRequest(item);
    }
  }, [type, onMusicDelete, handleManagementDeleteRequest]);

  const handleCreate = useCallback(() => {
      if (type === 'music' && onMusicCreate) {
          onMusicCreate();
      } else if (type !== 'music') {
          handleOpenManagementModalForCreate();
      } else {
          console.warn("onMusicCreate handler not provided for music type.");
      }
  }, [type, onMusicCreate, handleOpenManagementModalForCreate]);


  // --- TanStack Table Column Definitions ---
  const columns = useMemo<ColumnDef<DataItem, any>[]>(() => {
    let baseColumns: ColumnDef<DataItem, any>[] = [];

    // Define columns based on type (User)
    if (type === "user") {
      baseColumns = [
        { accessorKey: "email", header: "Email", enableColumnFilter: false, enableSorting: true }, // Filter disabled
        {
            accessorKey: "role",
            header: "Role",
            enableColumnFilter: true, // Filter enabled
            enableSorting: true,
            filterFn: 'equalsString',
        },
        {
          accessorKey: "is_active",
          header: "Status",
          cell: ({ row }) => {
            const isActive = row.original.is_active;
            return isActive ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            );
          },
          enableColumnFilter: false, // Filter disabled
          enableSorting: true,
        },
      ];
    }
    // Define columns based on type (Artist)
    else if (type === "artist") {
      baseColumns = [
        { accessorKey: "name", header: "Name", enableColumnFilter: false, enableSorting: true }, // Filter disabled
        { accessorKey: "gender", header: "Gender", enableColumnFilter: false, enableSorting: true }, // Filter disabled
        { accessorKey: "address", header: "Address", enableColumnFilter: false, enableSorting: true }, // Filter disabled
        {
          accessorKey: "date_of_birth",
          header: "Date of Birth",
          cell: ({ row }) => {
            const dob = (row.original as ArtistProfile).date_of_birth;
            if (!dob) return "N/A";
            try { return new Date(dob).toLocaleDateString(); }
            catch { return "Invalid Date"; }
          },
          enableColumnFilter: false, // Filter disabled
          enableSorting: true,
        },
        {
            accessorKey: "first_release_year",
            header: "Release Yr",
            enableColumnFilter: false, // <<< Filter disabled for Release Year
            enableSorting: true,
        },
        {
          accessorKey: "manager_id_id",
          header: "Manager",
          cell: ({ row }) => {
            const managerId = (row.original as ArtistProfile).manager_id_id;
            return managerMap?.get(managerId ?? "") || <Badge variant="secondary">None</Badge>;
          },
          enableColumnFilter: false, // Filter disabled
          enableSorting: true,
        },
        { accessorKey: "no_of_albums_released", header: "Albums", enableColumnFilter: false, enableSorting: true }, // Filter disabled
      ];
    }
    // Define columns based on type (Manager)
    else if (type === "manager") {
      baseColumns = [
        { accessorKey: "name", header: "Name", enableColumnFilter: false, enableSorting: true }, // Filter disabled
        {
          accessorKey: "managedArtistNames",
          header: "Managed Artists",
          cell: ({ row }) => {
            const names = (row.original as any)?.managedArtistNames; // Use 'any' or type assertion
            if (!names || names.length === 0) {
              return <span className="text-xs text-muted-foreground">None</span>;
            }
            return (
              <div className="flex flex-wrap gap-1">
                {names.map((name: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {name}
                  </Badge>
                ))}
              </div>
            );
          },
          enableColumnFilter: false, // Filter disabled
          enableSorting: false,
        },
        { accessorKey: "company_name", header: "Company", enableColumnFilter: false, enableSorting: true }, // Filter disabled
        { accessorKey: "company_email", header: "Company Email", enableColumnFilter: false, enableSorting: true }, // Filter disabled
      ];
    }
    // Define columns based on type (Music)
    else if (type === "music") {
        baseColumns = [
            { accessorKey: "title", header: "Title", enableColumnFilter: false, enableSorting: true }, // Filter disabled
            { accessorKey: "album_name", header: "Album Name", enableColumnFilter: false, enableSorting: true }, // Filter disabled
            {
                accessorKey: "genre",
                header: "Genre",
                cell: ({ row }) => {
                    const genre = (row.original as Music).genre;
                    return genre ? <Badge variant="outline">{genre.charAt(0).toUpperCase() + genre.slice(1)}</Badge> : "N/A";
                },
                enableColumnFilter: true, // Filter enabled
                enableSorting: true,
                filterFn: 'equalsString',
            },
            {
                accessorKey: "release_date",
                header: "Release Date",
                cell: ({ row }) => formatDateForDisplay((row.original as Music).release_date),
                enableColumnFilter: false, // Filter disabled
                enableSorting: true,
            },
        ];
    }


    // Add Actions column to all types
    return [
      ...baseColumns,
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const item = row.original;
          const isActionLoading = type === 'music' ? (isLoadingMusicEdit || isLoadingMusicDelete) : isManagementMutating;

          return (
            <div className="text-right">
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
                  <DropdownMenuItem onClick={() => handleViewDetails(item)} disabled={isActionLoading} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4 text-blue-500" /> View Details
                  </DropdownMenuItem>
                  {canEditThisType && (
                    <DropdownMenuItem onClick={() => handleEdit(item)} disabled={isActionLoading} className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" /> Edit {type?.charAt(0).toUpperCase() + type!.slice(1)}
                    </DropdownMenuItem>
                  )}
                  {canDeleteThisType && (
                    <DropdownMenuItem onClick={() => handleDelete(item)} disabled={isActionLoading} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete {type?.charAt(0).toUpperCase() + type!.slice(1)}
                    </DropdownMenuItem>
                  )}
                  {!canEditThisType && !canDeleteThisType && (
                    <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableColumnFilter: false, // Actions column never has filter
        enableSorting: false,
      },
    ];
  }, [
      type, managerMap, isManagementMutating, isLoadingMusicEdit, isLoadingMusicDelete,
      canEditThisType, canDeleteThisType, handleViewDetails, handleEdit, handleDelete, currentUserRole
    ]);


  // --- TanStack Table Instance ---
  const data = useMemo(() => {
      return type === 'music' ? (musicData ?? []) : (managementDataToDisplay ?? []);
  }, [type, musicData, managementDataToDisplay]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });


  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* --- Header (Search, Create Button, Column Visibility) --- */}
      <div className="flex items-center justify-between gap-4">
        <DataTableHeader
          title={title}
          searchPlaceholder={searchPlaceholder}
          searchTerm={globalFilter}
          onSearchChange={(e) => setGlobalFilter(e.target.value)}
          createButtonLabel={createLabel}
          onCreate={handleCreate}
          showCreateButton={showCreateButton}
          isActionLoading={isMutating}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Columns3 className="mr-2 h-4 w-4" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {/* Use header string or fallback to ID */}
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id.replace(/_/g, ' ')}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>


      {/* --- TanStack Table Rendering --- */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center' : 'flex items-center'}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <span className="ml-1">🔼</span>,
                          desc: <span className="ml-1">🔽</span>,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                    {/* --- MODIFIED: Column Filter Rendering --- */}
                    {/* Only render filter UI if the column ID and type match the allowed ones */}
                    {header.column.getCanFilter() && (
                      <div className="mt-1">
                        {/* Role Filter (User) */}
                        {header.column.id === 'role' && type === 'user' ? (
                          <SelectColumnFilter
                              column={header.column}
                              title="Role"
                              options={currentUserRole === 'super_admin' ? ROLE_OPTIONS_ALL : ROLE_OPTIONS_MANAGER}
                          />
                        /* Genre Filter (Music) */
                        ) : header.column.id === 'genre' && type === 'music' ? (
                          <SelectColumnFilter column={header.column} title="Genre" options={GENRE_OPTIONS} />
                        /* --- REMOVED Release Year Filter --- */
                        // ) : header.column.id === 'first_release_year' && type === 'artist' ? (
                        //   <Input ... />
                        ) : null /* Render nothing for any other filterable columns */}
                      </div>
                    )}
                    {/* --- END MODIFIED FILTER --- */}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
             {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found{globalFilter || columnFilters.length > 0 ? " matching your filters." : "."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination Controls --- */}
       <div className="flex items-center justify-between space-x-2 py-4">
         <div className="flex-1 text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()} ({table.getFilteredRowModel().rows.length} total rows)
         </div>
         <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                {'<<'} First
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                {'<'} Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next {'>'}
            </Button>
             <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                Last {'>>'}
            </Button>
         </div>
      </div>

      {/* --- Modals --- */}
       {type !== 'music' && (
          <ManagementModals
            isModalOpen={isModalOpen}
            isDeleteDialogOpen={isDeleteDialogOpen}
            type={type} // Pass the non-music type
            isCreating={isCreating}
            isUpdating={isUpdating}
            selectedItem={selectedItem}
            isLoadingCreate={isLoadingCreate}
            isLoadingUpdate={isLoadingUpdate}
            isLoadingDelete={isLoadingDelete}
            onCloseModal={handleCloseManagementModal} // Use management handler
            onCloseDeleteModal={cancelManagementDelete} // Use management handler
            onConfirmDelete={confirmManagementDelete} // Use management handler
            onSubmit={handleManagementFormSubmit} // Use management handler
            currentUserId={type === 'artist' ? (selectedItem as ArtistProfile)?.user_id : undefined}
          />
      )}

      {/* --- Detail Modal (Common for all types) --- */}
      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal} // Use common handler
        item={itemForDetail}
        itemType={type as ItemType | null} // Pass the current type
        managerMap={managerMap} // Pass managerMap (only relevant for artist details)
      />
    </div>
  );
}
